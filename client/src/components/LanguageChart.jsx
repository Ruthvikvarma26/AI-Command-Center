import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Palette } from 'lucide-react';

const LanguageChart = ({ data = [] }) => {
  if (!data || data.length === 0) return null;

  // Cyberpunk color palette
  const COLORS = ['#00f3ff', '#bc13fe', '#39ff14', '#ff003c', '#ffaa00'];

  return (
    <div className="hud-panel p-4 relative overflow-hidden h-[240px] flex flex-col" style={{ borderColor: '#00f3ff', boxShadow: '0 0 15px rgba(0,243,255,0.2)' }}>
      <div className="flex items-center gap-2 mb-2 border-b border-cyber-cyan/30 pb-2">
        <Palette className="w-4 h-4 text-cyber-cyan" />
        <span className="text-[10px] tracking-[0.3em] font-bold text-cyber-cyan">CODE_COMPOSITION_MATRIX</span>
      </div>

      <div className="flex-1 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={45}
              outerRadius={65}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              animationBegin={0}
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(5,5,5,0.9)', 
                border: '1px solid #00f3ff',
                borderRadius: '0',
                color: '#fff',
                fontFamily: 'JetBrains Mono',
                fontSize: '12px'
              }}
              itemStyle={{ color: '#00f3ff' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={24}
              iconSize={8}
              wrapperStyle={{ 
                paddingTop: '0px', 
                fontSize: '10px', 
                fontFamily: 'JetBrains Mono',
                textTransform: 'uppercase'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Decorative corners */}
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyber-cyan/20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyber-cyan/20 pointer-events-none" />
    </div>
  );
};

export default LanguageChart;
