import type { AiAnalysisResult } from '../types/report';
import { GlossaryText } from './GlossaryText';

type AiAnalysisPanelProps = {
  aiAnalysis?: AiAnalysisResult;
};

const statusLabels: Record<string, string> = {
  positive: '강화',
  caution: '확인 필요',
  neutral: '중립',
  negative: '약화',
  insufficient_data: '자료 부족',
};

const checklistLabels = ['추세', '모멘텀', '거래량', '변동성'];

export function AiAnalysisPanel({ aiAnalysis }: AiAnalysisPanelProps) {
  if (aiAnalysis?.status === 'unavailable') {
    return (
      <section className="content-section ai-report-section ai-report-unavailable">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">AI CHART READING</p>
            <h2>AI 차트 해석</h2>
            <p>AI 학습 요약 요청 결과입니다.</p>
          </div>
        </div>

        <article className="ai-unavailable-card" role="status">
          <span className="card-label">AI 분석 실패</span>
          <h3>AI 분석을 생성하지 못했습니다</h3>
          <p>
            차트와 가격 리포트는 정상적으로 확인할 수 있습니다. AI 학습 요약은 다시 생성하거나 잠시 후 확인해주세요.
          </p>
          {aiAnalysis.errorMessage ? <p className="ai-error-message">{aiAnalysis.errorMessage}</p> : null}
        </article>
      </section>
    );
  }

  if (!aiAnalysis?.analysis) {
    return null;
  }

  const { beginnerExplanation, checklist, indicatorSummary, report } = aiAnalysis.analysis;
  const checklistItems = Object.values(checklist);
  const summaryTitle = indicatorSummary?.title ?? report.headline;
  const summaryBody = indicatorSummary?.summary ?? beginnerExplanation.summary;

  return (
    <section className="content-section ai-report-section">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">AI CHART READING</p>
          <h2>AI 차트 해석</h2>
          <p>과거 데이터 기반 교육용 해석입니다.</p>
        </div>
      </div>

      <article className="ai-summary-card">
        <div>
          <span className="card-label">현재 흐름</span>
          <h3>
            <GlossaryText text={summaryTitle} />
          </h3>
        </div>
        <p>
          <GlossaryText text={summaryBody} />
        </p>
        {indicatorSummary?.keyTakeaways.length ? (
          <ul className="ai-takeaway-list">
            {indicatorSummary.keyTakeaways.map((item) => (
              <li key={item}>
                <GlossaryText text={item} />
              </li>
            ))}
          </ul>
        ) : null}
      </article>

      <div className="ai-section-block">
        <div className="ai-block-heading">
          <h3>핵심 지표 해석</h3>
          <p>각 지표가 현재 차트에서 보여주는 흐름입니다.</p>
        </div>
        <div className="ai-evidence-grid">
          {checklistItems.map((item, index) => (
            <article className={`ai-evidence-card status-${item.status}`} key={item.title}>
              <div className="evidence-topline">
                <span className="card-label">{checklistLabels[index] ?? '지표'}</span>
                <span className="pill">{statusLabels[item.status] ?? item.status}</span>
              </div>
              <h3>{item.title}</h3>
              <p>
                <GlossaryText text={item.summary || item.explanation || ''} />
              </p>
              {item.interpretation ? (
                <p className="evidence-interpretation">
                  <GlossaryText text={item.interpretation} />
                </p>
              ) : null}
              <div className="evidence-detail-grid">
                {item.evidence?.length ? (
                  <div>
                    <strong>근거</strong>
                    <ul>
                      {item.evidence.map((evidence) => (
                        <li key={evidence}>
                          <GlossaryText text={evidence} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {item.watchPoints?.length ? (
                  <div>
                    <strong>확인 기준</strong>
                    <ul>
                      {item.watchPoints.map((watchPoint) => (
                        <li key={watchPoint}>
                          <GlossaryText text={watchPoint} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {item.dataLimitations?.length ? (
                  <div>
                    <strong>데이터 한계</strong>
                    <ul>
                      {item.dataLimitations.map((limitation) => (
                        <li key={limitation}>
                          <GlossaryText text={limitation} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="ai-notes-grid">
        <article className="notes-card">
          <h3>차트 근거</h3>
          <ul>
            {report.observations.map((item) => (
              <li key={item}>
                <GlossaryText text={item} />
              </li>
            ))}
          </ul>
        </article>
        <article className="notes-card notes-card-criteria">
          <h3>다음 확인 기준</h3>
          <ul>
            {report.nextThingsToWatch.map((item) => (
              <li key={item}>
                <GlossaryText text={item} />
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className="reading-note">
        <strong>읽기 안내</strong>
        <p>
          <GlossaryText text={report.disclaimer} />
        </p>
      </div>
    </section>
  );
}
