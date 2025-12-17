import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ScoreGaugeProps {
  revenueGrowth: number;
  grossMargin: number;
  score: number;
  isHighGrowth: boolean;
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ revenueGrowth, grossMargin, score, isHighGrowth }) => {
  // Defensive programming: Ensure values are numbers
  const safeScore = Number(score) || 0;
  const safeRev = Number(revenueGrowth) || 0;
  const safeMargin = Number(grossMargin) || 0;

  const data = [
    { name: 'Score', value: Math.min(Math.max(safeScore, 0), 100) }, // Clamp between 0-100 for visual
    { name: 'Remaining', value: 100 - Math.min(Math.max(safeScore, 0), 100) },
  ];

  const color = isHighGrowth ? '#10b981' : '#f59e0b'; // Emerald or Amber

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background decoration */}
      <div className={`absolute top-0 w-full h-1 ${isHighGrowth ? 'bg-emerald-500' : 'bg-amber-500'}`} />

      <h2 className="text-slate-400 text-sm uppercase tracking-wider font-semibold mb-4">成長潛力評分</h2>

      <div className="w-48 h-48 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              startAngle={180}
              endAngle={0}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              cornerRadius={10}
            >
              <Cell key="score" fill={color} />
              <Cell key="remaining" fill="#334155" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        <div className="absolute inset-0 top-10 flex flex-col items-center justify-center text-center">
          <span className={`text-4xl font-bold ${isHighGrowth ? 'text-emerald-400' : 'text-amber-400'}`}>
            {safeScore.toFixed(1)}
          </span>
          <span className="text-slate-500 text-xs mt-1">目標: 40.0</span>
        </div>
      </div>

      <div className="w-full space-y-3 mt-[-30px]">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400">營收成長 (YoY)</span>
          <span className="font-mono text-slate-200">{safeRev.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400">累計毛利率</span>
          <span className="font-mono text-slate-200">{safeMargin.toFixed(1)}%</span>
        </div>
        
        <div className={`mt-4 flex items-center justify-center gap-2 p-2 rounded-lg ${isHighGrowth ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
          {isHighGrowth ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="font-semibold text-sm">
            {isHighGrowth ? '符合成長標準' : '未達 40 標準'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ScoreGauge;