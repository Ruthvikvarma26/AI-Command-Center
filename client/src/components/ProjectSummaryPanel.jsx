import React from 'react';
import { BookOpen, AlignLeft, Code, Star, GitFork } from 'lucide-react';

const ProjectSummaryPanel = ({ summary }) => {
  return (
    <div className="hud-panel p-6 h-full" style={{ border: '1px solid #bc13fe', boxShadow: '0 0 15px rgba(188,19,254,0.1)' }}>
      <h3 className="text-sm tracking-widest font-bold mb-4 flex items-center gap-2" style={{ color: '#bc13fe' }}>
        <BookOpen className="w-4 h-4" />
        PROJECT_SUMMARY
      </h3>

      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>REPOSITORY_NAME</span>
          <span className="text-lg font-bold tracking-tight text-white">{summary?.name || 'Awaiting Data...'}</span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] tracking-widest flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <AlignLeft className="w-3 h-3" /> DESCRIPTION
          </span>
          <span className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
            {summary?.description || 'Awaiting Data...'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: 'rgba(188,19,254,0.2)' }}>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] tracking-widest flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <Code className="w-3 h-3" /> LANGUAGE
            </span>
            <span className="text-sm font-bold" style={{ color: '#00f3ff' }}>{summary?.language || '—'}</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] tracking-widest flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <Star className="w-3 h-3" /> STARS
            </span>
            <span className="text-sm font-bold" style={{ color: '#ffaa00' }}>{summary?.stars ?? '—'}</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] tracking-widest flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <GitFork className="w-3 h-3" /> FORKS
            </span>
            <span className="text-sm font-bold" style={{ color: '#39ff14' }}>{summary?.forks ?? '—'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSummaryPanel;
