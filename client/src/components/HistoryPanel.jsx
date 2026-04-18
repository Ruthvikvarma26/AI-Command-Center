import React from 'react';
import { History, ExternalLink, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HistoryPanel = ({ scans = [], onSelect, onClear }) => {
  if (scans.length === 0) return null;

  return (
    <div className="hud-panel p-4 mb-6 relative overflow-hidden" style={{ borderColor: '#bc13fe', boxShadow: '0 0 15px rgba(188,19,254,0.2)' }}>
      <div className="flex items-center justify-between mb-4 border-b border-cyber-purple/30 pb-2">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-cyber-purple" />
          <span className="text-[10px] tracking-[0.3em] font-bold text-cyber-purple">RECENT_DATA_FRAGMENTS</span>
        </div>
        <button 
          onClick={onClear}
          className="text-[10px] text-cyber-purple/60 hover:text-cyber-red transition-colors flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" />
          CLEAR_STORAGE
        </button>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {scans.map((scan, i) => (
            <motion.div
              key={scan.url}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => onSelect(scan.url)}
              className="flex items-center justify-between p-2 bg-cyber-purple/5 border border-cyber-purple/20 hover:border-cyber-purple hover:bg-cyber-purple/10 cursor-pointer transition-all group"
            >
              <div className="flex flex-col">
                <span className="text-[10px] text-cyber-purple font-bold truncate max-w-[150px]">
                  {scan.name.toUpperCase()}
                </span>
                <span className="text-[8px] text-cyber-purple/50 truncate max-w-[200px]">
                  {scan.url}
                </span>
              </div>
              <ExternalLink className="w-3 h-3 text-cyber-purple/40 group-hover:text-cyber-purple" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HistoryPanel;
