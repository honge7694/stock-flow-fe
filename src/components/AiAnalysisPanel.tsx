import type { AiAnalysis } from '../types/report';

type AiAnalysisPanelProps = {
  aiAnalysis?: AiAnalysis;
};

export function AiAnalysisPanel({ aiAnalysis }: AiAnalysisPanelProps) {
  if (!aiAnalysis?.analysis) {
    return <section className="content-section">AI 분석 결과가 없습니다.</section>;
  }

  const { beginnerExplanation, checklist, report } = aiAnalysis.analysis;
  const checklistItems = Object.values(checklist);

  return (
    <section className="content-section">
      <p className="eyebrow">AI ANALYSIS</p>
      <h2>{report.headline}</h2>
      <p>{beginnerExplanation.summary}</p>

      <div className="card-grid">
        {checklistItems.map((item) => (
          <article className={`feature-card status-${item.status}`} key={item.title}>
            <span className="pill">{item.status}</span>
            <h3>{item.title}</h3>
            <p>{item.explanation}</p>
          </article>
        ))}
      </div>

      <div className="two-column">
        <article>
          <h3>관찰 포인트</h3>
          <ul>
            {report.observations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article>
          <h3>다음에 볼 것</h3>
          <ul>
            {report.nextThingsToWatch.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>

      <p className="disclaimer">{report.disclaimer}</p>
    </section>
  );
}
