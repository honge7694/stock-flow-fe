import type { ReportResponse } from '../types/report';

type ReportSummaryProps = {
  report: ReportResponse;
};

export function ReportSummary({ report }: ReportSummaryProps) {
  const latestCandle = report.candles.at(-1);
  const generatedAt = new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(report.generatedAt));

  return (
    <section className="hero">
      <p className="eyebrow">STOCK FLOW REPORT</p>
      <h1>{report.ticker} 분석 리포트</h1>
      <div className="meta">
        <span className="pill">
          {report.from} - {report.to}
        </span>
        <span className="pill">{report.candles.length} candles</span>
        <span className="pill">Generated {generatedAt}</span>
      </div>
      {latestCandle ? (
        <div className="metric-grid">
          <article className="metric-card">
            <span>Latest close</span>
            <strong>{latestCandle.close.toLocaleString('ko-KR')}</strong>
          </article>
          <article className="metric-card">
            <span>Volume</span>
            <strong>{latestCandle.volume.toLocaleString('ko-KR')}</strong>
          </article>
        </div>
      ) : null}
      {report.aiAnalysis?.analysis ? <p className="ai-summary">{report.aiAnalysis.analysis.report.summary}</p> : null}
    </section>
  );
}
