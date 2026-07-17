import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { AnalysisV2Payload, MarketDataQuality } from '../types/report';
import { AnalysisV2Panel } from './AnalysisV2Panel';

const analysis: AnalysisV2Payload = {
  risk: {
    maxDrawdownPercent: -14.2,
    currentDrawdownPercent: -3.1,
    volatility20d: 28.412,
    atr14: 1820.5,
    atr14Percent: 2.319108,
    longestRecoveryDays: 31,
  },
  events: [
    {
      type: 'macd-signal-cross',
      time: '2026-07-10',
      direction: 'up',
      description: 'MACD가 Signal 위로 교차했습니다.',
      macd: 920.12,
      signal: 810.44,
    },
  ],
  availability: {
    maxDrawdown: true,
    currentDrawdown: true,
    volatility20d: true,
    atr14: true,
    longestRecoveryDays: true,
    sma20Sma50Events: true,
    closeSma20Events: true,
    closeSma50Events: true,
    rsiEvents: true,
    macdEvents: true,
  },
  dataLimitations: ['거래일이 짧아 장기 지표 해석에 제한이 있습니다.'],
  comparison: null,
};

const dataQuality: MarketDataQuality = {
  receivedRowCount: 123,
  acceptedRowCount: 122,
  excludedRowCount: 1,
  exclusions: { duplicateDate: 1 },
};

describe('AnalysisV2Panel', () => {
  it('renders risk, events, and data quality from the V2 response', () => {
    render(<AnalysisV2Panel analysis={analysis} dataQuality={dataQuality} />);

    expect(screen.getByRole('heading', { name: '시장 데이터 분석' })).toBeInTheDocument();
    expect(screen.getByText('-14.2%')).toBeInTheDocument();
    expect(screen.getByText('MACD·Signal 교차')).toBeInTheDocument();
    expect(screen.getByText('MACD 920.12 · Signal 810.44')).toBeInTheDocument();
    expect(screen.getByText('분석 사용 122건')).toBeInTheDocument();
    expect(screen.getByText('중복 날짜 1건')).toBeInTheDocument();
  });

  it('does not render a report comparison for portfolio analysis', () => {
    const withComparison: AnalysisV2Payload = {
      ...analysis,
      comparison: {
        previousReportId: 'previous-report',
        previousGeneratedAt: '2026-07-01T00:00:00.000Z',
        previousRange: { from: '2026-01-01', to: '2026-06-30' },
        currentRange: { from: '2026-01-01', to: '2026-07-11' },
        changes: {
          latestClose: { previous: 100, current: 110, delta: 10, direction: 'increased' },
          periodChangePercent: { previous: 3, current: 5, delta: 2, direction: 'increased' },
          latestRsi14: { previous: 50, current: 55, delta: 5, direction: 'increased' },
          recentVolumeVsAverage: { previous: 1, current: 1, delta: 0, direction: 'unchanged' },
          maxDrawdownPercent: { previous: -10, current: -8, delta: 2, direction: 'increased' },
          volatility20d: { previous: 20, current: 18, delta: -2, direction: 'decreased' },
          atr14Percent: { previous: null, current: 2, delta: null, direction: 'unavailable' },
        },
        observations: [],
        dataLimitations: [],
      },
    };

    render(<AnalysisV2Panel analysis={withComparison} showComparison={false} />);

    expect(screen.queryByRole('heading', { name: '직전 리포트와 비교' })).not.toBeInTheDocument();
  });
});
