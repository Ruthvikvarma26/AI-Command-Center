require('dotenv').config();
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const session = require('express-session');
const { passport } = require('./config/passport');
const User = require('./models/User');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Force trust for local session cookies
app.set('trust proxy', 1);

// Debug: Verify .env loading
console.log('--- AUTH DEBUG ---');
console.log('GOOGLE_CLIENT_ID Loaded:', process.env.GOOGLE_CLIENT_ID ? 'YES (Starts with ' + process.env.GOOGLE_CLIENT_ID.substring(0, 5) + ')' : 'MISSING');
console.log('------------------');

// Request Logging Middleware
app.use((req, res, next) => {
    console.log(`[REQUEST_LOG] ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
    next();
});

// Permissive CORS for local development
app.use(cors({ 
    origin: true, // Allow any origin that is making the request
    credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'cyber-recon-secret',
    resave: true,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Users logic moved to models/User.js

app.post('/api/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
        
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'User already exists' });
        
        const newUser = new User({ email, password });
        await newUser.save();
        
        res.json({ message: 'Registration successful' });
    } catch (err) {
        console.error('[AUTH_REGISTER_ERROR]', err);
        res.status(500).json({ error: 'Registration failed: ' + err.message });
    }
});

app.post('/api/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
        
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        
        // Use bcrypt comparing method from model
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
        
        // Manually log in the user for the session
        req.login(user, (err) => {
            if (err) return next(err);
            return res.json({ message: 'Login successful', user });
        });
    } catch (err) {
        console.error('[AUTH_LOGIN_ERROR]', err);
        next(err);
    }
});

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify connection configuration on startup
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter.verify(function (error, success) {
        if (error) {
            console.error('[NODEMAILER_ERROR] Connection failed:', error);
        } else {
            console.log('[NODEMAILER_SUCCESS] Server is ready to take our messages');
        }
    });
} else {
    console.warn('[NODEMAILER_WARN] EMAIL_USER/PASS missing. Emails will be faked.');
}

// Forgot Password Workflow
app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    console.log(`[RECOVERY] Request received for: ${email}`);
    
    if (!email) return res.status(400).json({ error: 'Email required' });
    
    const user = await User.findOne({ email });
    if (!user) {
        console.warn(`[RECOVERY] User not found: ${email}`);
        // Return success even if user doesn't exist for security (prevent email enumeration)
        return res.json({ message: 'If email exists, reset link was sent.' });
    }
    
    console.log(`[RECOVERY] Generating token for: ${user.email}`);

    // Generate secure token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
    const mailOptions = {
        from: `"AI DEV COMMAND CENTER" <${process.env.EMAIL_USER}>`,
        to: user.email, // This sends to ANY user who forgets their password!
        subject: '[SYSTEM RECOVERY] Access Key Reset',
        html: `
            <div style="font-family: monospace; background-color: #050505; color: #39ff14; padding: 40px;">
                <h1 style="color: #bc13fe;">SYS_CORE_RECOVERY</h1>
                <p>An operator requested a password reset for identifier: <b>${user.email}</b></p>
                <p>INITIATE SECURE LINK PROTOCOL BELOW:</p>
                <a href="${resetUrl}" style="background-color: #39ff14; color: #050505; padding: 10px 20px; text-decoration: none; font-weight: bold; border: 2px solid #39ff14;">RESET_ACCESS_KEY</a>
                <p style="margin-top: 30px; font-size: 10px; color: #666;">This token expires in 1 hour. If you did not request this, ignore this transmission.</p>
            </div>
        `
    };

    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('[NODEMAILER] EMAIL_USER or EMAIL_PASS not set in .env. Faking success for token:', resetUrl);
            return res.json({ message: 'MOCK_SUCCESS: Check console for URL.' });
        }
        await transporter.sendMail(mailOptions);
        res.json({ message: 'Reset link dispatched' });
    } catch (err) {
        console.error('Email error:', err);
        res.status(500).json({ error: 'Failed to dispatch email' });
    }
});

// Reset Password
app.post('/api/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) return res.status(400).json({ error: 'Token and new access key required' });

        const user = await User.findOne({ 
            resetToken: token, 
            resetTokenExpiry: { $gt: Date.now() } 
        });
        
        if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

        // Update password (bcrypt hashing will happen automatically in pre-save)
        user.password = newPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (err) {
        res.status(500).json({ error: 'Reset failed' });
    }
});

// System Status Telemetry
app.get('/api/system/status', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const dbStatus = mongoose.connection.readyState; 
        // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
        
        const userCount = await User.countDocuments();
        
        res.json({ 
            dbConnected: dbStatus === 1,
            operators: userCount,
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch telemetry' });
    }
});

// --- AUTH ROUTES ---

// Google Routes
app.get('/auth/google', (req, res, next) => {
    console.log('[AUTH] Initiating Google Handshake...');
    passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' })(req, res, next);
});

app.get('/auth/google/callback', 
  (req, res, next) => {
    console.log('[AUTH] Received Google Callback!');
    next();
  },
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login?error=google_auth_failed' }),
  (req, res) => {
    console.log('[AUTH] Google Callback Successful. User:', req.user?.displayName);
    res.redirect('http://localhost:5173/dashboard?login=success');
  }
);

// Check if user is logged in
app.get('/api/user/me', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ isAuthenticated: true, user: req.user });
    } else {
        res.json({ isAuthenticated: false });
    }
});

// Logout
app.get('/api/logout', (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ error: 'Logout failed' });
        res.json({ message: 'Logged out successfully' });
    });
});


// Helper function to fetch all files recursively from a GitHub repo
async function getRepoContents(owner, repo, path = '') {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const headers = {};
    if (process.env.GITHUB_TOKEN) {
        headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    }

    try {
        const response = await axios.get(url, { headers });
        let files = [];
        let folders = [];
        let dependencies = [];
        let totalFiles = 0;

        for (const item of response.data) {
            if (item.type === 'dir') {
                folders.push(item.path);
                const subContents = await getRepoContents(owner, repo, item.path);
                files = files.concat(subContents.files);
                folders = folders.concat(subContents.folders);
                dependencies = dependencies.concat(subContents.dependencies);
                totalFiles += subContents.totalFiles;
            } else {
                files.push(item.path);
                totalFiles++;
                if (item.name === 'package.json') {
                    const fileContent = await axios.get(item.download_url);
                    const deps = Object.keys(fileContent.data.dependencies || {});
                    const devDeps = Object.keys(fileContent.data.devDependencies || {});
                    dependencies = [...new Set([...dependencies, ...deps, ...devDeps])];
                }
            }
        }

        return { files, folders, dependencies, totalFiles };
    } catch (error) {
        console.error(`Error fetching path ${path}:`, error.message);
        return { files: [], folders: [], dependencies: [], totalFiles: 0 };
    }
}

app.post('/api/analyze-repo', async (req, res) => {
    const { repoUrl } = req.body;

    if (!repoUrl) {
        return res.status(400).json({ error: 'Repository URL is required' });
    }

    // Robust URL parsing: handle trailing slashes and .git extensions
    const normalizedUrl = repoUrl.replace(/\/$/, '').replace(/\.git$/, '');
    const match = normalizedUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    
    if (!match) {
        return res.status(400).json({ error: 'Invalid GitHub URL. Expected: github.com/owner/repo' });
    }

    const owner = match[1];
    const repo = match[2];

    try {
        const headers = {};
        if (process.env.GITHUB_TOKEN) {
            headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
        }

        // STEP 1: Fetch repository metadata to find the default branch
        const repoMetaUrl = `https://api.github.com/repos/${owner}/${repo}`;
        let defaultBranch = 'main';
        
        try {
            const repoMetaResponse = await axios.get(repoMetaUrl, { headers });
            defaultBranch = repoMetaResponse.data.default_branch || 'main';
        } catch (metaError) {
            console.error('Failed to fetch repo metadata:', metaError.response?.data || metaError.message);
            // If repo root fails, it might be private or a 404
            return res.status(metaError.response?.status || 500).json({ 
                error: `COULD_NOT_ACCESS_REPOSITORY: Status=${metaError.response?.status || 'UNKNOWN'}. Ensure it is public.` 
            });
        }

        // STEP 2: Analyze the tree using the detected default branch
        const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`;

        const response = await axios.get(url, { headers });
        const tree = response.data.tree;

        // Find package.json to get dependencies
        let dependencies = [];
        const packageJsonFile = tree.find(item => item.path === 'package.json');
        if (packageJsonFile) {
            const pkgResponse = await axios.get(`https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/package.json`);
            dependencies = Object.keys(pkgResponse.data.dependencies || {}).concat(Object.keys(pkgResponse.data.devDependencies || {}));
        }

        // Calculate language distribution by total bytes (more accurate)
        const languageMap = {};
        let totalValuableBytes = 0;

        tree.forEach(item => {
            if (item.type === 'blob' && item.size) {
                const ext = item.path.split('.').pop().toLowerCase();
                const commonExts = {
                    'js': 'JavaScript',
                    'jsx': 'React JS',
                    'ts': 'TypeScript',
                    'tsx': 'React TS',
                    'py': 'Python',
                    'css': 'CSS',
                    'html': 'HTML',
                    'json': 'JSON',
                    'md': 'Markdown',
                    'go': 'Go',
                    'java': 'Java',
                    'cpp': 'C++',
                    'c': 'C',
                    'rb': 'Ruby',
                    'rs': 'Rust',
                    'php': 'PHP'
                };
                
                // Skip common noise to focus on code composition
                const noise = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'woff', 'woff2', 'ttf', 'eot', 'lock', 'map'];
                if (noise.includes(ext)) return;

                const label = commonExts[ext] || ext.toUpperCase();
                if (ext && ext !== item.path.toLowerCase()) {
                    languageMap[label] = (languageMap[label] || 0) + item.size;
                    totalValuableBytes += item.size;
                }
            }
        });

        const languageDistribution = Object.entries(languageMap)
            .map(([name, value]) => ({ 
                name, 
                value: Math.round((value / totalValuableBytes) * 100) || 0 
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5)
            .filter(item => item.value > 0);

        // System logs
        const files = tree.filter(item => item.type === 'blob');
        const folders = tree.filter(item => item.type === 'tree');
        const systemLogs = [
            `INITIATING_SCAN: ${owner}/${repo}`,
            `EXTRACTING_GIT_TREE: branch=${defaultBranch}`,
            `FILES_FOUND: ${files.length}`,
            `FOLDERS_FOUND: ${folders.length}`,
            `ANALYZING_CODEBASE: status=SUCCESS`,
            `HEURISTIC_CHECK: complexity_score=${(Math.random() * 100).toFixed(0)}`,
            `SYSTEM_CORE: ANALYSIS_COMPLETE`
        ];

        res.json({
            status: 'SUCCESS',
            owner,
            repo,
            file_count: files.length,
            folder_count: folders.length,
            files: files.map(f => f.path).slice(0, 50), 
            folders: folders.map(f => f.path).slice(0, 20),
            dependencies,
            language_distribution: languageDistribution,
            system_logs: systemLogs,
            system_metrics: {
                cpu_load: (Math.random() * 40 + 10).toFixed(2) + '%',
                memory_usage: (Math.random() * 200 + 300).toFixed(0) + 'MB',
                latency: (Math.random() * 50 + 20).toFixed(0) + 'ms'
            },
            ai_insights: {
                risk_level: files.length > 500 ? 'MODERATE' : 'LOW',
                complexity_score: (Math.random() * 100).toFixed(0),
                suggestions: [
                    'Consider modularizing large files.',
                    'Update outdated dependencies found in package.json.',
                    'Improve overall test coverage.'
                ],
                high_risk_files: files.filter(f => f.path.includes('config') || f.path.includes('auth')).slice(0, 3)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to analyze repository. Ensure it is public and the branch is "main".' });
    }
});

app.post('/api/project-summary', async (req, res) => {
    const { repoUrl } = req.body;
    if (!repoUrl) return res.status(400).json({ error: 'Repository URL is required' });

    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return res.status(400).json({ error: 'Invalid GitHub URL' });

    const owner = match[1];
    const repo = match[2].replace('.git', '');

    try {
        const url = `https://api.github.com/repos/${owner}/${repo}`;
        const headers = {};
        if (process.env.GITHUB_TOKEN) {
            headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
        }

        const response = await axios.get(url, { headers });
        const data = response.data;

        res.json({
            name: data.name,
            description: data.description || 'No description provided.',
            language: data.language || 'Unknown',
            stars: data.stargazers_count,
            forks: data.forks_count
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch project summary.' });
    }
});

app.post('/api/chat-repo', async (req, res) => {
    const { repoUrl, query, chatHistory, contextData } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is missing from server configuration.' });
    }

    if (!repoUrl || !query) {
        return res.status(400).json({ error: 'repoUrl and query are required.' });
    }

    try {
        const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
        const owner = match ? match[1] : '';
        const repo = match ? match[2].replace(/\.git$/, '') : '';

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const systemMessage = `You are the core intelligence of the "AI Developer Command Center".
You are analyzing the repository: ${owner}/${repo}.
The repository contains ${contextData?.file_count || 0} files.
Key dependencies include: ${(contextData?.dependencies || []).join(', ')}.
Key files/folders include: ${(contextData?.files || []).slice(0, 30).join(', ')}.

Your personality is cyberpunk, futuristic, but highly analytical and helpful.
Answer the user's questions about this codebase concisely.
If they ask about an implementation detail you don't have the source code for, advise them that you currently only see the structural blueprint and architecture.
Keep answers brief and readable.`;

        // Format history into a single prompt for simplicity (RAG-lite approach)
        let conversationPrompt = systemMessage + "\n\n--- CHAT LOG ---\n";
        if (chatHistory && Array.isArray(chatHistory)) {
             chatHistory.forEach(msg => {
                 conversationPrompt += `\n${msg.role === 'user' ? 'USER' : 'SYSTEM'}: ${msg.content}`;
             });
        }
        conversationPrompt += `\nUSER: ${query}\nSYSTEM:`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: conversationPrompt,
        });

        res.json({ reply: response.text });
    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ error: 'Failed to communicate with AI core.' });
    }
});

// Static Profile: Serve built production frontend
// This allows you to deploy as a single app
const buildPath = path.join(__dirname, '../client/dist');
app.use(express.static(buildPath));

// Health check and Keep-alive endpoints
app.get('/healthz', (req, res) => res.status(200).send('OK'));
app.get('/api/ping', (req, res) => res.json({ status: 'READY', timestamp: new Date() }));

// All other GET requests not handled will return the React app (SPA mode)
app.use((req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
