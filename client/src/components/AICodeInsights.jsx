import React from 'react';
import { AlertCircle, Target, Lightbulb } from 'lucide-react';

// Inline SVG Activity icon (avoids lucide import collision)
const ActivityIcon = () => (
  <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const AICodeInsights = ({ insights }) => {
  const complexityScore = insights?.complexity_score ?? 45;

  return (
    <div className="hud-panel p-6">
      {/* Header */}
      <h3 className="text-sm tracking-widest font-bold mb-6 flex items-center gap-2" style={{ color: '#00f3ff' }}>
        <Target className="w-4 h-4" /> AI_CODE_INSIGHTS
      </h3>

      <div className="space-y-6">
        {/* High Risk Files */}
        <div>
          <h4 className="text-[10px] tracking-widest mb-3 flex items-center gap-2" style={{ color: '#ff003c' }}>
            <AlertCircle className="w-3 h-3" /> HIGH_RISK_FILES
          </h4>
          <div className="space-y-2">
            {insights?.high_risk_files?.length > 0
              ? insights.high_risk_files.map((file, i) => (
                  <div
                    key={i}
                    className="text-xs font-mono p-2 flex justify-between"
                    style={{
                      border: '1px solid rgba(255,0,60,0.3)',
                      backgroundColor: 'rgba(255,0,60,0.05)',
                    }}
                  >
                    <span style={{ color: 'rgba(255,0,60,0.8)' }}>{typeof file === 'object' ? file.path : file}</span>
                    <span
                      className="text-[10px] px-1"
                      style={{ backgroundColor: 'rgba(255,0,60,0.2)', color: '#ff003c' }}
                    >
                      SECURITY_VULN
                    </span>
                  </div>
                ))
              : (
                <div className="text-xs italic" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  No critical risks detected.
                </div>
              )
            }
          </div>
        </div>

        {/* Code Complexity */}
        <div>
          <h4 className="text-[10px] tracking-widest mb-3 flex items-center gap-2" style={{ color: '#bc13fe' }}>
            <ActivityIcon /> CODE_COMPLEXITY
          </h4>
          <div className="relative h-4" style={{ backgroundColor: 'rgba(188,19,254,0.1)', border: '1px solid rgba(188,19,254,0.3)' }}>
            <div
              className="h-full transition-all duration-700"
              style={{
                width: `${complexityScore}%`,
                backgroundColor: '#bc13fe',
                boxShadow: '0 0 10px #bc13fe',
              }}
            />
            <span
              className="absolute right-2 font-bold"
              style={{ color: '#bc13fe', fontSize: '10px', top: '-20px' }}
            >
              {complexityScore}/100
            </span>
          </div>
        </div>

        {/* Suggestions */}
        <div>
          <h4 className="text-[10px] tracking-widest mb-3 flex items-center gap-2" style={{ color: '#00f3ff' }}>
            <Lightbulb className="w-3 h-3" /> SUGGESTIONS
          </h4>
          <ul className="text-xs space-y-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {(insights?.suggestions ?? ['Scanning system...']).map((s, i) => (
              <li key={i} className="flex gap-2">
                <span style={{ color: '#00f3ff' }}>_</span> {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AICodeInsights;
