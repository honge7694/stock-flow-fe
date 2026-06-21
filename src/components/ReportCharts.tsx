import { createChart, type IChartApi, type Time } from 'lightweight-charts';
import { useEffect, useRef } from 'react';
import type { LinePoint, ReportResponse } from '../types/report';

type ReportChartsProps = {
  report: ReportResponse;
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

export function ReportCharts({ report }: ReportChartsProps) {
  const priceRef = useChart((chart) => {
    chart.addCandlestickSeries().setData(
      report.candles.map((candle) => ({
        ...candle,
        time: candle.time as Time,
      })),
    );
    chart.addLineSeries({ color: '#00d992', lineWidth: 2 }).setData(cleanLine(report.indicators.sma20));
    chart.addLineSeries({ color: '#8b949e', lineWidth: 2 }).setData(cleanLine(report.indicators.sma50));
  });

  const rsiRef = useChart((chart) => {
    chart.addLineSeries({ color: '#00d992', lineWidth: 2 }).setData(cleanLine(report.indicators.rsi14));
  });

  const macdRef = useChart((chart) => {
    chart.addLineSeries({ color: '#00d992', lineWidth: 2 }).setData(
      report.indicators.macd
        .filter((point) => point.macd !== null)
        .map((point) => ({ time: point.time as Time, value: point.macd as number })),
    );
    chart.addLineSeries({ color: '#8b949e', lineWidth: 2 }).setData(
      report.indicators.macd
        .filter((point) => point.signal !== null)
        .map((point) => ({ time: point.time as Time, value: point.signal as number })),
    );
    chart.addHistogramSeries({ color: '#10b981' }).setData(
      report.indicators.macd
        .filter((point) => point.histogram !== null)
        .map((point) => ({ time: point.time as Time, value: point.histogram as number })),
    );
  });

  const volumeRef = useChart((chart) => {
    chart.addHistogramSeries({ color: '#00d992' }).setData(cleanLine(report.indicators.volume));
  });

  return (
    <section className="content-section">
      <p className="eyebrow">TECHNICAL CHARTS</p>
      <h2>가격과 지표</h2>
      <div className="chart-stack">
        <article className="chart-card">
          <h3>Price / SMA</h3>
          <div ref={priceRef} />
        </article>
        <article className="chart-card">
          <h3>RSI 14</h3>
          <div ref={rsiRef} />
        </article>
        <article className="chart-card">
          <h3>MACD</h3>
          <div ref={macdRef} />
        </article>
        <article className="chart-card">
          <h3>Volume</h3>
          <div ref={volumeRef} />
        </article>
      </div>
    </section>
  );
}
