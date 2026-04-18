import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Shield, Database, Terminal, X } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';

const OperatorModal = ({ isOpen, onClose }) => {
  const [user, setUser] = useState(null);
  const [repoCount, setRepoCount] = useState(0);
  const [systemStatus, setSystemStatus] = useState({ dbConnected: false, operators: 0 });
  const modalRef = useRef(null);

  // Close modal when clicking outside of it
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      axios.get(`${API_BASE_URL}/api/user/me`, { withCredentials: true })
        .then(res => {
          if (res.data.user) setUser(res.data.user);
        })
        .catch(console.error);

      // Fetch System Telemetry
      axios.get(`${API_BASE_URL}/api/system/status`, { withCredentials: true })
        .then(res => setSystemStatus(res.data))
        .catch(console.error);

      // Load actual repository scanned count from history
      try {
        const history = JSON.parse(localStorage.getItem('repoHistory') || '[]');
        setRepoCount(history.length);
      } catch (e) {}
    }
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await axios.get(`${API_BASE_URL}/api/logout`, { withCredentials: true });
      
      // Wipe sensitive local cache to prevent data leaking between users
      localStorage.removeItem('repoScans');
      localStorage.removeItem('repoHistory');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userToken');
      
      window.location.href = '/login';
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-20 px-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Modal Dropdown Body */}
      <motion.div 
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md p-8 pointer-events-auto flex flex-col"
        style={{ 
          backgroundColor: '#050505', // Solid black to hide background bleeding
          border: '1px solid #00f3ff', 
          boxShadow: '0 10px 40px rgba(0,243,255,0.15), inset 0 0 20px rgba(0,243,255,0.05)' 
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-cyber-cyan/20 pb-4">
          <h2 className="text-sm tracking-[0.4em] font-black text-cyber-cyan flex items-center gap-3">
            <Shield className="w-4 h-4" />
            OPERATOR_PROFILE
          </h2>
          <button 
            onClick={onClose} 
            className="group relative p-2 -mr-2 text-cyber-cyan/50 hover:text-cyber-red transition-all duration-300"
            aria-label="Close Profile"
          >
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <div className="absolute inset-0 bg-cyber-red/0 group-hover:bg-cyber-red/10 rounded-full blur-md transition-all"></div>
          </button>
        </div>

        {/* User Details */}
        <div className="flex items-center gap-5 mb-8">
          <div className="w-16 h-16 rounded-sm bg-cyber-green/5 border border-cyber-green/50 flex flex-shrink-0 items-center justify-center overflow-hidden">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover grayscale opacity-80 mix-blend-screen" />
            ) : (
              <User className="w-8 h-8 text-cyber-green/80" />
            )}
          </div>
          <div className="overflow-hidden relative z-10 bg-[#050505]">
            <div className="text-[10px] tracking-widest text-gray-500">IDENTIFIER</div>
            <div className="text-lg font-bold text-white truncate w-full">
              {user?.username || user?.displayName || user?.email || 'UNKNOWN_OPERATOR'}
            </div>
            <div className="text-[10px] tracking-widest text-cyber-cyan mt-1 flex items-center gap-2">
              STATUS: <span className="animate-pulse">CONNECTED</span>
            </div>
          </div>
        </div>

        {/* Telemetry Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 border border-cyber-purple/30 bg-cyber-purple/5 relative overflow-hidden group hover:bg-cyber-purple/10 transition-colors">
            <div className="text-[10px] tracking-widest text-gray-400 mb-1 flex items-center gap-2 relative z-10">
              <Database className="w-3 h-3 text-cyber-purple" /> SAVED_REPOS
            </div>
            <div className="text-2xl font-bold text-cyber-purple relative z-10 block w-full">{repoCount}</div>
          </div>
          <div className="p-4 border border-cyber-green/30 bg-cyber-green/5 relative overflow-hidden group hover:bg-cyber-green/10 transition-colors">
            <div className="text-[10px] tracking-widest text-gray-400 mb-1 flex items-center gap-2 relative z-10">
              <Shield className="w-3 h-3 text-cyber-green" /> AUTH_PROVIDER
            </div>
            <div className="text-sm font-bold tracking-widest uppercase relative z-10 block w-full mt-2" style={{ color: user?.provider === 'google' ? '#ea4335' : '#39ff14' }}>
              {user?.provider === 'google' ? 'GOOGLE_OAUTH_LINK' : 'ENCRYPTED_DB_ACCOUNT'}
            </div>
          </div>
        </div>

        {/* Infrastructure Telemetry */}
        <div className="mb-8 p-4 border border-[#00f3ff]/20 bg-[#00f3ff]/5 rounded-sm">
          <div className="text-[10px] tracking-[0.3em] text-[#00f3ff]/60 mb-2 font-bold flex items-center gap-2">
            <Terminal className="w-3 h-3" /> SYSTEM_INFRASTRUCTURE
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[10px] font-mono">
              <span className="text-gray-500">DATASOURCE</span>
              <span className="text-white">MONGODB_ATLAS (ai_command_center)</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono">
              <span className="text-gray-500">DB_CONNECTION</span>
              <span className={`px-2 py-0.5 rounded-full ${systemStatus.dbConnected ? 'bg-[#39ff14]/10 text-[#39ff14] border border-[#39ff14]/30' : 'bg-red-500/10 text-red-500 border border-red-500/30'}`}>
                {systemStatus.dbConnected ? 'STABLE' : 'OFFLINE'}
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono">
              <span className="text-gray-500">TOTAL_OPERATORS</span>
              <span className="text-white font-bold">{systemStatus.operators}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-5 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-500/5 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-black font-bold tracking-widest text-[10px] transition-all"
          >
            <LogOut className="w-3 h-3" />
            TERMINATE_SESSION
          </button>
        </div>
        
        {/* Cyberpunk Accents */}
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyber-cyan/50" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyber-cyan/50" />
      </motion.div>
    </div>
  );
};

export default OperatorModal;
