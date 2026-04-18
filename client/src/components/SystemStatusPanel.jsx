import React from 'react';
import { Power } from 'lucide-react';

const SystemStatusPanel = () => {
  return (
    <div className="hud-panel p-6 mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm tracking-widest font-bold" style={{ color: '#00f3ff' }}>SYSTEM_STATUS</h3>
        <Power className="w-4 h-4 animate-pulse" style={{ color: '#39ff14' }} />
      </div>
      <div className="flex items-end gap-3">
        <span className="text-4xl font-bold" style={{ color: '#39ff14', textShadow: '0 0 8px rgba(57,255,20,0.6)' }}>
          ONLINE
        </span>
        <span className="text-xs mb-1" style={{ color: 'rgba(57,255,20,0.5)' }}>STABLE_CORE_V1.4</span>
      </div>
      <div className="mt-4 flex gap-1 h-1">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="flex-1"
            style={{ backgroundColor: i < 15 ? '#39ff14' : 'rgba(57,255,20,0.2)' }}
          />
        ))}
      </div>
    </div>
  );
};

export default SystemStatusPanel;
