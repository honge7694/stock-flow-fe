import { createChart, type IChartApi, type Time } from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
import type { LinePoint, ReportPayload } from '../types/report';

type ReportChartsProps = {
  payload: ReportPayload;
};

function cleanLine(points: LinePoint[]) {
  return points
    .filter((point): point is { time: string; value: number } => point.value !== null)
    .map((point) => ({ time: point.time as Time, value: point.value }));
}

function useChart(render: (chart: IChartApi) => void) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      height: 300,
      layout: { background: { color: '#1a1a1a' }, textColor: '#bdbdbd' },
      grid: {
        vertLines: { color: '#2a2a2a' },
        horzLines: { color: '#2a2a2a' },
      },
      rightPriceScale: { borderColor: '#3d3a39' },
      timeScale: { borderColor: '#3d3a39' },
    });

    render(chart);
    chart.timeScale().fitContent();

    return () => chart.remove();
  }, [render]);

  return containerRef;
}

export function ReportCharts({ payload }: ReportChartsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const summary = payload.summary;
  const guideByTitle = new Map(summary?.guideItems.map((item) => [item.title.toLowerCase(), item]) ?? []);
  const candleGuide = guideByTitle.get('캔들');
  const movingAverageGuide = guideByTitle.get('이동평균선') ?? guideByTitle.get('sma');
  const rsiGuide = guideByTitle.get('rsi') ?? guideByTitle.get('rsi14');
  const macdGuide = guideByTitle.get('macd');
  const volumeGuide = guideByTitle.get('거래량') ?? guideByTitle.get('volume');
  const priceRef = useChart((chart) => {
    chart.addCandlestickSeries().setData(
      payload.candles.map((candle) => ({
        ...candle,
        time: candle.time as Time,
      })),
    );
    chart.addLineSeries({ color: '#00d992', lineWidth: 2 }).setData(cleanLine(payload.indicators.sma20));
    chart.addLineSeries({ color: '#8b949e', lineWidth: 2 }).setData(cleanLine(payload.indicators.sma50));
  });

  const rsiRef = useChart((chart) => {
    chart.addLineSeries({ color: '#00d992', lineWidth: 2 }).setData(cleanLine(payload.indicators.rsi14));
  });

  const macdRef = useChart((chart) => {
    chart.addLineSeries({ color: '#00d992', lineWidth: 2 }).setData(
      payload.indicators.macd
        .filter((point) => point.macd !== null)
        .map((point) => ({ time: point.time as Time, value: point.macd as number })),
    );
    chart.addLineSeries({ color: '#8b949e', lineWidth: 2 }).setData(
      payload.indicators.macd
        .filter((point) => point.signal !== null)
        .map((point) => ({ time: point.time as Time, value: point.signal as number })),
    );
    chart.addHistogramSeries({ color: '#10b981' }).setData(
      payload.indicators.macd
        .filter((point) => point.histogram !== null)
        .map((point) => ({ time: point.time as Time, value: point.histogram as number })),
    );
  });

  const volumeRef = useChart((chart) => {
    chart.addHistogramSeries({ color: '#00d992' }).setData(cleanLine(payload.indicators.volume));
  });

  return (
    <section className={`content-section price-report-section ${isExpanded ? '' : 'price-report-section-collapsed'}`}>
      <div className="price-report-header">
        <div>
          <p className="eyebrow">PRICE REPORT</p>
          <h2>가격 리포트</h2>
          <p className="price-report-summary">가격, 이동평균선, RSI, MACD, 거래량 차트를 확인합니다.</p>
        </div>
        <button
          type="button"
          className="secondary-button price-report-toggle"
          aria-expanded={isExpanded}
          aria-controls="price-report-charts"
          onClick={() => setIsExpanded((current) => !current)}
        >
          {isExpanded ? '접기' : '펼치기'}
        </button>
      </div>
      {isExpanded ? (
        <div className="chart-stack" id="price-report-charts">
          <article className="chart-card">
            <div className="chart-card-heading">
              <h3>가격 / 이동평균선</h3>
              {summary?.sections.price ? <p>{summary.sections.price}</p> : null}
              {candleGuide ? <p className="chart-guide-note">{candleGuide.body}</p> : null}
              {movingAverageGuide ? <p className="chart-guide-note">{movingAverageGuide.body}</p> : null}
            </div>
            <div ref={priceRef} />
          </article>
          <article className="chart-card">
            <div className="chart-card-heading">
              <div className="chart-heading-row">
                <h3>RSI 14</h3>
                {summary ? (
                  <span className={`pill ${summary.availability.hasRsi ? 'pill-accent' : ''}`}>
                    {summary.availability.hasRsi ? '데이터 있음' : '데이터 부족'}
                  </span>
                ) : null}
              </div>
              {summary?.sections.rsi ? <p>{summary.sections.rsi}</p> : null}
              {rsiGuide ? <p className="chart-guide-note">{rsiGuide.body}</p> : null}
            </div>
            <div ref={rsiRef} />
          </article>
          <article className="chart-card">
            <div className="chart-card-heading">
              <div className="chart-heading-row">
                <h3>MACD</h3>
                {summary ? (
                  <span className={`pill ${summary.availability.hasMacd ? 'pill-accent' : ''}`}>
                    {summary.availability.hasMacd ? '데이터 있음' : '데이터 부족'}
                  </span>
                ) : null}
              </div>
              {summary?.sections.macd ? <p>{summary.sections.macd}</p> : null}
              {macdGuide ? <p className="chart-guide-note">{macdGuide.body}</p> : null}
            </div>
            <div ref={macdRef} />
          </article>
          <article className="chart-card">
            <div className="chart-card-heading">
              <h3>거래량</h3>
              {summary?.sections.volume ? <p>{summary.sections.volume}</p> : null}
              {volumeGuide ? <p className="chart-guide-note">{volumeGuide.body}</p> : null}
            </div>
            <div ref={volumeRef} />
          </article>
          {summary?.disclaimer ? <p className="disclaimer price-disclaimer">{summary.disclaimer}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
