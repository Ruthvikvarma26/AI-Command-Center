# AI Developer Command Center

## 🌌 Core Concept
The **AI Developer Command Center** is a cyberpunk-themed, web-based intelligence platform designed to analyze, visualize, and provide insights into software repositories. It acts as a futuristic "HUD" (Heads Up Display) for developers or tech leads to quickly understand the structure, dependencies, and potential risk factors in any public GitHub repository.

By fusing an immersive UI with backend data aggregation, the system gives users an "AI-driven" overview of codebases, surfacing key metrics like language distribution, file composition, and structural complexity at a glance.

---

## 🏗️ Architecture Overview
The project is built on a modern JavaScript stack, divided into decoupled Frontend and Backend services to ensure scalability and secure authentication.

### Frontend (Client-Side)
- **Framework**: React.js powered by Vite for lightning-fast HMR and building.
- **Styling**: Tailwind CSS for utility-first layout management, combined with custom CSS for complex CRT scanline effects, glassmorphism, and neon glowing borders (Cyberpunk Aesthetic).
- **Animations**: `framer-motion` is utilized heavily to create smooth, mounting component animations, responsive button states, and dynamic status bars.
- **Routing**: `react-router-dom` handles client-side routing, protected by an authentication wrapper (`ProtectedRoute`) that validates server-side sessions before rendering the Dashboard.
- **Data Fetching**: `axios` is configured to send requests with credentials (cookies) to securely communicate with the backend API.

### Backend (Server-Side)
- **Runtime**: Node.js utilizing the Express.js framework.
- **Authentication**: Powered by `passport.js`, implementing multiple strategies:
  - **Social OAuth**: `passport-google-oauth20` and `passport-github2` for seamless third-party logins.
  - **Local**: Fallback standard Email/Password authentication.
- **Session Management**: `express-session` handles secure server-side tracking, issuing HTTP-Only cookies to the React client to prevent XSS-based token theft.
- **API Integrations**: Uses `axios` with a GitHub Personal Access Token (`GITHUB_TOKEN`) to bypass standard rate limits, recursively crawling repository file trees and fetching package dependencies in real-time.

---

## ⚙️ Working Process & Features

### 1. The Authentication Handshake ("Auth Gateway")
1. **Entry**: The user arrives at `/login` and is presented with the Auth Gateway.
2. **Strategy**: The user can choose to log in via GitHub, Google, or Email/Password.
3. **OAuth Flow**: If Google/GitHub is selected, the browser redirects to the provider. Upon successful consent, the provider redirects back to the backend `/auth/.../callback`.
4. **Session Creation**: The backend authenticates the profile, serializes the user into the session store, and sets a secure `connect.sid` cookie in the user's browser.
5. **Redirection**: The backend redirects the user to the frontend `/dashboard?login=success`, triggering a success notification HUD element.
6. **Validation**: The frontend `ProtectedRoute` verifies the session by hitting `/api/user/me` before granting access.

### 2. Repository Analysis Engine 
1. **Input**: The user pastes a public GitHub repository URL into the Dashboard.
2. **Sanitization**: The backend parses and normalizes the URL (e.g., `github.com/owner/repo`).
3. **Data Fetching**: 
   - The backend queries the GitHub API to identify the default branch (e.g., `main` or `master`).
   - It performs a recursive tree fetch (`/git/trees/{branch}?recursive=1`) to pull the entire structural map of the repository in a single fast request.
   - It identifies key files like `package.json` and fetches their raw content to extract dependency lists.
4. **Data Aggregation**: The backend calculates byte-size percentages to determine Language Distribution, counts directories vs. blobs, and runs mock "heuristic checks" to generate an AI Risk Level.
5. **Delivery**: Data is sent back to the React client and dynamically rendered into futuristic data panels (Metrics, AI Insights, Architecture trees, and Donut Charts).

---

## 🚀 Setup & Execution 

### Prerequisites
- Node.js (v16+)
- A GitHub Personal Access Token (for extended API rate limits)
- Google & GitHub OAuth Developer Credentials (Client ID & Client Secret)

### Environment Variables
**Server (`server/.env`)**
```env
PORT=5000
SESSION_SECRET=your_super_secret_session_key
GITHUB_TOKEN=your_github_pat

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### Running the Environment (Development)
The system is divided into two separate applications that run concurrently.

**1. Start the Backend API:**
```bash
cd server
npm install
npm run dev
# Runs on http://localhost:5000
```

**2. Start the Frontend UI:**
```bash
cd client
npm install
npm run dev
# Runs on http://localhost:5173
```
