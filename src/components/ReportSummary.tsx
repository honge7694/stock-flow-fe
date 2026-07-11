import type { ReactNode } from 'react';
import type { ReportInstrument, ReportPayload, ReportResponse } from '../types/report';

type ReportSummaryProps = {
  report: ReportResponse;
  payload: ReportPayload;
  action?: ReactNode;
};

function formatInstrumentTitle(report: ReportResponse) {
  return report.instrument?.name ? `${report.instrument.name} (${report.ticker})` : report.ticker;
}

function formatInstrumentMeta(instrument?: ReportInstrument) {
  if (!instrument || instrument.metadataStatus === 'unknown') return null;
  const parts = [instrument.exchange, instrument.currency, instrument.country].filter(Boolean);
  return parts.length ? parts.join(' · ') : null;
}

export function ReportSummary({ report, payload, action }: ReportSummaryProps) {
  const latestCandle = payload.candles.at(-1);
  const metrics = payload.summary?.metrics;
  const generatedAt = new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(report.generatedAt));
  const latestClose = metrics?.latestClose ?? latestCandle?.close;
  const latestVolume = metrics?.latestVolume ?? latestCandle?.volume;
  const candleCount = metrics?.candleCount ?? payload.candles.length;
  const instrumentMeta = formatInstrumentMeta(report.instrument);

  function formatNumber(value: number | null | undefined, digits = 0) {
    if (value === null || value === undefined) return '-';
    return value.toLocaleString('ko-KR', { maximumFractionDigits: digits });
  }

  function formatPercent(value: number | null | undefined) {
    if (value === null || value === undefined) return '-';
    return `${value.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}%`;
  }

  return (
    <section className="hero">
      <div className="report-hero-topline">
        <div>
          <p className="eyebrow">STOCK FLOW REPORT</p>
          <h1>{formatInstrumentTitle(report)} 분석 리포트</h1>
        </div>
        {action ? <div className="report-hero-action">{action}</div> : null}
      </div>
      <div className="meta">
        {instrumentMeta ? <span className="pill pill-accent">{instrumentMeta}</span> : null}
        <span className="pill">
          {report.from} - {report.to}
        </span>
        <span className="pill">캔들 {candleCount}개</span>
        <span className="pill">{report.source === 'manual' ? '직접 생성' : report.source}</span>
        <span className="pill">AI {report.includeAi ? '포함' : '제외'}</span>
        <span className="pill">생성 {generatedAt}</span>
      </div>
      {latestClose !== undefined || latestVolume !== undefined ? (
        <div className="metric-grid">
          <article className="metric-card">
            <span>최근 종가</span>
            <strong>{formatNumber(latestClose)}</strong>
          </article>
          <article className="metric-card">
            <span>거래량</span>
            <strong>{formatNumber(latestVolume)}</strong>
          </article>
          <article className="metric-card">
            <span>기간 변화율</span>
            <strong>{formatPercent(metrics?.periodChangePercent)}</strong>
          </article>
          <article className="metric-card">
            <span>RSI 14</span>
            <strong>{formatNumber(metrics?.latestRsi14, 2)}</strong>
          </article>
        </div>
      ) : null}
      {metrics ? (
        <div className="summary-metric-strip">
          <span>SMA20 {formatNumber(metrics.latestSma20, 2)}</span>
          <span>SMA50 {formatNumber(metrics.latestSma50, 2)}</span>
          <span>평균 거래량 {formatNumber(metrics.averageVolume, 0)}</span>
          <span>최근/평균 거래량 {formatNumber(metrics.recentVolumeVsAverage, 2)}배</span>
        </div>
      ) : null}
      {payload.aiAnalysis?.analysis ? <p className="ai-summary">{payload.aiAnalysis.analysis.report.summary}</p> : null}
    </section>
  );
}
