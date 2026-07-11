import { type FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { createPortfolioEducationAnalysis } from '../api/portfolioApi';
import { LoadingOverlay } from '../components/LoadingOverlay';
import type { PortfolioEducationRequest } from '../types/report';

type PortfolioEducationCreatePageProps = {
  accessToken: string;
};

type PortfolioFormState = {
  savedStockId: string;
  ticker: string;
  quantity: string;
  averagePrice: string;
  currency: string;
  from: string;
  to: string;
};

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function sixMonthsAgoString() {
  const date = new Date();
  date.setMonth(date.getMonth() - 6);
  return date.toISOString().slice(0, 10);
}

function buildRequest(form: PortfolioFormState): PortfolioEducationRequest {
  return {
    savedStockId: form.savedStockId || undefined,
    ticker: form.ticker,
    quantity: form.quantity,
    averagePrice: form.averagePrice,
    currency: form.currency || undefined,
    from: form.from || undefined,
    to: form.to || undefined,
  };
}

function validateForm(form: PortfolioFormState) {
  if (!form.ticker.trim()) return '종목을 입력해주세요.';
  if (!form.savedStockId || form.quantity) {
    if (Number(form.quantity) <= 0) return '수량은 0보다 커야 합니다.';
  }
  if (!form.savedStockId || form.averagePrice) {
    if (Number(form.averagePrice) <= 0) return '평균 단가는 0보다 커야 합니다.';
  }
  return undefined;
}

export function PortfolioEducationCreatePage({ accessToken }: PortfolioEducationCreatePageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSavedStockId = searchParams.get('savedStockId') ?? '';
  const initialTicker = searchParams.get('ticker') ?? '';
  const [form, setForm] = useState<PortfolioFormState>({
    savedStockId: initialSavedStockId,
    ticker: initialTicker,
    quantity: searchParams.get('quantity') ?? '',
    averagePrice: searchParams.get('averagePrice') ?? '',
    currency: searchParams.get('currency') ?? 'KRW',
    from: sixMonthsAgoString(),
    to: todayString(),
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [message, setMessage] = useState<string>();

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationMessage = validateForm(form);
    if (validationMessage) {
      setStatus('error');
      setMessage(validationMessage);
      return;
    }

    setStatus('loading');
    setMessage(undefined);

    try {
      const analysis = await createPortfolioEducationAnalysis(buildRequest(form), accessToken);
      navigate(`/portfolio-analyses/${analysis.id}`, { state: { analysis } });
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : '보유 분석 생성에 실패했습니다.');
    }
  }

  if (!accessToken) {
    return <section className="state-panel">보유 분석 생성은 로그인이 필요합니다.</section>;
  }

  return (
    <section className="content-section portfolio-page">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">PORTFOLIO EDUCATION</p>
          <h1>보유 분석 만들기</h1>
          <p>보유 수량과 평균 단가를 입력해 포지션을 학습용으로 정리합니다.</p>
        </div>
        <Link className="secondary-link-button" to="/portfolio-analyses">
          목록으로
        </Link>
      </div>

      <div className="report-workflow-grid portfolio-workflow-grid">
        <div className="workflow-card">
          <div className="card-heading">
            <span className="card-label">POSITION INPUT</span>
            <h2>분석 조건</h2>
          </div>
          <form className="query-form portfolio-form" onSubmit={handleCreate}>
            <label className="ticker-field">
              <span>종목</span>
              <input
                value={form.ticker}
                placeholder="예: 005930.KS"
                onChange={(event) => setForm({ ...form, ticker: event.target.value })}
              />
              <small>종목 코드를 입력하면 대문자로 정리해 요청합니다.</small>
            </label>
            <label>
              <span>보유 수량</span>
              <input
                inputMode="decimal"
                value={form.quantity}
                placeholder="예: 10"
                onChange={(event) => setForm({ ...form, quantity: event.target.value })}
              />
            </label>
            <label>
              <span>평균 단가</span>
              <input
                inputMode="decimal"
                value={form.averagePrice}
                placeholder="예: 72000"
                onChange={(event) => setForm({ ...form, averagePrice: event.target.value })}
              />
            </label>
            <label>
              <span>통화</span>
              <input
                value={form.currency}
                placeholder="KRW"
                onChange={(event) => setForm({ ...form, currency: event.target.value })}
              />
            </label>
            <label>
              <span>시작일</span>
              <input type="date" value={form.from} onChange={(event) => setForm({ ...form, from: event.target.value })} />
            </label>
            <label>
              <span>종료일</span>
              <input type="date" value={form.to} onChange={(event) => setForm({ ...form, to: event.target.value })} />
            </label>
            <button type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? (
                <span className="button-loading-label">
                  <span className="loading-spinner loading-spinner-button" aria-hidden="true" />
                  분석 중
                </span>
              ) : (
                '분석 만들기'
              )}
            </button>
          </form>
          {status === 'error' && message ? (
            <p className="form-error" role="status">
              {message}
            </p>
          ) : null}
        </div>

        <aside className="workflow-card context-card">
          <div className="card-heading">
            <span className="card-label">OUTPUT</span>
            <h2>분석에 포함되는 항목</h2>
          </div>
          <ul className="check-list">
            <li>평균 단가와 현재가 기반 평가 상태</li>
            <li>투입금액, 평가금액, 평가손익</li>
            <li>SMA, RSI, MACD 차트 요약</li>
            <li>AI 학습 요약과 관찰 포인트</li>
          </ul>
          <p className="muted-note">입력값과 과거 데이터 기반 참고 정보이며 투자 조언이나 매매 추천이 아닙니다.</p>
        </aside>
      </div>
      {status === 'loading' ? (
        <LoadingOverlay
          title="보유 분석을 만드는 중입니다"
          description="입력한 보유 수량과 평균 단가를 기준으로 과거 데이터와 지표를 정리하고 있습니다."
          subcopy="완료되면 자동으로 상세 화면으로 이동합니다."
        />
      ) : null}
    </section>
  );
}
