import type { CSSProperties } from 'react';
import type { PortfolioCalculationBasis, PortfolioPositionInsights } from '../types/report';

type PortfolioInsightsPanelProps = {
  basis?: PortfolioCalculationBasis;
  insights?: PortfolioPositionInsights;
  currency?: string | null;
};

function formatNumber(value: number | null | undefined, digits = 2) {
  if (value === null || value === undefined) return '-';
  return value.toLocaleString('ko-KR', { maximumFractionDigits: digits });
}

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) return '-';
  return `${value > 0 ? '+' : ''}${formatNumber(value)}%`;
}

function formatMoney(value: number | null | undefined, currency?: string | null) {
  const formatted = formatNumber(value, 2);
  return currency && formatted !== '-' ? `${formatted} ${currency}` : formatted;
}

function clampPosition(value: number | null) {
  if (value === null) return 0;
  return Math.min(100, Math.max(0, value));
}

export function PortfolioInsightsPanel({ basis, insights, currency }: PortfolioInsightsPanelProps) {
  if (!basis && !insights) return null;

  const costItems: Array<[string, boolean]> = basis
    ? [
        ['수수료', basis.includesFees],
        ['세금', basis.includesTaxes],
        ['배당', basis.includesDividends],
      ]
    : [];
  const rangeStyle = insights
    ? ({
        '--current-position': `${clampPosition(insights.periodRange.currentPricePositionPercent)}%`,
        '--average-position': `${clampPosition(insights.periodRange.averagePricePositionPercent)}%`,
      } as CSSProperties)
    : undefined;

  return (
    <section className="content-section portfolio-insights-section">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">POSITION BREAKDOWN</p>
          <h2>보유 상태 계산</h2>
        </div>
        {basis ? <span className="pill">기준 {basis.priceAsOf} 종가</span> : null}
      </div>

      {basis ? (
        <section className="surface-panel portfolio-basis-panel">
          <div className="portfolio-basis-main">
            <div>
              <span className="card-label">PRICE BASIS</span>
              <strong>마지막 일봉 종가 기준</strong>
            </div>
            <div className="portfolio-basis-range">
              <span>요청 {basis.requestedRange.from} - {basis.requestedRange.to}</span>
              <span>실제 데이터 {basis.actualDataRange.from} - {basis.actualDataRange.to}</span>
            </div>
          </div>
          <div className="portfolio-basis-meta">
            <span className={basis.currency.status === 'matched' ? 'pill status-positive' : 'pill status-negative'}>
              통화 {basis.currency.positionCurrency} / {basis.currency.marketCurrency}
            </span>
            {costItems.map(([label, included]) => (
              <span className="pill" key={String(label)}>
                {label} {included ? '포함' : '미포함'}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {insights ? (
        <>
          <div className="portfolio-insight-grid">
            <article className="metric-card">
              <span>평균단가와 가격 차이</span>
              <strong>{formatMoney(insights.priceDifferenceFromAverage, currency)}</strong>
              <small>{formatPercent(insights.priceDifferenceFromAveragePercent)}</small>
            </article>
            <article className="metric-card">
              <span>평균단가까지 변화율</span>
              <strong>{formatPercent(insights.priceChangeToBreakEvenPercent)}</strong>
              <small>마지막 종가 기준</small>
            </article>
            <article className="metric-card">
              <span>최근 거래량 vs 평균</span>
              <strong>{formatPercent(insights.latestVolumeVsAveragePercent)}</strong>
              <small>선택 기간 평균 거래량 대비</small>
            </article>
            <article className="metric-card">
              <span>ATR 기준 보유금액 변동 폭</span>
              <strong>{formatMoney(insights.atrEstimatedPositionValueMovement, currency)}</strong>
              <small>과거 변동 폭 참고값</small>
            </article>
          </div>

          <div className="portfolio-insight-detail-grid">
            <section className="surface-panel portfolio-range-panel">
              <div className="card-heading">
                <span className="card-label">PERIOD RANGE</span>
                <h3>기간 가격 범위 내 위치</h3>
              </div>
              <div className="portfolio-range-values">
                <span>저가 {formatMoney(insights.periodRange.low, currency)}</span>
                <span>고가 {formatMoney(insights.periodRange.high, currency)}</span>
              </div>
              <div className="portfolio-range-legend">
                <span><i className="portfolio-range-dot-current" aria-hidden="true" />현재가 {formatPercent(insights.periodRange.currentPricePositionPercent)}</span>
                <span><i className="portfolio-range-dot-average" aria-hidden="true" />평균단가 {formatPercent(insights.periodRange.averagePricePositionPercent)}</span>
              </div>
              <div
                className="portfolio-range-track"
                style={rangeStyle}
                role="img"
                aria-label={`현재가 위치 ${formatPercent(insights.periodRange.currentPricePositionPercent)}, 평균단가 위치 ${formatPercent(insights.periodRange.averagePricePositionPercent)}`}
              >
                <i className="portfolio-range-marker portfolio-range-marker-current" aria-hidden="true" />
                <i className="portfolio-range-marker portfolio-range-marker-average" aria-hidden="true" />
              </div>
            </section>

            <section className="surface-panel portfolio-return-panel">
              <div className="card-heading">
                <span className="card-label">OBSERVED RETURNS</span>
                <h3>거래일 기준 변화율</h3>
              </div>
              <div className="portfolio-return-list">
                <div><span>5거래일</span><strong>{formatPercent(insights.rollingReturns.fiveTradingDaysPercent)}</strong></div>
                <div><span>20거래일</span><strong>{formatPercent(insights.rollingReturns.twentyTradingDaysPercent)}</strong></div>
                <div><span>60거래일</span><strong>{formatPercent(insights.rollingReturns.sixtyTradingDaysPercent)}</strong></div>
                <div><span>SMA20 거리</span><strong>{formatPercent(insights.trendDistance.fromSma20Percent)}</strong></div>
                <div><span>SMA50 거리</span><strong>{formatPercent(insights.trendDistance.fromSma50Percent)}</strong></div>
              </div>
            </section>
          </div>

          {insights.sensitivity.length ? (
            <section className="surface-panel portfolio-sensitivity-panel">
              <div className="card-heading">
                <span className="card-label">SENSITIVITY</span>
                <h3>가격 변화 가정 계산</h3>
                <p>마지막 종가에 단순 변화율을 적용한 산술 결과입니다.</p>
              </div>
              <div className="portfolio-sensitivity-table-wrap">
                <table className="portfolio-sensitivity-table">
                  <thead>
                    <tr>
                      <th>가정 변화</th>
                      <th>가정 가격</th>
                      <th>평가금액</th>
                      <th>평가손익</th>
                      <th>손익률</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insights.sensitivity.map((item) => (
                      <tr key={item.hypotheticalChangePercent}>
                        <th>{formatPercent(item.hypotheticalChangePercent)}</th>
                        <td>{formatMoney(item.assumedPrice, currency)}</td>
                        <td>{formatMoney(item.positionValue, currency)}</td>
                        <td className={item.unrealizedProfit >= 0 ? 'metric-positive' : 'metric-negative'}>
                          {formatMoney(item.unrealizedProfit, currency)}
                        </td>
                        <td className={item.unrealizedProfitRate >= 0 ? 'metric-positive' : 'metric-negative'}>
                          {formatPercent(item.unrealizedProfitRate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
