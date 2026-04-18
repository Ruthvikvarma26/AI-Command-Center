import React from 'react';
import { FileCode, Folder, GitBranch, Database } from 'lucide-react';

const MetricsPanel = ({ metrics }) => {
  const cards = [
    {
      label: 'FILES_ANALYZED',
      value: metrics?.file_count ?? '—',
      Icon: FileCode,
      color: '#bc13fe',
      glow: 'rgba(188,19,254,0.3)',
    },
    {
      label: 'FOLDERS_COUNT',
      value: metrics?.folder_count ?? '—',
      Icon: Folder,
      color: '#00f3ff',
      glow: 'rgba(0,243,255,0.3)',
    },
    {
      label: 'DEPENDENCIES',
      value: metrics?.dependency_count ?? '—',
      Icon: GitBranch,
      color: '#39ff14',
      glow: 'rgba(57,255,20,0.3)',
    },
    {
      label: 'REPOSITORY',
      value: metrics?.repository_name ?? '—',
      Icon: Database,
      color: '#ffaa00',
      glow: 'rgba(255,170,0,0.3)',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map(({ label, value, Icon, color, glow }, i) => (
        <div
          key={i}
          className="hud-panel p-4 flex flex-col items-center cursor-default group transition-all"
          style={{ border: `2px solid ${color}`, boxShadow: `0 0 15px ${glow}` }}
        >
          <Icon
            className="w-8 h-8 mb-2 transition-transform group-hover:scale-110"
            style={{ color }}
          />
          <span className="text-[10px] tracking-[0.2em] text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {label}
          </span>
          <span className="text-xl md:text-2xl font-bold mt-1 max-w-full truncate px-2" title={String(value)} style={{ color, textShadow: `0 0 8px ${color}` }}>
            {value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default MetricsPanel;
