import React from 'react';
import { WatchlistItem } from '../types';
import { Trash2, TrendingUp, Search } from 'lucide-react';

interface WatchListProps {
  items: WatchlistItem[];
  onRemove: (symbol: string) => void;
  onSelect: (symbol: string) => void;
}

const WatchList: React.FC<WatchListProps> = ({ items, onRemove, onSelect }) => {
  if (items.length === 0) {
    return (
        <div className="w-full bg-slate-800/20 border border-slate-700/30 rounded-xl p-6 text-center text-slate-500 text-sm border-dashed">
            <TrendingUp className="mx-auto mb-2 opacity-50" size={20} />
            <p>尚未新增股票</p>
            <p className="text-xs mt-1 opacity-70">搜尋後點擊「加入觀察」即可追蹤</p>
        </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-slate-400 text-sm font-semibold mb-3 flex items-center gap-2 px-1">
        <TrendingUp size={16} />
        股票觀察區 ({items.length})
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
        {items.map((item) => (
          <div 
            key={item.symbol}
            className="group relative bg-slate-800/60 border border-slate-700/60 hover:border-indigo-500/50 rounded-lg p-3 transition-all hover:shadow-lg hover:bg-slate-800"
          >
            {/* Click area to search */}
            <div 
              onClick={() => onSelect(item.symbol)}
              className="cursor-pointer"
            >
              <div className="flex justify-between items-start mb-1">
                <div className="overflow-hidden">
                  <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 inline-block mb-1">
                    {item.symbol}
                  </span>
                  <h4 className="text-slate-200 font-medium text-sm truncate pr-2" title={item.companyName}>
                    {item.companyName}
                  </h4>
                </div>
                <div className={`text-base font-bold whitespace-nowrap ${item.isHighGrowth ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {item.score.toFixed(1)}
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1 group-hover:text-indigo-300 transition-colors">
                <Search size={10} />
                點擊分析
              </div>
            </div>

            {/* Remove Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(item.symbol);
              }}
              className="absolute top-2 right-2 p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
              title="從觀察區移除"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WatchList;