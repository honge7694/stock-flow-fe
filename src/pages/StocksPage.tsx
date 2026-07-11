import { type FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createStock, deleteStock, fetchStocks, updateStock } from '../api/stocksApi';
import { LoadingOverlay } from '../components/LoadingOverlay';
import type { ReportPeriod, Stock, StockRequest } from '../types/report';

type StocksPageProps = {
  accessToken: string;
};

const periodOptions: ReportPeriod[] = ['1m', '3m', '6m', '1y'];

const emptyForm: StockRequest = {
  ticker: '',
  name: '',
  quantity: '',
  averagePrice: '',
  currency: 'KRW',
  scheduleEnabled: true,
  scheduleTime: '08:00',
  scheduleTimezone: 'Asia/Seoul',
  reportPeriod: '6m',
  includeAi: false,
};

function formatNumber(value: number | null | undefined, digits = 2) {
  if (value === null || value === undefined) return '-';
  return value.toLocaleString('ko-KR', { maximumFractionDigits: digits });
}

function hasHoldingInfo(stock: Stock) {
  return stock.quantity !== null && stock.quantity !== undefined && stock.averagePrice !== null && stock.averagePrice !== undefined;
}

function hasPartialHoldingInfo(stock: Stock) {
  return Boolean(stock.quantity ?? stock.averagePrice ?? stock.currency) && !hasHoldingInfo(stock);
}

export function StocksPage({ accessToken }: StocksPageProps) {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [form, setForm] = useState<StockRequest>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'saving' | 'error'>('idle');
  const [message, setMessage] = useState<string>();

  async function loadStocks() {
    if (!accessToken) return;
    setStatus('loading');
    setMessage(undefined);

    try {
      setStocks(await fetchStocks(accessToken));
      setStatus('idle');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '관심 종목을 불러오지 못했습니다.');
      setStatus('error');
    }
  }

  useEffect(() => {
    void loadStocks();
  }, [accessToken]);

  function editStock(stock: Stock) {
    setEditingId(stock.id);
    setIsFormOpen(true);
    setForm({
      ticker: stock.ticker,
      name: stock.name ?? '',
      quantity: stock.quantity ?? '',
      averagePrice: stock.averagePrice ?? '',
      currency: stock.currency ?? 'KRW',
      scheduleEnabled: stock.scheduleEnabled,
      scheduleTime: stock.scheduleTime,
      scheduleTimezone: stock.scheduleTimezone,
      reportPeriod: stock.reportPeriod,
      includeAi: stock.includeAi,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function openCreateForm() {
    resetForm();
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    resetForm();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('saving');
    setMessage(undefined);

    try {
      if (editingId) {
        await updateStock(editingId, form, accessToken);
      } else {
        await createStock(form, accessToken);
      }
      resetForm();
      setIsFormOpen(false);
      await loadStocks();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '관심 종목 저장에 실패했습니다.');
      setStatus('error');
    }
  }

  async function handleDelete(id: string) {
    setStatus('saving');
    setMessage(undefined);

    try {
      await deleteStock(id, accessToken);
      await loadStocks();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '관심 종목 삭제에 실패했습니다.');
      setStatus('error');
    }
  }

  if (!accessToken) {
    return <section className="state-panel">관심 종목 관리는 로그인이 필요합니다.</section>;
  }

  return (
    <section className="content-section stocks-page">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">WATCHLIST</p>
          <h1>관심 종목</h1>
          <p>교육용 리포트와 보유 분석에 사용할 종목 정보를 관리합니다.</p>
        </div>
      </div>

      <div className="management-grid">
        <div className="surface-panel">
          <div className="panel-toolbar">
            <div>
              <span className="card-label">TRACKED SYMBOLS</span>
              <h2>등록된 종목</h2>
            </div>
            <div className="panel-actions">
              <span className="pill">{stocks.length}개</span>
              <button type="button" className="compact-add-button" onClick={openCreateForm}>
                종목 추가
              </button>
            </div>
          </div>
          {message ? <p className="form-error">{message}</p> : null}
          {status === 'loading' ? (
            <LoadingOverlay title="관심 종목을 불러오는 중입니다" description="등록된 종목과 예약 설정 정보를 서버에서 확인하고 있습니다." />
          ) : null}
          <div className="table-list">
            {stocks.map((stock) => (
              <article className={`list-row stock-row ${editingId === stock.id ? 'stock-row-active' : ''}`} key={stock.id}>
                <div className="stock-identity">
                  <strong>{stock.ticker}</strong>
                  <p>{stock.name ?? '이름 없음'}</p>
                </div>
                <div className="stock-holding-summary">
                  {hasHoldingInfo(stock) ? (
                    <>
                      <span className="pill pill-accent">보유 정보 있음</span>
                      <span>{formatNumber(stock.quantity, 4)}주</span>
                      <span>
                        평균 {formatNumber(stock.averagePrice)} {stock.currency ?? ''}
                      </span>
                    </>
                  ) : (
                    <span className={hasPartialHoldingInfo(stock) ? 'pill status-caution' : 'pill'}>{hasPartialHoldingInfo(stock) ? '보유 정보 미완성' : '보유 정보 없음'}</span>
                  )}
                </div>
                <div className="stock-meta-row">
                  <span className="pill">{stock.reportPeriod}</span>
                  <span className="pill">{stock.scheduleEnabled ? `매일 ${stock.scheduleTime}` : '예약 꺼짐'}</span>
                  <span className={`pill ${stock.includeAi ? 'pill-accent' : ''}`}>
                    AI {stock.includeAi ? '포함' : '제외'}
                  </span>
                </div>
                <div className="row-actions">
                  {hasHoldingInfo(stock) ? (
                    <Link
                      className="row-action-link"
                      to={`/portfolio-analyses/new?savedStockId=${encodeURIComponent(stock.id)}&ticker=${encodeURIComponent(stock.ticker)}&quantity=${encodeURIComponent(String(stock.quantity))}&averagePrice=${encodeURIComponent(String(stock.averagePrice))}&currency=${encodeURIComponent(stock.currency ?? '')}`}
                      aria-label={`보유 분석 만들기 ${stock.name ?? stock.ticker}`}
                    >
                      보유 분석
                    </Link>
                  ) : (
                    <button type="button" className="secondary-button" onClick={() => editStock(stock)}>
                      보유 정보 입력
                    </button>
                  )}
                  <Link
                    className="row-action-link row-action-link-secondary"
                    to={`/reports/new?ticker=${encodeURIComponent(stock.ticker)}`}
                    aria-label={`리포트 생성 ${stock.name ?? stock.ticker}`}
                  >
                    리포트
                  </Link>
                  <button type="button" className="secondary-button" onClick={() => editStock(stock)}>
                    수정
                  </button>
                  <button type="button" className="secondary-button danger-button" onClick={() => handleDelete(stock.id)}>
                    삭제
                  </button>
                </div>
              </article>
            ))}
            {status !== 'loading' && stocks.length === 0 ? <p>등록된 관심 종목이 없습니다.</p> : null}
          </div>
        </div>

        <form className={`data-form side-form ${isFormOpen ? 'is-open' : ''}`} onSubmit={handleSubmit}>
          <div className="card-heading">
            <div>
              <span className="card-label">{editingId ? 'EDIT SYMBOL' : 'ADD SYMBOL'}</span>
              <h2>{editingId ? '종목 수정' : '종목 추가'}</h2>
            </div>
            <button type="button" className="sheet-close-button" aria-label="종목 폼 닫기" onClick={closeForm}>
              닫기
            </button>
          </div>
          <div className="form-section">
            <span className="card-label">SYMBOL</span>
            <label>
              <span>종목 코드</span>
              <input value={form.ticker} onChange={(event) => setForm({ ...form, ticker: event.target.value })} required />
            </label>
            <label>
              <span>종목명</span>
              <input value={form.name ?? ''} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </label>
          </div>
          <div className="form-section">
            <span className="card-label">HOLDING INFO</span>
            <div className="form-section-header">
              <h3>보유 분석 정보</h3>
              <p>입력하면 보유 분석에서 다시 입력하지 않아도 됩니다.</p>
            </div>
            <label>
              <span>보유 수량</span>
              <input
                className="numeric-input"
                inputMode="decimal"
                value={form.quantity ?? ''}
                placeholder="예: 10"
                onChange={(event) => setForm({ ...form, quantity: event.target.value })}
              />
            </label>
            <label>
              <span>평균 단가</span>
              <input
                className="numeric-input"
                inputMode="decimal"
                value={form.averagePrice ?? ''}
                placeholder="예: 72000"
                onChange={(event) => setForm({ ...form, averagePrice: event.target.value })}
              />
            </label>
            <label>
              <span>통화</span>
              <select value={form.currency ?? ''} onChange={(event) => setForm({ ...form, currency: event.target.value })}>
                <option value="">자동</option>
                <option value="KRW">KRW</option>
                <option value="USD">USD</option>
                <option value="JPY">JPY</option>
                <option value="EUR">EUR</option>
              </select>
            </label>
          </div>
          <div className="form-section">
            <span className="card-label">REPORT SCHEDULE</span>
            <label>
              <span>예약 시간</span>
              <input
                type="time"
                value={form.scheduleTime}
                onChange={(event) => setForm({ ...form, scheduleTime: event.target.value })}
              />
            </label>
            <label>
              <span>시간대</span>
              <input
                value={form.scheduleTimezone}
                onChange={(event) => setForm({ ...form, scheduleTimezone: event.target.value })}
              />
            </label>
            <label>
              <span>분석 기간</span>
              <select
                value={form.reportPeriod}
                onChange={(event) => setForm({ ...form, reportPeriod: event.target.value as ReportPeriod })}
              >
                {periodOptions.map((period) => (
                  <option key={period} value={period}>
                    {period}
                  </option>
                ))}
              </select>
            </label>
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={form.scheduleEnabled}
                onChange={(event) => setForm({ ...form, scheduleEnabled: event.target.checked })}
              />
              <span>예약 활성화</span>
            </label>
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={form.includeAi}
                onChange={(event) => setForm({ ...form, includeAi: event.target.checked })}
              />
              <span>AI 학습 요약 포함</span>
            </label>
          </div>
          <div className="button-row">
            <button type="submit" disabled={status === 'saving'}>
              {editingId ? '수정 저장' : '종목 추가'}
            </button>
            <button type="button" className="secondary-button" onClick={closeForm}>
              취소
            </button>
          </div>
        </form>
        {isFormOpen ? <button type="button" className="mobile-sheet-backdrop" aria-label="종목 폼 닫기" onClick={closeForm} /> : null}
      </div>
    </section>
  );
}
