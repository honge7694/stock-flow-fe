export type ReportRequest = {
  ticker: string;
  from: string;
  to: string;
  ai: boolean;
};

export type AuthResponse = {
  accessToken: string;
  user: User;
};

export type User = {
  id: string;
  email: string;
};

export type ReportSource = 'manual' | 'scheduled';
export type ReportStatus = 'completed' | 'failed';
export type ReportPeriod = '1m' | '3m' | '6m' | '1y';
export type ReportPageSize = 5 | 10 | 30 | 50;
export type InstrumentMetadataStatus = 'resolved' | 'partial' | 'unknown';

export type ReportInstrument = {
  ticker: string;
  name: string | null;
  exchange: string | null;
  currency: string | null;
  country: string | null;
  metadataStatus: InstrumentMetadataStatus;
};

export type ReportListQuery = {
  page?: number;
  pageSize?: ReportPageSize;
  ticker?: string;
  status?: ReportStatus;
  source?: ReportSource;
  includeAi?: boolean;
  from?: string;
  to?: string;
};

export type Stock = {
  id: string;
  userId: string;
  ticker: string;
  name: string | null;
  scheduleEnabled: boolean;
  scheduleTime: string;
  scheduleTimezone: string;
  reportPeriod: ReportPeriod;
  includeAi: boolean;
  lastScheduledRunAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StockRequest = {
  ticker: string;
  name?: string;
  scheduleEnabled?: boolean;
  scheduleTime?: string;
  scheduleTimezone?: string;
  reportPeriod?: ReportPeriod;
  includeAi?: boolean;
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

export type AiAnalysisStatus = 'available' | 'unavailable';
export type AnalysisCheckStatus = 'positive' | 'caution' | 'negative' | 'neutral' | 'insufficient_data';

export type AnalysisCheck = {
  status: AnalysisCheckStatus;
  title: string;
  summary?: string;
  evidence?: string[];
  interpretation?: string;
  watchPoints?: string[];
  dataLimitations?: string[];
  explanation?: string;
};

export type ChecklistItem = AnalysisCheck;

export type IndicatorSummary = {
  title: string;
  summary: string;
  keyTakeaways: string[];
};

export type AiAnalysisResult = {
  status: AiAnalysisStatus;
  analysis?: {
    beginnerExplanation: {
      summary: string;
      sma: string;
      rsi: string;
      macd: string;
      volume: string;
    };
    indicatorSummary?: IndicatorSummary;
    checklist: {
      trend: AnalysisCheck;
      momentum: AnalysisCheck;
      volume: AnalysisCheck;
      risk: AnalysisCheck;
    };
    report: {
      headline: string;
      summary: string;
      observations: string[];
      nextThingsToWatch: string[];
      disclaimer: string;
    };
  };
  errorMessage?: string;
};

export type AiAnalysis = AiAnalysisResult;

export type ReportSummaryMetrics = {
  latestClose: number | null;
  latestVolume: number | null;
  candleCount: number;
  periodChange: number | null;
  periodChangePercent: number | null;
  latestSma20: number | null;
  latestSma50: number | null;
  latestRsi14: number | null;
  latestMacd: {
    macd: number | null;
    signal: number | null;
    histogram: number | null;
  } | null;
  averageVolume: number | null;
  recentVolumeVsAverage: number | null;
};

export type ReportPayloadSummary = {
  metrics: ReportSummaryMetrics;
  availability: {
    hasRsi: boolean;
    hasMacd: boolean;
  };
  sections: {
    price: string;
    rsi: string;
    macd: string;
    volume: string;
  };
  guideItems: {
    title: string;
    body: string;
  }[];
  disclaimer: string;
};

export type ReportPayload = {
  ticker: string;
  instrument?: ReportInstrument;
  from: string;
  to: string;
  generatedAt: string;
  candles: Candle[];
  indicators: Indicators;
  summary?: ReportPayloadSummary;
  aiAnalysis?: AiAnalysisResult;
};

export type ReportResponse = {
  id: string;
  ticker: string;
  instrument?: ReportInstrument;
  from: string;
  to: string;
  generatedAt: string;
  source: ReportSource;
  status: ReportStatus;
  includeAi: boolean;
  reportPeriod: ReportPeriod | null;
  payload: ReportPayload | null;
  errorMessage: string | null;
};

export type ReportListResponse = {
  items: ReportResponse[];
  page: number;
  pageSize: ReportPageSize;
  total: number;
  totalPages: number;
};
