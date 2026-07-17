import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('formats report comparison values and observations with metric units', () => {
    const withComparison: AnalysisV2Payload = {
      ...analysis,
      comparison: {
        previousReportId: 'previous-report',
        previousGeneratedAt: '2026-07-16T00:00:00.000Z',
        previousRange: { from: '2026-01-17', to: '2026-07-15' },
        currentRange: { from: '2026-01-18', to: '2026-07-16' },
        changes: {
          latestClose: { previous: 115000, current: 100000, delta: -15000, direction: 'decreased' },
          periodChangePercent: { previous: 20, current: 5.97, delta: -14.03, direction: 'decreased' },
          latestRsi14: { previous: 55.2, current: 50, delta: -5.2, direction: 'decreased' },
          recentVolumeVsAverage: { previous: 1.1, current: 1.09, delta: -0.01, direction: 'decreased' },
          maxDrawdownPercent: { previous: -12, current: -12, delta: 0, direction: 'unchanged' },
          volatility20d: { previous: 20, current: 23.76516, delta: 3.76516, direction: 'increased' },
          atr14Percent: { previous: 1.5, current: 2.22, delta: 0.72, direction: 'increased' },
        },
        observations: [
          '종가는 직전 리포트보다 15000 낮아졌습니다.',
          'RSI 14은 직전 리포트보다 5.198736 낮아졌습니다.',
          '20일 변동성은 직전 리포트보다 3.76516%p 높아졌습니다.',
          '최대 낙폭은 직전 리포트와 같습니다.',
        ],
        dataLimitations: [],
      },
    };

    render(<AnalysisV2Panel analysis={withComparison} currency="KRW" />);

    expect(screen.getByText('-15,000 KRW')).toBeInTheDocument();
    expect(screen.getByText('-14.03%p')).toBeInTheDocument();
    expect(screen.getByText('-5.2포인트')).toBeInTheDocument();
    expect(screen.getByText('-0.01배')).toBeInTheDocument();
    expect(screen.getByText('0%p')).toBeInTheDocument();
    expect(screen.getByText('+3.77%p')).toHaveClass('comparison-decreased');
    expect(screen.getByText('+0.72%p')).toHaveClass('comparison-decreased');
    expect(screen.getByText('종가는 직전 리포트보다 15,000 KRW 낮아졌습니다.')).toBeInTheDocument();
    expect(screen.getByText('RSI 14는 직전 리포트보다 5.2포인트 낮아졌습니다.')).toBeInTheDocument();
    expect(screen.getByText('20일 변동성은 직전 리포트보다 3.77%p 높아졌습니다.')).toBeInTheDocument();
  });

  it('shows the latest five indicator events and expands the remainder on demand', async () => {
    const user = userEvent.setup();
    const events = Array.from({ length: 12 }, (_, index) => ({
      ...analysis.events[0],
      time: `2026-07-${String(12 - index).padStart(2, '0')}`,
      description: `지표 전환 ${index + 1}`,
    }));

    render(<AnalysisV2Panel analysis={{ ...analysis, events }} />);

    expect(screen.getByText('지표 전환 5')).toBeInTheDocument();
    expect(screen.queryByText('지표 전환 6')).not.toBeInTheDocument();

    const expandButton = screen.getByRole('button', { name: '나머지 7개 펼치기' });
    expect(expandButton).toHaveAttribute('aria-expanded', 'false');
    await user.click(expandButton);

    expect(screen.getByText('지표 전환 12')).toBeInTheDocument();
    const collapseButton = screen.getByRole('button', { name: '접기' });
    expect(collapseButton).toHaveAttribute('aria-expanded', 'true');
    await user.click(collapseButton);

    expect(screen.queryByText('지표 전환 6')).not.toBeInTheDocument();
  });
});
