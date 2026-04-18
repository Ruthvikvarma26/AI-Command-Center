import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';

const SystemTerminal = ({ logs = [], repoData, repoUrl, className }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize with logs when a new repo is analyzed
  useEffect(() => {
    if (logs.length > 0) {
      const initialLogs = logs.map((log, i) => ({
        id: `log-${i}`,
        role: 'system',
        content: log
      }));
      setChatHistory(initialLogs);
    } else {
      setChatHistory([]);
    }
  }, [logs, repoUrl]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !repoUrl || isTyping) return;

    const query = inputValue.trim();
    setInputValue('');
    
    const newUserMsg = { id: Date.now().toString(), role: 'user', content: query };
    setChatHistory(prev => [...prev, newUserMsg]);
    setIsTyping(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/chat-repo`, {
        repoUrl,
        query,
        contextData: repoData,
        chatHistory: chatHistory
      });

      const aiMsg = { id: (Date.now() + 1).toString(), role: 'system', content: response.data.reply };
      setChatHistory(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errMsg = { id: (Date.now() + 1).toString(), role: 'system', content: 'ERR: CONNECTION_TO_AI_CORE_FAILED. ' + (err.response?.data?.error || '') };
      setChatHistory(prev => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`hud-panel p-4 mb-6 relative overflow-hidden flex flex-col ${className || 'h-64'}`} style={{ borderColor: '#39ff14', boxShadow: '0 0 15px rgba(57,255,20,0.2)' }}>
      <div className="flex items-center gap-2 mb-4 border-b border-cyber-green/30 pb-2 shrink-0">
        <TerminalIcon className="w-4 h-4 text-cyber-green" />
        <span className="text-[10px] tracking-[0.3em] font-bold text-cyber-green">AI_COMMAND_PROMPT_V2.0</span>
        <div className="ml-auto flex gap-1">
          <div className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-cyber-green/30" />
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto font-mono text-xs space-y-2 pr-2 scrollbar-thin scrollbar-thumb-cyber-green/20 pb-4"
      >
        <AnimatePresence>
          {chatHistory.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-start gap-2 ${msg.role === 'user' ? 'opacity-80' : ''}`}
            >
              <ChevronRight className={`w-3 h-3 mt-0.5 shrink-0 ${msg.role === 'user' ? 'text-white' : 'text-cyber-green'}`} />
              <div className="whitespace-pre-wrap break-words">
                <span className={msg.role === 'user' ? 'text-white font-bold' : 'text-cyber-green font-bold'}>
                  [{msg.role === 'user' ? 'USER' : 'SYSTEM'}]
                </span>
                {' '}
                <span className={msg.role === 'user' ? 'text-white' : 'text-cyber-green/90'}>
                  {msg.content}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
           <div className="flex items-start gap-2">
             <ChevronRight className="w-3 h-3 mt-0.5 shrink-0 text-cyber-green" />
             <span className="text-cyber-green font-bold">[SYSTEM] <span className="animate-pulse">PROCESSING...</span></span>
           </div>
        )}

        {chatHistory.length === 0 && !isTyping && (
          <div className="text-cyber-green/40 italic">SYSTEM_IDLE: AWAITING_REPOSITORY_ANALYSIS...</div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-2 pt-2 border-t border-cyber-green/30 shrink-0 flex items-center">
        <span className="text-cyber-green font-mono text-sm mr-2">{'>'}</span>
        <input 
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={!repoUrl || isTyping}
          placeholder={repoUrl ? "Ask the AI about this codebase..." : "Analyze a repository first..."}
          className="flex-1 bg-transparent border-none outline-none text-cyber-green font-mono text-xs disabled:opacity-50"
        />
        <motion.div 
            animate={{ opacity: [0, 1] }} 
            transition={{ repeat: Infinity, duration: 0.8 }}
            className={`w-2 h-4 inline-block ml-1 ${repoUrl ? 'bg-cyber-green' : 'bg-cyber-green/30'}`}
        />
      </form>
    </div>
  );
};

export default SystemTerminal;
