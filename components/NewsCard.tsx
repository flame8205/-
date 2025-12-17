import React from 'react';
import { NewsItem } from '../types';
import { ExternalLink, Tag, Calendar, Building2 } from 'lucide-react';

interface NewsCardProps {
  news: NewsItem;
}

const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
  // Regex pattern to match the specific keywords requested by the user
  // Includes Traditional Chinese terms and common variations
  const highlightRegex = /(擴廠|設廠|投資|資本支出|技術|訂單|美國|合作|Expansion|Factory|Investment|Capex|Technology|Order|US|Cooperation)/gi;

  const renderSummaryWithHighlights = (text: string) => {
    // Split text by the regex capturing group so delimiters are included in the result array
    const parts = text.split(highlightRegex);
    
    return parts.map((part, index) => {
      // Check if this part matches our keywords
      if (highlightRegex.test(part)) {
        return (
          <span 
            key={index} 
            className="text-amber-300 font-semibold bg-amber-500/20 px-1 rounded-sm mx-0.5"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Map English tags from API to Chinese for display
  const tagTranslations: Record<string, string> = {
    "Expansion": "擴廠/設廠",
    "Investment": "投資/資本支出",
    "Technology": "新技術",
    "Orders": "訂單",
    "US_Cooperation": "與美合作"
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5 hover:border-slate-600 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-slate-100 leading-tight">
          {news.url ? (
            <a href={news.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 flex items-center gap-2">
              {news.headline}
              <ExternalLink size={14} className="opacity-50" />
            </a>
          ) : (
            news.headline
          )}
        </h3>
      </div>
      
      <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
        <div className="flex items-center gap-1">
          <Building2 size={12} />
          <span>{news.source}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>{news.date}</span>
        </div>
      </div>

      <div className="text-sm text-slate-300 mb-4 line-clamp-4 leading-relaxed">
        {renderSummaryWithHighlights(news.summary)}
      </div>

      <div className="flex flex-wrap gap-2">
        {news.tags.map((tag, idx) => (
          <span 
            key={idx} 
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
          >
            <Tag size={10} />
            {tagTranslations[tag] || tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default NewsCard;