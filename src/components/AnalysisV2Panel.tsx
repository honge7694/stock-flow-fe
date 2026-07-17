import { useState } from 'react';
import type {
  AnalysisEvent,
  AnalysisV2Payload,
  DataQualityExclusionReason,
  MarketDataQuality,
  ReportComparison,
  ReportMetricChange,
} from '../types/report';
import { formatInteger, formatNumber, formatPercent } from '../utils/numberFormat';

const DEFAULT_EVENT_COUNT = 5;

type AnalysisV2PanelProps = {
  analysis: AnalysisV2Payload;
  dataQuality?: MarketDataQuality;
  showComparison?: boolean;
  currency?: string | null;
};

const exclusionLabels: Record<DataQualityExclusionReason, string> = {
  invalidDate: '날짜 형식 오류',
  missingValue: '필수 값 누락',
  nonFiniteValue: '계산 불가 값',
  nonPositivePrice: '0 이하 가격',
  negativeVolume: '음수 거래량',
  invalidOhlc: '가격 범위 오류',
  duplicateDate: '중복 날짜',
  outOfRange: '조회 범위 밖',
};

const eventLabels: Record<AnalysisEvent['type'], string> = {
  'sma-cross': '이동평균선 교차',
  'close-sma-cross': '종가·이동평균선 교차',
  'rsi-zone-change': 'RSI 구간 전환',
  'macd-signal-cross': 'MACD·Signal 교차',
  'macd-histogram-sign-change': 'MACD 히스토그램 전환',
};

type ComparisonMetricKey = keyof ReportComparison['changes'];

const comparisonMetrics: Record<
  ComparisonMetricKey,
  { label: string; observationSubject: string; unit: 'currency' | 'percentagePoint' | 'point' | 'ratio' }
> = {
  latestClose: { label: '최근 종가', observationSubject: '종가는', unit: 'currency' },
  periodChangePercent: { label: '기간 변화율', observationSubject: '기간 변화율은', unit: 'percentagePoint' },
  latestRsi14: { label: 'RSI 14', observationSubject: 'RSI 14는', unit: 'point' },
  recentVolumeVsAverage: { label: '최근/평균 거래량', observationSubject: '최근/평균 거래량은', unit: 'ratio' },
  maxDrawdownPercent: { label: '최대 낙폭', observationSubject: '최대 낙폭은', unit: 'percentagePoint' },
  volatility20d: { label: '20일 변동성', observationSubject: '20일 변동성은', unit: 'percentagePoint' },
  atr14Percent: { label: 'ATR 14 비율', observationSubject: 'ATR 14 비율은', unit: 'percentagePoint' },
};

const observationMetricMatchers: Array<[ComparisonMetricKey, RegExp]> = [
  ['latestClose', /종가/],
  ['periodChangePercent', /기간 변화율/],
  ['latestRsi14', /RSI\s*14/i],
  ['recentVolumeVsAverage', /최근\/평균 거래량|거래량 비율/],
  ['maxDrawdownPercent', /최대 낙폭/],
  ['volatility20d', /20일 변동성/],
  ['atr14Percent', /ATR\s*14\s*비율/i],
];

function formatComparisonValue(
  key: ComparisonMetricKey,
  value: number,
  currency?: string | null,
  includeSign = true,
) {
  const prefix = includeSign && value > 0 ? '+' : '';
  const formatted = `${prefix}${formatNumber(value)}`;
  const unit = comparisonMetrics[key].unit;

  if (unit === 'currency') return currency ? `${formatted} ${currency}` : formatted;
  if (unit === 'percentagePoint') return `${formatted}%p`;
  if (unit === 'point') return `${formatted}포인트`;
  return `${formatted}배`;
}

function formatChange(key: ComparisonMetricKey, change: ReportMetricChange, currency?: string | null) {
  if (change.direction === 'unavailable' || change.delta === null) return '비교 불가';
  return formatComparisonValue(key, change.delta, currency);
}

function formatComparisonObservation(
  observation: string,
  comparison: ReportComparison,
  currency?: string | null,
) {
  const metricKey = observationMetricMatchers.find(([, pattern]) => pattern.test(observation))?.[0];
  if (!metricKey) return observation;

  const change = comparison.changes[metricKey];
  const subject = comparisonMetrics[metricKey].observationSubject;
  if (change.direction === 'unavailable' || change.delta === null) {
    return `${subject} 직전 리포트와 비교할 수 없습니다.`;
  }
  if (change.direction === 'unchanged' || change.delta === 0) {
    return `${subject} 직전 리포트와 같습니다.`;
  }

  const directionLabel = change.direction === 'increased' ? '높아졌습니다.' : '낮아졌습니다.';
  return `${subject} 직전 리포트보다 ${formatComparisonValue(metricKey, Math.abs(change.delta), currency, false)} ${directionLabel}`;
}

function changeTone(key: ComparisonMetricKey, change: ReportMetricChange) {
  if (key === 'volatility20d' || key === 'atr14Percent') {
    if (change.direction === 'increased') return 'comparison-decreased';
    if (change.direction === 'decreased') return 'comparison-increased';
    return '';
  }
  if (change.direction === 'increased') return 'comparison-increased';
  if (change.direction === 'decreased') return 'comparison-decreased';
  return '';
}

function formatEventEvidence(event: AnalysisEvent) {
  const evidence = [
    event.period !== undefined ? `기간 ${event.period}` : null,
    event.threshold !== undefined ? `기준 ${formatNumber(event.threshold)}` : null,
    event.sma20 != null ? `SMA20 ${formatNumber(event.sma20)}` : null,
    event.sma50 != null ? `SMA50 ${formatNumber(event.sma50)}` : null,
    event.rsi != null ? `RSI ${formatNumber(event.rsi)}` : null,
    event.macd != null ? `MACD ${formatNumber(event.macd)}` : null,
    event.signal != null ? `Signal ${formatNumber(event.signal)}` : null,
    event.histogram != null ? `Histogram ${formatNumber(event.histogram)}` : null,
  ].filter(Boolean);

  return evidence.join(' · ');
}

export function AnalysisV2Panel({
  analysis,
  dataQuality,
  showComparison = true,
  currency,
}: AnalysisV2PanelProps) {
  const [showAllEvents, setShowAllEvents] = useState(false);
  const riskItems = [
    ['최대 낙폭', formatPercent(analysis.risk.maxDrawdownPercent), analysis.availability.maxDrawdown],
    ['현재 낙폭', formatPercent(analysis.risk.currentDrawdownPercent), analysis.availability.currentDrawdown],
    ['20일 변동성', formatPercent(analysis.risk.volatility20d), analysis.availability.volatility20d],
    ['ATR 14', formatNumber(analysis.risk.atr14), analysis.availability.atr14],
    ['ATR 14 비율', formatPercent(analysis.risk.atr14Percent), analysis.availability.atr14],
    [
      '최장 회복 기간',
      analysis.risk.longestRecoveryDays === null ? '-' : `${formatInteger(analysis.risk.longestRecoveryDays)}거래일`,
      analysis.availability.longestRecoveryDays,
    ],
  ] as const;
  const comparison = showComparison ? analysis.comparison : null;
  const exclusions = dataQuality
    ? (Object.entries(dataQuality.exclusions) as [DataQualityExclusionReason, number][])
    : [];
  const limitations = [...analysis.dataLimitations, ...(comparison?.dataLimitations ?? [])];
  const hasMoreEvents = analysis.events.length > DEFAULT_EVENT_COUNT;
  const visibleEvents = showAllEvents ? analysis.events : analysis.events.slice(0, DEFAULT_EVENT_COUNT);

  return (
    <section className="content-section analysis-v2-section">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">MARKET DATA ANALYSIS</p>
          <h2>시장 데이터 분석</h2>
        </div>
        <span className="pill">분석 스키마 V2</span>
      </div>

      <section className="surface-panel analysis-risk-panel">
        <div className="card-heading">
          <span className="card-label">RISK METRICS</span>
          <h3>변동성과 하락 구간</h3>
        </div>
        <div className="analysis-risk-grid">
          {riskItems.map(([label, value, available]) => (
            <article className="analysis-risk-item" key={label}>
              <span>{label}</span>
              <strong>{available ? value : '-'}</strong>
            </article>
          ))}
        </div>
      </section>

      <div className={comparison ? 'analysis-v2-grid' : 'analysis-v2-grid analysis-v2-grid-single'}>
        <section className="surface-panel analysis-event-panel">
          <div className="card-heading analysis-panel-heading">
            <div>
              <span className="card-label">INDICATOR EVENTS</span>
              <h3>최근 지표 전환</h3>
            </div>
            <span className="pill">{formatInteger(analysis.events.length)}개</span>
          </div>
          {analysis.events.length ? (
            <>
              <ol className="analysis-event-list" id="analysis-event-list">
                {visibleEvents.map((event, index) => {
                  const evidence = formatEventEvidence(event);
                  return (
                    <li key={`${event.type}-${event.time}-${index}`}>
                      <span className={`analysis-event-marker analysis-event-${event.direction}`} aria-hidden="true" />
                      <div>
                        <div className="analysis-event-meta">
                          <strong>{eventLabels[event.type]}</strong>
                          <time dateTime={event.time}>{event.time}</time>
                        </div>
                        <p>{event.description}</p>
                        {evidence ? <small>{evidence}</small> : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
              {hasMoreEvents ? (
                <button
                  type="button"
                  className="secondary-button analysis-event-toggle"
                  aria-expanded={showAllEvents}
                  aria-controls="analysis-event-list"
                  onClick={() => setShowAllEvents((current) => !current)}
                >
                  {showAllEvents
                    ? '접기'
                    : `나머지 ${formatInteger(analysis.events.length - DEFAULT_EVENT_COUNT)}개 펼치기`}
                </button>
              ) : null}
            </>
          ) : (
            <p className="analysis-empty">선택 기간에 확인된 지표 전환이 없습니다.</p>
          )}
        </section>

        {comparison ? (
          <section className="surface-panel analysis-comparison-panel">
            <div className="card-heading">
              <span className="card-label">PREVIOUS REPORT</span>
              <h3>직전 리포트와 비교</h3>
              <p>
                {comparison.previousRange.from} - {comparison.previousRange.to}
              </p>
            </div>
            <div className="analysis-comparison-list">
              {(Object.entries(comparison.changes) as [ComparisonMetricKey, ReportMetricChange][]).map(([key, change]) => (
                <div key={key}>
                  <span>{comparisonMetrics[key].label}</span>
                  <strong className={changeTone(key, change)}>{formatChange(key, change, currency)}</strong>
                </div>
              ))}
            </div>
            {comparison.observations.length ? (
              <ul className="analysis-observation-list">
                {comparison.observations.map((observation) => (
                  <li key={observation}>{formatComparisonObservation(observation, comparison, currency)}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ) : null}
      </div>

      {dataQuality || limitations.length ? (
        <section className="surface-panel analysis-quality-panel">
          <div className="card-heading">
            <span className="card-label">DATA QUALITY</span>
            <h3>데이터 품질과 계산 범위</h3>
          </div>
          {dataQuality ? (
            <div className="analysis-quality-counts">
              <span>수신 {formatInteger(dataQuality.receivedRowCount)}건</span>
              <span>분석 사용 {formatInteger(dataQuality.acceptedRowCount)}건</span>
              <span>제외 {formatInteger(dataQuality.excludedRowCount)}건</span>
            </div>
          ) : null}
          {exclusions.length ? (
            <div className="analysis-exclusion-list">
              {exclusions.map(([reason, count]) => (
                <span key={reason}>
                  {exclusionLabels[reason]} {formatInteger(count)}건
                </span>
              ))}
            </div>
          ) : null}
          {limitations.length ? (
            <ul className="analysis-limitation-list">
              {[...new Set(limitations)].map((limitation) => (
                <li key={limitation}>{limitation}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}
    </section>
  );
}
