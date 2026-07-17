import { type FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  fetchPortfolioEducationAnalysisById,
  updatePortfolioEducationAnalysis,
} from '../api/portfolioApi';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { AnalysisV2Panel } from '../components/AnalysisV2Panel';
import { PortfolioInsightsPanel } from '../components/PortfolioInsightsPanel';
import type { PortfolioEducationAnalysisResponse, PortfolioEducationRequest, ReportInstrument } from '../types/report';
import { formatInteger, formatMoney, formatNumber, formatPercent } from '../utils/numberFormat';

type PortfolioEducationDetailPageProps = {
  accessToken: string;
};

type LocationState = {
  analysis?: PortfolioEducationAnalysisResponse;
};

type EditFormState = {
  ticker: string;
  quantity: string;
  averagePrice: string;
  currency: string;
  from: string;
  to: string;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatInstrumentTitle(analysis: PortfolioEducationAnalysisResponse) {
  return analysis.instrument?.name ? `${analysis.instrument.name} (${analysis.ticker})` : analysis.ticker;
}

function formatInstrumentMeta(instrument?: ReportInstrument) {
  if (!instrument || instrument.metadataStatus === 'unknown') return null;
  const parts = [instrument.exchange, instrument.currency, instrument.country].filter(Boolean);
  return parts.length ? parts.join(' · ') : null;
}

function toEditForm(analysis: PortfolioEducationAnalysisResponse): EditFormState {
  return {
    ticker: analysis.ticker,
    quantity: String(analysis.position.quantity),
    averagePrice: String(analysis.position.averagePrice),
    currency: analysis.position.currency ?? '',
    from: analysis.from,
    to: analysis.to,
  };
}

function buildRequest(form: EditFormState): PortfolioEducationRequest {
  return {
    ticker: form.ticker,
    quantity: form.quantity,
    averagePrice: form.averagePrice,
    currency: form.currency || undefined,
    from: form.from || undefined,
    to: form.to || undefined,
  };
}

function validateForm(form: EditFormState) {
  if (!form.ticker.trim()) return '종목을 입력해주세요.';
  if (Number(form.quantity) <= 0) return '수량은 0보다 커야 합니다.';
  if (Number(form.averagePrice) <= 0) return '평균 단가는 0보다 커야 합니다.';
  return undefined;
}

export function PortfolioEducationDetailPage({ accessToken }: PortfolioEducationDetailPageProps) {
  const { id } = useParams();
  const location = useLocation();
  const seededAnalysis = (location.state as LocationState | null)?.analysis;
  const [analysis, setAnalysis] = useState<PortfolioEducationAnalysisResponse | null>(seededAnalysis ?? null);
  const [editForm, setEditForm] = useState<EditFormState | null>(seededAnalysis ? toEditForm(seededAnalysis) : null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>(seededAnalysis ? 'idle' : 'loading');
  const [actionStatus, setActionStatus] = useState<'idle' | 'saving'>('idle');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string }>();

  useEffect(() => {
    if (!accessToken || !id) return;
    if (seededAnalysis?.id === id) return;
    const analysisId = id;

    async function loadAnalysis() {
      setStatus('loading');
      setMessage(undefined);
      try {
        const nextAnalysis = await fetchPortfolioEducationAnalysisById(analysisId, accessToken);
        setAnalysis(nextAnalysis);
        setEditForm(toEditForm(nextAnalysis));
        setStatus('idle');
      } catch (error) {
        setMessage({ tone: 'error', text: error instanceof Error ? error.message : '보유 분석 상세를 불러오지 못했습니다.' });
        setStatus('error');
      }
    }

    void loadAnalysis();
  }, [accessToken, id, seededAnalysis]);

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id || !editForm) return;
    const validationMessage = validateForm(editForm);
    if (validationMessage) {
      setMessage({ tone: 'error', text: validationMessage });
      return;
    }

    setActionStatus('saving');
    setMessage(undefined);

    try {
      const nextAnalysis = await updatePortfolioEducationAnalysis(id, buildRequest(editForm), accessToken);
      setAnalysis(nextAnalysis);
      setEditForm(toEditForm(nextAnalysis));
      setIsEditOpen(false);
      setMessage({ tone: 'success', text: '입력값을 반영해 분석을 다시 정리했습니다.' });
    } catch (error) {
      setMessage({ tone: 'error', text: error instanceof Error ? error.message : '보유 분석 수정에 실패했습니다.' });
    } finally {
      setActionStatus('idle');
    }
  }

  async function handleRetryAnalysis() {
    if (!id || !editForm) return;

    setActionStatus('saving');
    setMessage(undefined);

    try {
      const nextAnalysis = await updatePortfolioEducationAnalysis(id, buildRequest(editForm), accessToken);
      setAnalysis(nextAnalysis);
      setEditForm(toEditForm(nextAnalysis));
      setMessage({ tone: 'success', text: '보유 상태와 AI 학습 요약을 다시 정리했습니다.' });
    } catch (error) {
      setMessage({ tone: 'error', text: error instanceof Error ? error.message : '보유 분석 재요청에 실패했습니다.' });
    } finally {
      setActionStatus('idle');
    }
  }

  if (!accessToken) {
    return <section className="state-panel">보유 분석 상세는 로그인이 필요합니다.</section>;
  }

  if (status === 'loading') {
    return <LoadingOverlay title="보유 분석 상세를 불러오는 중입니다" description="보유 포지션과 AI 학습 요약을 서버에서 가져오고 있습니다." />;
  }

  if (status === 'error' || !analysis || !editForm) {
    return <section className="state-panel state-panel-error">{message?.text ?? '보유 분석 상세를 표시할 수 없습니다.'}</section>;
  }

  const instrumentMeta = formatInstrumentMeta(analysis.instrument);
  const positionTone =
    analysis.position.unrealizedProfitRate === null
      ? ''
      : analysis.position.unrealizedProfitRate >= 0
        ? 'metric-positive'
        : 'metric-negative';

  return (
    <section className="content-section portfolio-detail-page">
      <section className="hero portfolio-hero">
        <div className="report-hero-topline">
          <div>
            <p className="eyebrow">PORTFOLIO EDUCATION</p>
            <h1>{formatInstrumentTitle(analysis)} 보유 분석</h1>
          </div>
          <div className="portfolio-detail-actions">
            <Link className="secondary-link-button" to="/portfolio-analyses">
              목록
            </Link>
            <button type="button" className="secondary-button" onClick={() => setIsEditOpen((current) => !current)}>
              입력값 수정
            </button>
          </div>
        </div>
        <div className="meta">
          {instrumentMeta ? <span className="pill pill-accent">{instrumentMeta}</span> : null}
          <span className="pill">
            {analysis.from} - {analysis.to}
          </span>
          <span className="pill">수량 {formatNumber(analysis.position.quantity)}</span>
          <span className="pill">평균 {formatMoney(analysis.position.averagePrice, analysis.position.currency)}</span>
          <span className={analysis.aiStatus === 'available' ? 'pill status-positive' : 'pill status-negative'}>
            AI {analysis.aiStatus === 'available' ? '완료' : '실패'}
          </span>
          <span className="pill">생성 {formatDateTime(analysis.generatedAt)}</span>
        </div>
        <div className="metric-grid">
          <article className="metric-card">
            <span>투입금액</span>
            <strong>{formatMoney(analysis.position.totalCost, analysis.position.currency)}</strong>
          </article>
          <article className="metric-card">
            <span>현재 평가금액</span>
            <strong>{formatMoney(analysis.position.currentValue, analysis.position.currency)}</strong>
          </article>
          <article className={`metric-card ${positionTone}`}>
            <span>평가손익</span>
            <strong>{formatMoney(analysis.position.unrealizedProfit, analysis.position.currency)}</strong>
          </article>
          <article className={`metric-card ${positionTone}`}>
            <span>평가손익률</span>
            <strong>{formatPercent(analysis.position.unrealizedProfitRate)}</strong>
          </article>
        </div>
      </section>

      {message ? (
        <p className={message.tone === 'success' ? 'form-success' : 'form-error'} role="status">
          {message.text}
        </p>
      ) : null}

      {isEditOpen ? (
        <section className="surface-panel portfolio-edit-panel">
          <div className="card-heading">
            <span className="card-label">EDIT INPUTS</span>
            <h2>입력값 수정</h2>
          </div>
          <form className="query-form portfolio-form" onSubmit={handleUpdate}>
            <label className="ticker-field">
              <span>종목</span>
              <input value={editForm.ticker} onChange={(event) => setEditForm({ ...editForm, ticker: event.target.value })} />
            </label>
            <label>
              <span>보유 수량</span>
              <input
                inputMode="decimal"
                value={editForm.quantity}
                onChange={(event) => setEditForm({ ...editForm, quantity: event.target.value })}
              />
            </label>
            <label>
              <span>평균 단가</span>
              <input
                inputMode="decimal"
                value={editForm.averagePrice}
                onChange={(event) => setEditForm({ ...editForm, averagePrice: event.target.value })}
              />
            </label>
            <label>
              <span>통화</span>
              <input value={editForm.currency} onChange={(event) => setEditForm({ ...editForm, currency: event.target.value })} />
            </label>
            <label>
              <span>시작일</span>
              <input type="date" value={editForm.from} onChange={(event) => setEditForm({ ...editForm, from: event.target.value })} />
            </label>
            <label>
              <span>종료일</span>
              <input type="date" value={editForm.to} onChange={(event) => setEditForm({ ...editForm, to: event.target.value })} />
            </label>
            <button type="submit" disabled={actionStatus === 'saving'}>
              {actionStatus === 'saving' ? '저장 중' : '수정 저장'}
            </button>
          </form>
        </section>
      ) : null}

      <PortfolioInsightsPanel
        basis={analysis.calculationBasis}
        insights={analysis.positionInsights}
        currency={analysis.position.currency}
      />

      {analysis.chartSummary ? (
        <section className="surface-panel">
          <div className="card-heading">
            <span className="card-label">CHART SUMMARY</span>
            <h2>가격 흐름 요약</h2>
          </div>
          <div className="metric-grid">
            <article className="metric-card">
              <span>최근 종가</span>
              <strong>{formatMoney(analysis.chartSummary.latestClose, analysis.position.currency)}</strong>
            </article>
            <article className="metric-card">
              <span>기간 변화율</span>
              <strong>{formatPercent(analysis.chartSummary.periodChangePercent)}</strong>
            </article>
            <article className="metric-card">
              <span>RSI 14</span>
              <strong>{formatNumber(analysis.chartSummary.latestRsi14)}</strong>
            </article>
            <article className="metric-card">
              <span>캔들 수</span>
              <strong>{formatInteger(analysis.chartSummary.candleCount)}</strong>
            </article>
          </div>
          <div className="summary-metric-strip">
            <span>SMA20 {formatNumber(analysis.chartSummary.latestSma20)}</span>
            <span>SMA50 {formatNumber(analysis.chartSummary.latestSma50)}</span>
            <span>평균 거래량 {formatInteger(analysis.chartSummary.averageVolume)}</span>
            <span>
              MACD {formatNumber(analysis.chartSummary.latestMacd?.macd)} / Signal{' '}
              {formatNumber(analysis.chartSummary.latestMacd?.signal)}
            </span>
          </div>
        </section>
      ) : null}

      {analysis.analysisV2 ? (
        <AnalysisV2Panel analysis={analysis.analysisV2} dataQuality={analysis.dataQuality} showComparison={false} />
      ) : null}

      <section className="surface-panel portfolio-ai-panel">
        <div className="card-heading">
          <span className="card-label">AI LEARNING</span>
          <h2>AI 학습 요약</h2>
        </div>
        {analysis.aiStatus === 'available' && analysis.aiAnalysis ? (
          <>
            <article className="portfolio-ai-summary">
              <strong>{analysis.aiAnalysis.beginnerSummary}</strong>
              <p>{analysis.aiAnalysis.positionExplanation}</p>
            </article>
            <div className="card-grid portfolio-scenario-grid">
              <article>
                <span className="card-label">상승 시나리오</span>
                <p>{analysis.aiAnalysis.scenarios.upward}</p>
              </article>
              <article>
                <span className="card-label">횡보 시나리오</span>
                <p>{analysis.aiAnalysis.scenarios.sideways}</p>
              </article>
              <article>
                <span className="card-label">하락 시나리오</span>
                <p>{analysis.aiAnalysis.scenarios.downward}</p>
              </article>
            </div>
            <div className="two-column">
              <article className="surface-subpanel">
                <h3>차트 읽기 가이드</h3>
                <ul>
                  {analysis.aiAnalysis.chartReadingGuide.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
              <article className="surface-subpanel">
                <h3>다음 학습 포인트</h3>
                <ul>
                  {analysis.aiAnalysis.nextLearningPoints.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </div>
            <article className="surface-subpanel">
              <h3>데이터 한계와 위험 교육</h3>
              <ul>
                {analysis.aiAnalysis.riskEducation.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <p className="muted-note">{analysis.aiAnalysis.disclaimer}</p>
          </>
        ) : (
          <article className="state-panel portfolio-ai-unavailable">
            <h3>AI 학습 요약을 표시하지 못했습니다.</h3>
            <p>{analysis.errorMessage ?? '포지션 지표와 차트 요약은 정상적으로 확인할 수 있습니다.'}</p>
            <button
              type="button"
              className="secondary-button portfolio-ai-retry"
              disabled={actionStatus === 'saving'}
              onClick={() => void handleRetryAnalysis()}
            >
              {actionStatus === 'saving' ? (
                <span className="button-loading-label">
                  <span className="loading-spinner loading-spinner-button" aria-hidden="true" />
                  다시 분석 중
                </span>
              ) : (
                '다시 분석 요청'
              )}
            </button>
          </article>
        )}
      </section>

    </section>
  );
}
