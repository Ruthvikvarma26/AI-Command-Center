import React, { useState } from 'react';
import { Terminal, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import OperatorModal from './OperatorModal';
import API_BASE_URL from '../apiConfig';

const Navbar = () => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);

  React.useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/system/status`, { withCredentials: true });
        setDbConnected(res.data.dbConnected);
      } catch (err) {
        setDbConnected(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <nav style={{ borderBottom: '1px solid rgba(0,243,255,0.3)', backgroundColor: 'rgba(5,5,5,0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Terminal className="w-8 h-8 animate-pulse" style={{ color: '#00f3ff' }} />
            <span className="text-xl font-bold tracking-tighter text-white glitch-text hidden sm:inline-block">
              AI <span style={{ color: '#00f3ff' }}>DEV</span> COMMAND CENTER
            </span>
            <span className="text-xl font-bold tracking-tighter text-white glitch-text sm:hidden">
              SYS<span style={{ color: '#00f3ff' }}>_</span>CORE
            </span>
            
            {/* DB Status Light */}
            <div className="flex items-center gap-1.5 ml-4 px-2 py-0.5 rounded border border-white/5" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <div 
                className={`w-1.5 h-1.5 rounded-full ${dbConnected ? 'animate-pulse' : ''}`} 
                style={{ 
                  backgroundColor: dbConnected ? '#39ff14' : '#ff003c',
                  boxShadow: dbConnected ? '0 0 10px #39ff14' : '0 0 10px #ff003c'
                }} 
              />
              <span className="text-[8px] font-bold tracking-widest leading-none" style={{ color: dbConnected ? '#39ff14' : '#ff003c' }}>
                DB_LINK_{dbConnected ? 'ACTIVE' : 'OFFLINE'}
              </span>
            </div>
          </div>

          {/* Operator Profile Button */}
          <div className="flex gap-4">
            <button
              onClick={() => setIsProfileOpen(true)}
              className="px-4 py-2 text-xs tracking-widest font-bold transition-all flex items-center gap-2"
              style={{ border: '1px solid #00f3ff', color: '#00f3ff', backgroundColor: 'rgba(0,243,255,0.05)' }}
              onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(0,243,255,0.2)'; }}
              onMouseOut={e => { e.currentTarget.style.backgroundColor = 'rgba(0,243,255,0.05)'; }}
            >
              <Shield className="w-4 h-4" />
              OPERATOR
            </button>
          </div>
        </div>
      </div>

      <OperatorModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </nav>
  );
};

export default Navbar;
