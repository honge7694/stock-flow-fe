export type ReportRequest = {
  ticker: string;
  from: string;
  to: string;
  ai: boolean;
};

export type Candle = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type LinePoint = {
  time: string;
  value: number | null;
};

export type MacdPoint = {
  time: string;
  macd: number | null;
  signal: number | null;
  histogram: number | null;
};

export type Indicators = {
  sma20: LinePoint[];
  sma50: LinePoint[];
  rsi14: LinePoint[];
  macd: MacdPoint[];
  volume: LinePoint[];
};

export type ChecklistItem = {
  status: 'positive' | 'caution' | 'negative' | 'neutral';
  title: string;
  explanation: string;
};

export type AiAnalysis = {
  status: 'available' | 'unavailable';
  analysis?: {
    beginnerExplanation: {
      summary: string;
      sma: string;
      rsi: string;
      macd: string;
      volume: string;
    };
    checklist: {
      trend: ChecklistItem;
      momentum: ChecklistItem;
      volume: ChecklistItem;
      risk: ChecklistItem;
    };
    report: {
      headline: string;
      summary: string;
      observations: string[];
      nextThingsToWatch: string[];
      disclaimer: string;
    };
  };
};

export type ReportResponse = {
  ticker: string;
  from: string;
  to: string;
  ai: boolean;
  generatedAt: string;
  candles: Candle[];
  indicators: Indicators;
  aiAnalysis?: AiAnalysis;
};
