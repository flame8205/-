import React from 'react';
import { StockFinancials } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Percent, Activity } from 'lucide-react';

interface FinancialCardProps {
  financials: StockFinancials;
}

const MetricRow = ({ label, value, subValue, isPositive, prefix = "" }: { label: string, value: string | number, subValue?: string, isPositive?: boolean, prefix?: string }) => (
  <div className="flex justify-between items-center py-3 border-b border-slate-700/50 last:border-0">
    <span className="text-slate-400 text-sm">{label}</span>
    <div className="text-right">
      <div className="text-slate-100 font-medium text-lg">
        {prefix}{typeof value === 'number' ? value.toFixed(2) : value}{typeof value === 'number' ? '%' : ''}
      </div>
      {subValue && (
        <div className={`text-xs flex items-center justify-end gap-1 ${isPositive === true ? 'text-emerald-400' : isPositive === false ? 'text-rose-400' : 'text-slate-500'}`}>
          {isPositive === true && <TrendingUp size={12} />}
          {isPositive === false && <TrendingDown size={12} />}
          {subValue}
        </div>
      )}
    </div>
  </div>
);

const FinancialCard: React.FC<FinancialCardProps> = ({ financials }) => {
  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
      <div className="flex items-center gap-2 mb-6 text-slate-200">
        <Activity className="text-blue-500" />
        <h2 className="text-xl font-bold">財務關鍵指標</h2>
      </div>

      <div className="space-y-1">
        <MetricRow 
            label="當月營收" 
            value={financials.currentMonthRevenue} 
        />
        
        <MetricRow 
            label="累計營收年增率 (YoY)" 
            value={financials.accumulatedRevenueYoY} 
            subValue="較去年同期"
            isPositive={financials.accumulatedRevenueYoY > 0}
        />

        <MetricRow 
            label="當季毛利率" 
            value={financials.currentQuarterGrossMargin}
        />

        <MetricRow 
            label="累計毛利率" 
            value={financials.accumulatedGrossMargin} 
        />
        
        <MetricRow 
            label="累計毛利率年增率" 
            value={financials.accumulatedGrossMarginYoY}
            subValue="毛利成長幅度" 
            isPositive={financials.accumulatedGrossMarginYoY > 0}
        />
      </div>
    </div>
  );
};

export default FinancialCard;