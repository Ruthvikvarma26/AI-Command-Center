import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

const RepoAnalyzerPanel = ({ onAnalyze, isLoading }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) onAnalyze(url.trim());
  };

  return (
    <div className="hud-panel p-6 mb-6">
      <h3 className="text-sm tracking-widest font-bold mb-4" style={{ color: '#00f3ff' }}>
        REPOSITORY_ANALYZER
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="PASTE_GITHUB_REPOSITORY_URL"
            className="w-full p-3 pl-10 text-sm focus:outline-none"
            style={{
              backgroundColor: 'rgba(5,5,5,0.5)',
              border: '1px solid rgba(0,243,255,0.5)',
              color: '#00f3ff',
              boxShadow: 'inset 0 0 10px rgba(0,243,255,0.1)',
              fontFamily: 'inherit',
            }}
          />
          <Search className="absolute left-3 top-3.5 w-4 h-4" style={{ color: 'rgba(0,243,255,0.5)' }} />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 font-bold tracking-[0.2em] flex items-center justify-center gap-2 transition-all relative group overflow-hidden"
          style={{
            backgroundColor: 'rgba(0,243,255,0.1)',
            border: '2px solid #00f3ff',
            color: '#00f3ff',
            fontFamily: 'inherit',
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
          onMouseOver={e => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = '#00f3ff';
              e.currentTarget.style.color = '#050505';
            }
          }}
          onMouseOut={e => {
            e.currentTarget.style.backgroundColor = 'rgba(0,243,255,0.1)';
            e.currentTarget.style.color = '#00f3ff';
          }}
        >
          {isLoading
            ? <Loader2 className="w-5 h-5 animate-spin" />
            : 'ANALYZE SYSTEM'}
        </button>
      </form>
      <div className="mt-4 text-[10px]" style={{ color: 'rgba(0,243,255,0.3)' }}>
        LOG: INITIALIZING_INPUT_BUFFER... READY
      </div>
    </div>
  );
};

export default RepoAnalyzerPanel;
