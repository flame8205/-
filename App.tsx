import React, { useState } from 'react';
import { Search, Loader2, BarChart3, TrendingUp, Newspaper, Filter } from 'lucide-react';
import { analyzeStockData } from './services/geminiService';
import { AnalysisResult, AnalysisStatus } from './types';
import FinancialCard from './components/FinancialCard';
import NewsCard from './components/NewsCard';
import ScoreGauge from './components/ScoreGauge';

export const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setStatus(AnalysisStatus.LOADING);
    setError(null);
    setData(null);
    setActiveFilter('All'); // Reset filter on new search

    try {
      const result = await analyzeStockData(query);
      setData(result);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (err: any) {
      setError(err.message || '無法取得數據，請稍後再試');
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const filters = [
    { id: 'All', label: '全部', color: 'bg-slate-700' },
    { id: 'Expansion', label: '擴廠/設廠', color: 'bg-blue-600' },
    { id: 'Investment', label: '投資/資本支出', color: 'bg-indigo-600' },
    { id: 'Technology', label: '新技術', color: 'bg-violet-600' },
    { id: 'Orders', label: '訂單', color: 'bg-emerald-600' },
    { id: 'US_Cooperation', label: '與美合作', color: 'bg-rose-600' },
  ];

  const getFilteredNews = () => {
    if (!data?.news) return [];
    if (activeFilter === 'All') return data.news;

    return data.news.filter(item => {
      // Check tags
      if (item.tags?.includes(activeFilter)) return true;
      
      // Fallback: Check content keywords
      const content = (item.headline + item.summary).toLowerCase();
      switch (activeFilter) {
        case 'Expansion': 
          return /擴廠|設廠|expansion|factory|location/.test(content);
        case 'Investment': 
          return /投資|資本支出|investment|capex/.test(content);
        case 'Technology': 
          return /技術|研發|technology|r&d/.test(content);
        case 'Orders': 
          return /訂單|銷量|order|volume/.test(content);
        case 'US_Cooperation': 
          return /美國|合作|us|cooperation/.test(content);
        default:
          return false;
      }
    });
  };

  const filteredNews = getFilteredNews();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-4 pt-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/20 rounded-full mb-2">
            <BarChart3 className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-blue-400 to-emerald-400">
            StockGrowth 成長股 AI
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            結合 AI 新聞篩選，分析營收、毛利及「40法則」成長指標，鎖定擴產與策略投資動向。
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-xl mx-auto">
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="輸入股票代號或公司名稱 (例如: 台積電, 2330, NVIDIA)..."
              className="w-full bg-slate-800 text-white pl-11 pr-4 py-4 rounded-xl border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-500 shadow-lg"
            />
            <button
              type="submit"
              disabled={status === AnalysisStatus.LOADING}
              className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {status === AnalysisStatus.LOADING ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                '搜尋'
              )}
            </button>
          </form>
          {status === AnalysisStatus.LOADING && (
            <p className="text-center text-sm text-slate-500 mt-3 animate-pulse">
              正在搜尋財報數據並分析新聞趨勢...
            </p>
          )}
          {error && (
            <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-center">
              {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        {status === AnalysisStatus.SUCCESS && data && (
          <div className="animate-fade-in space-y-8">
            
            <div className="flex flex-col md:flex-row items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  {data.financials.companyName}
                  <span className="text-lg text-slate-400 font-normal bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                    {data.financials.symbol}
                  </span>
                </h2>
                <p className="text-slate-400 mt-1">貨幣單位: {data.financials.currency}</p>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <FinancialCard financials={data.financials} />
              </div>
              <div className="md:col-span-1">
                <ScoreGauge 
                  revenueGrowth={data.financials.accumulatedRevenueYoY}
                  grossMargin={data.financials.accumulatedGrossMargin}
                  score={data.score}
                  isHighGrowth={data.isHighGrowth}
                />
              </div>
            </div>

            {/* AI Summary */}
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <h3 className="text-lg font-semibold text-indigo-300 mb-2 flex items-center gap-2">
                <TrendingUp size={20} />
                AI 分析摘要
              </h3>
              <p className="text-slate-300 leading-relaxed">
                {data.summary}
              </p>
            </div>

            {/* News Section */}
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Newspaper className="text-emerald-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">關鍵策略動態</h3>
                    <p className="text-slate-400 text-sm hidden md:block">
                      篩選關鍵字：擴廠、新技術、與美合作、資本支出、訂單
                    </p>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1 text-slate-400 mr-2">
                    <Filter size={14} />
                    <span className="text-xs">篩選</span>
                  </div>
                  {filters.map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        activeFilter === filter.id 
                          ? `${filter.color} text-white shadow-lg ring-1 ring-white/20` 
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredNews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                  {filteredNews.map((item, index) => (
                    <NewsCard key={index} news={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-dashed border-slate-700 text-slate-500">
                  {activeFilter === 'All' 
                    ? "未找到符合特定策略標準的近期新聞。"
                    : `在「${filters.find(f => f.id === activeFilter)?.label}」類別中未找到相關新聞。`
                  }
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};