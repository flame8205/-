export interface StockFinancials {
  symbol: string;
  companyName: string;
  currency: string;
  currentMonthRevenue: string; // e.g., "12.5B"
  accumulatedRevenueYoY: number; // Percentage
  currentQuarterGrossMargin: number; // Percentage
  accumulatedGrossMargin: number; // Percentage
  accumulatedGrossMarginYoY: number; // Percentage growth of the margin itself
}

export interface NewsItem {
  headline: string;
  source: string;
  date: string;
  summary: string;
  url?: string;
  tags: string[]; // Keywords found like "Expansion", "US Cooperation"
}

export interface AnalysisResult {
  financials: StockFinancials;
  news: NewsItem[];
  score: number; // Accumulated Revenue YoY + Accumulated Gross Margin
  isHighGrowth: boolean; // Score >= 40
  summary: string; // AI generated summary
}

export enum AnalysisStatus {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR
}