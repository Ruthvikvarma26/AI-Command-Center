import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Terminal, Lock, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../apiConfig';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('CRITICAL: NO RECOVERY TOKEN DETECTED IN URL');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('CRITICAL: RECOVERY TOKEN MISSING');
      return;
    }

    if (!password || !confirmPassword) {
      setError('INPUT_REQUIRED: FILL ALL FIELDS');
      return;
    }

    if (password !== confirmPassword) {
      setError('AUTH_ERROR: PASSWORDS DO NOT MATCH');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/api/reset-password`, 
        { token, newPassword: password },
        { withCredentials: true }
      );
      
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
      
    } catch (err) {
      setError(err.response?.data?.error || 'SYSTEM_CONNECTION_FAILED');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-4 w-full" style={{ zIndex: 9999, pointerEvents: 'auto' }}>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative"
      >
        <div className="mb-8 text-center flex flex-col items-center">
          <ShieldCheck className="w-12 h-12 mb-4" style={{ color: '#00f3ff' }} />
          <h1 className="text-3xl font-bold tracking-tighter text-white glitch-text">
            SYSTEM <span style={{ color: '#00f3ff' }}>RECOVERY</span>
          </h1>
          <p className="mt-2 text-xs tracking-widest text-[#00f3ff]/40">
            SECURE LINK PROTOCOL ACTIVE
          </p>
        </div>

        <div className="hud-panel p-8" style={{ borderColor: '#00f3ff', boxShadow: '0 0 20px rgba(0,243,255,0.2)' }}>
          <div className="absolute top-0 left-0 w-full h-1 bg-[#00f3ff]" />
          
          <h2 className="text-sm tracking-widest font-bold mb-6 text-center text-[#00f3ff]">
            [ RESET_ACCESS_KEY ]
          </h2>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-3 text-xs font-mono flex gap-2 items-center bg-red-500/10 border border-red-500 text-red-500"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-3 text-xs font-mono flex gap-2 items-center bg-[#39ff14]/10 border border-[#39ff14] text-[#39ff14]"
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                SUCCESS: KEY UPDATED. REDIRECTING...
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="NEW_ACCESS_KEY"
                className="w-full p-3 pl-11 text-sm focus:outline-none transition-colors border border-[#00f3ff]/30 text-white bg-black/60"
                style={{ fontFamily: 'inherit' }}
                disabled={success}
              />
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-[#00f3ff]" />
            </div>

            <div className="relative">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="CONFIRM_NEW_ACCESS_KEY"
                className="w-full p-3 pl-11 text-sm focus:outline-none transition-colors border border-[#00f3ff]/30 text-white bg-black/60"
                style={{ fontFamily: 'inherit' }}
                disabled={success}
              />
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-[#00f3ff]" />
            </div>

            <button
              type="submit"
              disabled={loading || success || !token}
              className="w-full py-3 font-bold tracking-[0.2em] flex items-center justify-center gap-2 transition-all relative overflow-hidden mt-6 bg-[#00f3ff]/10 border-2 border-[#00f3ff] text-[#00f3ff] hover:bg-[#00f3ff] hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'OVERWRITE PROTOCOL'}
            </button>
          </form>

          <div className="mt-8 pt-6 text-center border-t border-white/10">
            <button
              onClick={() => navigate('/login')}
              className="text-xs font-bold tracking-widest text-[#00f3ff]/60 hover:text-[#00f3ff] transition-colors"
            >
              ← RETURN_TO_GATEWAY
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
