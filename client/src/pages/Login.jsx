import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Terminal, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../apiConfig';

const Login = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  // Read URL query params for OAuth errors
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errParam = params.get('error');
    if (errParam) {
      setError(`OAUTH_FAILURE: ${errParam.toUpperCase()}`);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('INPUT_REQUIRED: EMAIL AND PASSWORD');
      return;
    }

    if (!isLoginMode && password !== confirmPassword) {
      setError('AUTH_ERROR: PASSWORDS DO NOT MATCH');
      return;
    }

    setLoading(true);
    const endpoint = isLoginMode ? '/api/login' : '/api/register';

    try {
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, 
        { email, password },
        { withCredentials: true }
      );
      
      if (isLoginMode) {
        // Success login
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userToken', response.data.token);
        navigate('/dashboard?login=success');
      } else {
        // Success register
        setIsLoginMode(true);
        setError('REGISTRATION_SUCCESS: YOU MAY NOW LOGIN');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'SYSTEM_CONNECTION_FAILED');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    if (!email) {
      setError('INPUT_REQUIRED: ENTER EMAIL TO RECEIVE RESET LINK');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/forgot-password`, { email }, { withCredentials: true });
      setError('SUCCESS: RESET LINK DISPATCHED TO EMAIL (CHECK SPAM)');
    } catch (err) {
      setError(err.response?.data?.error || 'SYSTEM_CONNECTION_FAILED');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    // Redirect to backend OAuth route
    window.location.href = `${API_BASE_URL}/auth/${provider.toLowerCase()}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-4 w-full" style={{ zIndex: 9999, pointerEvents: 'auto' }}>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative"
        style={{ zIndex: 10000, pointerEvents: 'auto' }}
      >
        <div className="mb-8 text-center flex flex-col items-center">
          <Terminal className="w-12 h-12 animate-pulse mb-4" style={{ color: '#bc13fe' }} />
          <h1 className="text-3xl font-bold tracking-tighter text-white glitch-text">
            AUTH <span style={{ color: '#39ff14' }}>GATEWAY</span>
          </h1>
          <p className="mt-2 text-xs tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
            IDENTIFICATION REQUIRED FOR SYSTEM ACCESS
          </p>
        </div>

        <div className="hud-panel p-8" style={{ borderColor: isLoginMode ? '#39ff14' : '#bc13fe', boxShadow: `0 0 20px ${isLoginMode ? 'rgba(57,255,20,0.2)' : 'rgba(188,19,254,0.2)'}`, zIndex: 10001 }}>
          
          {/* Accent Line */}
          <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: isLoginMode ? '#39ff14' : '#bc13fe' }} />

          <h2 className="text-sm tracking-widest font-bold mb-6 text-center transition-colors" style={{ color: isLoginMode ? '#39ff14' : '#bc13fe' }}>
            [ {isLoginMode ? 'USER_LOGIN' : 'NEW_ACQUISITION'} ]
          </h2>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-3 text-xs font-mono flex gap-2 items-center"
                style={{ 
                  backgroundColor: error.includes('SUCCESS') ? 'rgba(57,255,20,0.1)' : 'rgba(255,0,60,0.1)', 
                  border: `1px solid ${error.includes('SUCCESS') ? '#39ff14' : '#ff003c'}`,
                  color: error.includes('SUCCESS') ? '#39ff14' : '#ff003c' 
                }}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="EMAIL_ADDRESS"
                className="w-full p-3 pl-11 text-sm focus:outline-none transition-colors"
                style={{
                  backgroundColor: 'rgba(5,5,5,0.6)',
                  border: `1px solid ${isLoginMode ? 'rgba(57,255,20,0.3)' : 'rgba(188,19,254,0.3)'}`,
                  color: 'white',
                  fontFamily: 'inherit',
                }}
              />
              <Mail className="absolute left-3 top-3.5 w-4 h-4" style={{ color: isLoginMode ? '#39ff14' : '#bc13fe' }} />
            </div>

            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ACCESS_KEY"
                className="w-full p-3 pl-11 text-sm focus:outline-none transition-colors"
                style={{
                  backgroundColor: 'rgba(5,5,5,0.6)',
                  border: `1px solid ${isLoginMode ? 'rgba(57,255,20,0.3)' : 'rgba(188,19,254,0.3)'}`,
                  color: 'white',
                  fontFamily: 'inherit',
                }}
              />
              <Lock className="absolute left-3 top-3.5 w-4 h-4" style={{ color: isLoginMode ? '#39ff14' : '#bc13fe' }} />
            </div>

            <AnimatePresence>
              {!isLoginMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative overflow-hidden"
                >
                  <div className="pt-5">
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="CONFIRM_ACCESS_KEY"
                      className="w-full p-3 pl-11 text-sm focus:outline-none transition-colors"
                      style={{
                        backgroundColor: 'rgba(5,5,5,0.6)',
                        border: '1px solid rgba(188,19,254,0.3)',
                        color: 'white',
                        fontFamily: 'inherit',
                      }}
                    />
                    <Lock className="absolute left-3 top-[34px] w-4 h-4" style={{ color: '#bc13fe' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isLoginMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex justify-end overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="mt-2 text-[10px] font-bold tracking-widest text-[#39ff14]/60 hover:text-[#39ff14] transition-colors"
                  >
                    FORGOT_ACCESS_KEY?
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-bold tracking-[0.2em] flex items-center justify-center gap-2 transition-all relative overflow-hidden mt-6"
              style={{
                backgroundColor: isLoginMode ? 'rgba(57,255,20,0.1)' : 'rgba(188,19,254,0.1)',
                border: `2px solid ${isLoginMode ? '#39ff14' : '#bc13fe'}`,
                color: isLoginMode ? '#39ff14' : '#bc13fe',
                cursor: loading ? 'not-allowed' : 'pointer',
                zIndex: 10002
              }}
              onMouseOver={e => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = isLoginMode ? '#39ff14' : '#bc13fe';
                  e.currentTarget.style.color = '#050505';
                }
              }}
              onMouseOut={e => {
                e.currentTarget.style.backgroundColor = isLoginMode ? 'rgba(57,255,20,0.1)' : 'rgba(188,19,254,0.1)';
                e.currentTarget.style.color = isLoginMode ? '#39ff14' : '#bc13fe';
              }}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isLoginMode ? 'INITIALIZE LOGIN' : 'CREATE PROTOCOL'}
            </button>
          </form>

          {/* Social Authentication Section */}
          <div className="mt-8 space-y-6">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-full h-[1px] bg-white/10"></div>
              <span className="relative px-4 bg-[#050505] text-[8px] tracking-[0.3em] text-white/40">OR_INITIATE_SOCIAL_HANDSHAKE</span>
            </div>

            <div className="grid grid-cols-1">
              <a
                href="http://localhost:5000/auth/google"
                className="flex items-center justify-center gap-2 py-2 border border-white/10 hover:border-cyber-purple hover:bg-cyber-purple/5 transition-all text-[10px] font-bold tracking-widest text-white/60 hover:text-cyber-purple group no-underline"
                style={{ zIndex: 10003, pointerEvents: 'auto', cursor: 'pointer' }}
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                </svg>
                GOOGLE_AUTH
              </a>
            </div>
          </div>


          <div className="mt-8 pt-6 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {isLoginMode ? "DON'T HAVE CLEARANCE?" : "ALREADY HAVE CLEARANCE?"}
            </p>
            <button
              onClick={() => { setIsLoginMode(!isLoginMode); setError(null); }}
              className="mt-2 text-xs font-bold tracking-widest hover:underline transition-colors"
              style={{ color: isLoginMode ? '#bc13fe' : '#39ff14' }}
            >
              {isLoginMode ? 'REQUEST_ACCESS (REGISTER)' : 'AUTHORIZE (LOGIN)'}
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default Login;
