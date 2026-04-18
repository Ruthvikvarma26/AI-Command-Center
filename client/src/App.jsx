import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import API_BASE_URL from './apiConfig';

// Protected Route that checks the SERVER session, not localStorage
const ProtectedRoute = ({ children }) => {
  const [authState, setAuthState] = useState('loading'); // 'loading', 'authenticated', 'unauthenticated'

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/user/me`, { withCredentials: true })
      .then(res => {
        if (res.data.isAuthenticated) {
          setAuthState('authenticated');
        } else {
          setAuthState('unauthenticated');
        }
      })
      .catch(() => {
        setAuthState('unauthenticated');
      });
  }, []);

  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" 
           style={{ backgroundColor: '#050505', color: '#00f3ff', fontFamily: "'JetBrains Mono', monospace" }}>
        <div className="text-center">
          <div className="text-2xl animate-pulse mb-4">⟨⟩</div>
          <p className="text-xs tracking-[0.3em]">VERIFYING_SESSION...</p>
        </div>
      </div>
    );
  }

  if (authState === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-grid relative text-white selection:bg-[#00f3ff] selection:text-[#050505]"
           style={{ backgroundColor: '#050505', fontFamily: "'JetBrains Mono', monospace" }}>
        
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          {/* Default redirect to dashboard (which will kick them to login if unauth'd) */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>

        {/* Global Scanline overlays — MUST have pointer-events: none */}
        <div className="scanlines" style={{ pointerEvents: 'none' }} />
        <div className="scanline-move" style={{ pointerEvents: 'none' }} />
        
      </div>
    </Router>
  );
}

export default App;
