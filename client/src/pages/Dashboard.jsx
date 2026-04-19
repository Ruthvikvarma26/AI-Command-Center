import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../apiConfig';
import Navbar from '../components/Navbar';
import SystemStatusPanel from '../components/SystemStatusPanel';
import RepoAnalyzerPanel from '../components/RepoAnalyzerPanel';
import MetricsPanel from '../components/MetricsPanel';
import AICodeInsights from '../components/AICodeInsights';
import ProjectSummaryPanel from '../components/ProjectSummaryPanel';
import SystemTerminal from '../components/SystemTerminal';
import HistoryPanel from '../components/HistoryPanel';
import LanguageChart from '../components/LanguageChart';

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [error, setError] = useState(null);
  const [scans, setScans] = useState([]);
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);
  const navigate = useNavigate();
  const resultsRef = useRef(null);

  // Configure axios for session cookies
  axios.defaults.withCredentials = true;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('login') === 'success') {
      setShowLoginSuccess(true);
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => setShowLoginSuccess(false), 3500);
    }
    
    // Fetch permanent history from DB on load
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/user/repos`);
        setScans(response.data);
      } catch (err) {
        console.warn('[DASHBOARD] Failed to synchronize history with server.');
      }
    };
    fetchHistory();
  }, []);

  const saveToHistory = async (url, name) => {
    try {
      // Sync to Database
      const response = await axios.post(`${API_BASE_URL}/api/user/repos`, { name, url });
      setScans(response.data.history);
    } catch (err) {
      console.warn('[DASHBOARD] Could not backup scan to cloud history.');
      // Local fallback if server fails
      const newScans = [{ url, name }, ...scans.filter(s => s.url !== url)].slice(0, 10);
      setScans(newScans);
    }
  };

  const clearHistory = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/user/repos/clear`);
      setScans([]);
    } catch (err) {
      console.error('[DASHBOARD] Failed to purge cloud history.');
    }
  };

  const analyzeRepo = async (repoUrl) => {
    setLoading(true);
    setError(null);
    setData(null); // Reset data for terminal animation
    
    // Auto-scroll to results
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    try {
      const [repoResponse, summaryResponse] = await Promise.all([
        axios.post(`${API_BASE_URL}/api/analyze-repo`, { repoUrl }),
        axios.post(`${API_BASE_URL}/api/project-summary`, { repoUrl })
      ]);
      setData(repoResponse.data);
      setSummaryData(summaryResponse.data);
      saveToHistory(repoUrl, repoResponse.data.repo);
    } catch (err) {
      setError(err.response?.data?.error || 'FAILED_TO_CONNECT_TO_CORE_SYSTEM');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <AnimatePresence>
        {showLoginSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 30, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4, type: 'spring', bounce: 0.5 }}
            className="fixed top-0 left-0 right-0 z-[9999] flex justify-center pointer-events-none"
          >
            <div className="px-6 py-4 flex items-center gap-3 bg-[#050505]/90 backdrop-blur-md border shadow-2xl"
                 style={{ 
                   borderColor: '#39ff14', 
                   boxShadow: '0 0 30px rgba(57,255,20,0.3), inset 0 0 10px rgba(57,255,20,0.1)'
                 }}>
              <div className="w-2 h-2 rounded-full animate-pulse bg-[#39ff14]" />
              <span className="font-mono text-sm tracking-[0.2em] font-bold text-[#39ff14]">
                USER AUTHENTICATED SUCCESSFULLY
              </span>
              <div className="w-2 h-2 rounded-full animate-pulse bg-[#39ff14]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 w-full overflow-hidden">
        {/* CRT Overlay Effects */}
        <div className="scanlines opacity-20" />
        <div className="scanline-move" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-20">
          {/* Left: Headline & History */}
          <div className="lg:col-span-4 flex flex-col pt-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight mb-6">
                <span className="block text-white glitch-text">ANALYZE</span>
                <span className="block glitch-text" style={{ color: '#00f3ff' }}>YOUR</span>
                <span className="block glitch-text" style={{ color: '#bc13fe' }}>CODEBASE</span>
              </h1>
              <p className="text-sm md:text-base leading-relaxed max-w-md mb-12" style={{ color: 'rgba(255,255,255,0.6)' }}>
                "AI powered system that analyzes repositories, detects risks, and visualizes architecture."
              </p>

              <HistoryPanel scans={scans} onSelect={analyzeRepo} onClear={clearHistory} />

              <div className="mt-12 mb-8 flex gap-4 items-center">
                <div className="w-12 h-px" style={{ backgroundColor: '#00f3ff' }} />
                <span className="text-[10px] tracking-[0.5em] font-bold animate-pulse" style={{ color: 'rgba(0,243,255,0.5)' }}>
                  STATUS_CORE: OPERATIONAL
                </span>
              </div>

              {/* Project Summary in Sidebar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-6"
              >
                <ProjectSummaryPanel summary={summaryData} />
              </motion.div>
            </motion.div>
          </div>

          {/* Right: Dashboard Panels */}
          <div className="lg:col-span-8" ref={resultsRef}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col crt-flicker"
            >
              <SystemStatusPanel />
              <RepoAnalyzerPanel onAnalyze={analyzeRepo} isLoading={loading} />

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 text-sm font-mono mb-6"
                    style={{ background: 'rgba(255,0,60,0.1)', border: '1px solid #ff003c', color: '#ff003c' }}
                  >
                    STATUS_ERR: {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="md:col-span-2">
                  <MetricsPanel metrics={{
                    file_count: data?.file_count ?? '0',
                    folder_count: data?.folder_count ?? '0',
                    dependency_count: data?.dependencies?.length ?? '0',
                    repository_name: data?.repo ?? '—'
                  }} />
                </div>
                
                {/* AI Command Terminal spanning full width in the middle */}
                <div className="md:col-span-2">
                  <SystemTerminal 
                    logs={data?.system_logs || (loading ? ["FETCHING_REPOS_TREE...", "SCANNING_BLOBS...", "CONNECTING_AI_CORE..."] : [])} 
                    repoData={data}
                    repoUrl={data?.owner ? `https://github.com/${data.owner}/${data.repo}` : null}
                    className="h-96"
                  />
                </div>

                {/* Side by side widgets at the bottom */}
                <LanguageChart data={data?.language_distribution || []} />
                
                <AICodeInsights insights={data?.ai_insights || {
                  complexity_score: 0,
                  high_risk_files: [],
                  suggestions: ['Awaiting repository scan...']
                }} />
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Dashboard;
