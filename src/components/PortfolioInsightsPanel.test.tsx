import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { PortfolioCalculationBasis, PortfolioPositionInsights } from '../types/report';
import { PortfolioInsightsPanel } from './PortfolioInsightsPanel';

const basis: PortfolioCalculationBasis = {
  priceAsOf: '2026-07-10',
  priceType: 'historical-daily-close',
  requestedRange: { from: '2026-01-01', to: '2026-07-11' },
  actualDataRange: { from: '2026-01-02', to: '2026-07-10' },
  currency: {
    positionCurrency: 'KRW',
    marketCurrency: 'KRW',
    status: 'matched',
  },
  includesFees: false,
  includesTaxes: false,
  includesDividends: false,
};

const insights: PortfolioPositionInsights = {
  priceDifferenceFromAverage: 6500,
  priceDifferenceFromAveragePercent: 9.027778,
  priceChangeToBreakEvenPercent: -8.280255,
  periodRange: {
    low: 65000,
    high: 82000,
    currentPricePositionPercent: 79.411765,
    averagePricePositionPercent: 41.176471,
  },
  trendDistance: {
    fromSma20Percent: 2.213542,
    fromSma50Percent: 5.909336,
  },
  rollingReturns: {
    fiveTradingDaysPercent: 1.815824,
    twentyTradingDaysPercent: 4.666667,
    sixtyTradingDaysPercent: 8.275862,
  },
  latestVolumeVsAveragePercent: 8.62069,
  atrEstimatedPositionValueMovement: 18205,
  sensitivity: [
    {
      hypotheticalChangePercent: -10,
      assumedPrice: 70650,
      positionValue: 706500,
      unrealizedProfit: -13500,
      unrealizedProfitRate: -1.875,
    },
    {
      hypotheticalChangePercent: 10,
      assumedPrice: 86350,
      positionValue: 863500,
      unrealizedProfit: 143500,
      unrealizedProfitRate: 19.930556,
    },
  ],
};

describe('PortfolioInsightsPanel', () => {
  it('renders calculation basis and position insight fields from V2', () => {
    render(<PortfolioInsightsPanel basis={basis} insights={insights} currency="KRW" />);

    expect(screen.getByRole('heading', { name: '보유 상태 계산' })).toBeInTheDocument();
    expect(screen.getByText('기준 2026-07-10 종가')).toBeInTheDocument();
    expect(screen.getByText('실제 데이터 2026-01-02 - 2026-07-10')).toBeInTheDocument();
    expect(screen.getByText('통화 KRW / KRW')).toBeInTheDocument();
    expect(screen.getByText('-8.28%')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /현재가 위치 \+79.41%/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '가격 변화 가정 계산' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '143,500 KRW' })).toBeInTheDocument();
  });

  it('keeps legacy portfolio responses unchanged when V2 fields are absent', () => {
    const { container } = render(<PortfolioInsightsPanel />);

    expect(container).toBeEmptyDOMElement();
  });
});
