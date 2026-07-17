import {
  type CSSProperties,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import { deletePortfolioEducationAnalysis, fetchPortfolioEducationAnalyses } from '../api/portfolioApi';
import { LoadingOverlay } from '../components/LoadingOverlay';
import type {
  PortfolioEducationAnalysisListItem,
  PortfolioEducationAnalysisListResponse,
  PortfolioEducationListQuery,
  ReportInstrument,
  ReportPageSize,
} from '../types/report';

type PortfolioEducationPageProps = {
  accessToken: string;
};

const pageSizeOptions: ReportPageSize[] = [5, 10, 30, 50];
const portfolioSwipeActionWidth = 84;
const portfolioSwipeThreshold = 42;

const emptyPortfolioList: PortfolioEducationAnalysisListResponse = {
  items: [],
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0,
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatNumber(value: number | null | undefined, digits = 0) {
  if (value === null || value === undefined) return '-';
  return value.toLocaleString('ko-KR', { maximumFractionDigits: digits });
}

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) return '-';
  return `${value.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}%`;
}

function formatInstrumentTitle(item: PortfolioEducationAnalysisListItem) {
  return item.instrument?.name ? `${item.instrument.name} (${item.ticker})` : item.ticker;
}

function formatInstrumentMeta(instrument?: ReportInstrument) {
  if (!instrument || instrument.metadataStatus === 'unknown') return null;
  const parts = [instrument.exchange, instrument.currency, instrument.country].filter(Boolean);
  return parts.length ? parts.join(' · ') : null;
}

function getPageItems(page: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const orderedPages = [...pages].filter((item) => item >= 1 && item <= totalPages).sort((a, b) => a - b);
  const items: Array<number | 'ellipsis'> = [];

  orderedPages.forEach((item, index) => {
    const previous = orderedPages[index - 1];
    if (previous && item - previous > 1) {
      items.push('ellipsis');
    }
    items.push(item);
  });

  return items;
}

export function PortfolioEducationPage({ accessToken }: PortfolioEducationPageProps) {
  const [portfolioList, setPortfolioList] = useState<PortfolioEducationAnalysisListResponse>(emptyPortfolioList);
  const [filters, setFilters] = useState<PortfolioEducationListQuery>({});
  const [appliedFilters, setAppliedFilters] = useState<PortfolioEducationListQuery>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [pagination, setPagination] = useState<{ page: number; pageSize: ReportPageSize }>({ page: 1, pageSize: 10 });
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [deletingAnalysisId, setDeletingAnalysisId] = useState<string>();
  const [confirmingAnalysisId, setConfirmingAnalysisId] = useState<string>();
  const [swipedAnalysisId, setSwipedAnalysisId] = useState<string>();
  const [draggingAnalysisId, setDraggingAnalysisId] = useState<string>();
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string }>();
  const swipeStartRef = useRef<{ analysisId: string; x: number; y: number; initialOffset: number } | null>(null);
  const suppressCardClickRef = useRef(false);
  const deleteTriggerRef = useRef<HTMLButtonElement>(null);
  const deleteCancelButtonRef = useRef<HTMLButtonElement>(null);
  const items = portfolioList.items;
  const confirmingAnalysis = items.find((item) => item.id === confirmingAnalysisId);
  const totalPages = portfolioList.totalPages;
  const hasPagination = portfolioList.total > portfolioList.pageSize;
  const rangeStart = portfolioList.total === 0 ? 0 : (portfolioList.page - 1) * portfolioList.pageSize + 1;
  const rangeEnd = Math.min(portfolioList.page * portfolioList.pageSize, portfolioList.total);
  const isFiltered = Object.keys(appliedFilters).length > 0;

  useEffect(() => {
    if (!accessToken) return;

    async function loadAnalyses() {
      setStatus('loading');
      setMessage(undefined);
      try {
        const nextList = await fetchPortfolioEducationAnalyses(accessToken, undefined, {
          ...appliedFilters,
          page: pagination.page,
          pageSize: pagination.pageSize,
        });
        setPortfolioList(nextList);
        if (nextList.totalPages > 0 && pagination.page > nextList.totalPages) {
          setPagination((current) => ({ ...current, page: nextList.totalPages }));
        }
        setStatus('idle');
      } catch (error) {
        setMessage({ tone: 'error', text: error instanceof Error ? error.message : '보유 분석 목록을 불러오지 못했습니다.' });
        setStatus('error');
      }
    }

    void loadAnalyses();
  }, [accessToken, appliedFilters, pagination]);

  useEffect(() => {
    if (!confirmingAnalysisId) return;

    deleteCancelButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !deletingAnalysisId) {
        closeDeleteConfirmation();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [confirmingAnalysisId, deletingAnalysisId]);

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ticker = filters.ticker?.trim().toUpperCase();
    setAppliedFilters(ticker ? { ticker } : {});
    setFilters(ticker ? { ticker } : {});
    setIsFilterOpen(false);
    setPagination((current) => ({ ...current, page: 1 }));
  }

  function resetFilters() {
    setFilters({});
    setAppliedFilters({});
    setIsFilterOpen(false);
    setPagination((current) => ({ ...current, page: 1 }));
  }

  function changePage(page: number) {
    if (status === 'loading') return;
    setPagination((current) => ({ ...current, page }));
  }

  function changePageSize(pageSize: ReportPageSize) {
    setPagination({ page: 1, pageSize });
  }

  function closeSwipeAction() {
    setSwipedAnalysisId(undefined);
    setDraggingAnalysisId(undefined);
    setSwipeOffset(0);
  }

  function closeDeleteConfirmation() {
    setConfirmingAnalysisId(undefined);
    window.requestAnimationFrame(() => deleteTriggerRef.current?.focus());
  }

  function openDeleteConfirmation(analysisId: string, trigger: HTMLButtonElement) {
    closeSwipeAction();
    deleteTriggerRef.current = trigger;
    setConfirmingAnalysisId(analysisId);
  }

  function handleSwipeStart(event: ReactPointerEvent<HTMLElement>, analysisId: string) {
    if (event.pointerType !== 'touch' || deletingAnalysisId) return;

    swipeStartRef.current = {
      analysisId,
      x: event.clientX,
      y: event.clientY,
      initialOffset: swipedAnalysisId === analysisId ? -portfolioSwipeActionWidth : 0,
    };
    suppressCardClickRef.current = false;
    setDraggingAnalysisId(analysisId);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handleSwipeMove(event: ReactPointerEvent<HTMLElement>, analysisId: string) {
    const start = swipeStartRef.current;
    if (!start || start.analysisId !== analysisId) return;

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (Math.abs(deltaX) < Math.abs(deltaY) * 1.5) return;

    const nextOffset = Math.max(-portfolioSwipeActionWidth, Math.min(0, start.initialOffset + deltaX));
    if (Math.abs(deltaX) > 8) {
      suppressCardClickRef.current = true;
    }
    setSwipedAnalysisId(analysisId);
    setSwipeOffset(nextOffset);
  }

  function handleSwipeEnd(event: ReactPointerEvent<HTMLElement>, analysisId: string) {
    const start = swipeStartRef.current;
    if (!start || start.analysisId !== analysisId) return;

    const deltaX = event.clientX - start.x;
    const finalOffset = Math.max(-portfolioSwipeActionWidth, Math.min(0, start.initialOffset + deltaX));
    const shouldOpen = finalOffset <= -portfolioSwipeThreshold;

    setSwipedAnalysisId(shouldOpen ? analysisId : undefined);
    setDraggingAnalysisId(undefined);
    setSwipeOffset(shouldOpen ? -portfolioSwipeActionWidth : 0);
    swipeStartRef.current = null;
    window.setTimeout(() => {
      suppressCardClickRef.current = false;
    }, 0);
  }

  function handleAnalysisLinkClick(event: ReactMouseEvent<HTMLAnchorElement>, analysisId: string) {
    if (deletingAnalysisId || suppressCardClickRef.current || swipedAnalysisId === analysisId) {
      event.preventDefault();
      closeSwipeAction();
      suppressCardClickRef.current = false;
    }
  }

  async function handleDeleteAnalysis(item: PortfolioEducationAnalysisListItem) {
    setDeletingAnalysisId(item.id);
    setMessage(undefined);

    try {
      await deletePortfolioEducationAnalysis(item.id, accessToken);
      const nextPage = items.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page;
      const nextList = await fetchPortfolioEducationAnalyses(accessToken, undefined, {
        ...appliedFilters,
        page: nextPage,
        pageSize: pagination.pageSize,
      });
      setPortfolioList(nextList);
      if (nextPage !== pagination.page) {
        setPagination((current) => ({ ...current, page: nextPage }));
      } else if (nextList.totalPages > 0 && nextPage > nextList.totalPages) {
        setPagination((current) => ({ ...current, page: nextList.totalPages }));
      }
      setStatus('idle');
      setConfirmingAnalysisId(undefined);
      closeSwipeAction();
      setMessage({ tone: 'success', text: '보유 분석을 삭제했습니다.' });
    } catch (error) {
      setMessage({ tone: 'error', text: error instanceof Error ? error.message : '보유 분석 삭제에 실패했습니다.' });
      setStatus('error');
    } finally {
      setDeletingAnalysisId(undefined);
    }
  }

  if (!accessToken) {
    return <section className="state-panel">보유 분석은 로그인이 필요합니다.</section>;
  }

  return (
    <section className="content-section portfolio-page">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">PORTFOLIO EDUCATION</p>
          <h1>보유 분석</h1>
          <p>저장된 보유 포지션 분석을 확인하고 새 분석을 만들 수 있습니다.</p>
        </div>
        <Link className="primary-link-button" to="/portfolio-analyses/new">
          보유 분석 만들기
        </Link>
      </div>

      {message ? (
        <p className={message.tone === 'success' ? 'form-success' : 'form-error'} role="status">
          {message.text}
        </p>
      ) : null}

      <div className="surface-panel portfolio-list-panel">
        <form className="report-filter-form" onSubmit={handleFilterSubmit}>
          <div className="filter-heading">
            <div>
              <span className="card-label">SAVED ANALYSES</span>
              <h2>저장된 보유 분석</h2>
            </div>
            <div className="active-filter-strip" aria-label="적용된 필터">
              <span className={isFiltered ? 'pill pill-accent' : 'pill'}>{appliedFilters.ticker ?? '전체 종목'}</span>
            </div>
            <div className="filter-heading-actions">
              <span className="pill">총 {portfolioList.total}개</span>
              {isFiltered ? (
                <button type="button" className="secondary-button" onClick={resetFilters}>
                  필터 초기화
                </button>
              ) : null}
              <button
                type="button"
                className="secondary-button"
                aria-expanded={isFilterOpen}
                aria-controls="portfolio-filter-fields"
                onClick={() => {
                  setFilters(appliedFilters);
                  setIsFilterOpen((current) => !current);
                }}
              >
                {isFilterOpen ? '필터 닫기' : '필터 열기'}
              </button>
            </div>
          </div>
          {isFilterOpen ? (
            <div className="filter-panel-body" id="portfolio-filter-fields">
              <div className="filter-grid filter-grid-compact">
                <label>
                  <span>종목</span>
                  <input
                    value={filters.ticker ?? ''}
                    placeholder="예: AAPL"
                    onChange={(event) => setFilters({ ticker: event.target.value })}
                  />
                </label>
              </div>
              <div className="filter-actions">
                <button type="submit" disabled={status === 'loading'}>
                  필터 적용
                </button>
                <button type="button" className="secondary-button" onClick={resetFilters}>
                  필터 초기화
                </button>
              </div>
            </div>
          ) : null}
        </form>

        {status === 'loading' ? (
          <LoadingOverlay title="보유 분석 목록을 불러오는 중입니다" description="저장된 보유 포지션 분석과 페이지 정보를 확인하고 있습니다." />
        ) : null}
        <div className="table-list portfolio-list">
          {items.map((item) => {
            const instrumentMeta = formatInstrumentMeta(item.instrument);
            const isSwipeOpen = swipedAnalysisId === item.id && swipeOffset < 0;
            const rowStyle = {
              '--report-swipe-offset': `${swipedAnalysisId === item.id ? swipeOffset : 0}px`,
            } as CSSProperties;

            return (
              <div
                className={[
                  'report-swipe-shell',
                  isSwipeOpen ? 'is-open' : '',
                  draggingAnalysisId === item.id ? 'is-dragging' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                key={item.id}
              >
                <div className="report-swipe-action" aria-hidden={!isSwipeOpen}>
                  <button
                    type="button"
                    className="report-swipe-delete-button"
                    disabled={Boolean(deletingAnalysisId)}
                    tabIndex={isSwipeOpen ? 0 : -1}
                    aria-label={`보유 분석 삭제 확인 ${item.ticker}`}
                    onClick={(event) => openDeleteConfirmation(item.id, event.currentTarget)}
                  >
                    <svg className="report-delete-icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 7h16" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M6 7l1 14h10l1-14" />
                      <path d="M9 7V4h6v3" />
                    </svg>
                    <span>삭제</span>
                  </button>
                </div>
                <article
                  className="list-row report-row portfolio-row"
                  style={rowStyle}
                  onPointerDown={(event) => handleSwipeStart(event, item.id)}
                  onPointerMove={(event) => handleSwipeMove(event, item.id)}
                  onPointerUp={(event) => handleSwipeEnd(event, item.id)}
                  onPointerCancel={closeSwipeAction}
                >
                  <Link
                    className="report-row-link-body"
                    to={`/portfolio-analyses/${item.id}`}
                    aria-disabled={Boolean(deletingAnalysisId)}
                    onClick={(event) => handleAnalysisLinkClick(event, item.id)}
                  >
                    <div className="report-row-main">
                      <strong>{formatInstrumentTitle(item)}</strong>
                      {instrumentMeta ? <span className="instrument-meta">{instrumentMeta}</span> : null}
                      <p className="report-period">
                        {item.from} - {item.to}
                      </p>
                    </div>
                    <div className="portfolio-row-metrics">
                      <span>수량 {formatNumber(item.position.quantity, 4)}</span>
                      <span>평균 {formatNumber(item.position.averagePrice, 2)}</span>
                      <span>수익률 {formatPercent(item.position.unrealizedProfitRate)}</span>
                    </div>
                    <div className="report-row-meta">
                      <span className={item.aiStatus === 'available' ? 'pill status-positive' : 'pill status-negative'}>
                        AI {item.aiStatus === 'available' ? '완료' : '실패'}
                      </span>
                      <span className="date-cell">{formatDateTime(item.generatedAt)}</span>
                    </div>
                  </Link>
                  <button
                    type="button"
                    className="report-delete-trigger report-delete-trigger-desktop"
                    disabled={Boolean(deletingAnalysisId)}
                    aria-label={`보유 분석 삭제 확인 ${item.ticker}`}
                    title="보유 분석 삭제"
                    onClick={(event) => openDeleteConfirmation(item.id, event.currentTarget)}
                  >
                    <svg className="report-delete-icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 7h16" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M6 7l1 14h10l1-14" />
                      <path d="M9 7V4h6v3" />
                    </svg>
                  </button>
                </article>
              </div>
            );
          })}
          {confirmingAnalysis ? (
            <div
              className="report-delete-dialog-backdrop"
              role="presentation"
              onPointerDown={(event) => {
                if (event.target === event.currentTarget && !deletingAnalysisId) {
                  closeDeleteConfirmation();
                }
              }}
            >
              <section
                className="report-delete-dialog"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="portfolio-delete-dialog-title"
                aria-describedby="portfolio-delete-dialog-description portfolio-delete-dialog-warning"
              >
                <span className="card-label">DELETE ANALYSIS</span>
                <h2 id="portfolio-delete-dialog-title">보유 분석을 삭제할까요?</h2>
                <p id="portfolio-delete-dialog-description">{confirmingAnalysis.ticker} 보유 분석을 삭제할까요?</p>
                <p className="report-delete-dialog-warning" id="portfolio-delete-dialog-warning">
                  삭제한 보유 분석은 다시 복구할 수 없습니다.
                </p>
                <div className="report-delete-confirm-actions">
                  <button
                    ref={deleteCancelButtonRef}
                    type="button"
                    className="secondary-button"
                    disabled={Boolean(deletingAnalysisId)}
                    onClick={closeDeleteConfirmation}
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    className="danger-button report-delete-button"
                    disabled={Boolean(deletingAnalysisId)}
                    aria-label={`삭제 확정 ${confirmingAnalysis.ticker}`}
                    onClick={() => void handleDeleteAnalysis(confirmingAnalysis)}
                  >
                    {deletingAnalysisId === confirmingAnalysis.id ? (
                      <span className="button-loading-label">
                        <span className="loading-spinner loading-spinner-button" aria-hidden="true" />
                        삭제 중
                      </span>
                    ) : (
                      '삭제'
                    )}
                  </button>
                </div>
              </section>
            </div>
          ) : null}
          {status !== 'loading' && items.length === 0 ? (
            <div className="empty-list-state">
              <p>{isFiltered ? '조건에 맞는 보유 분석이 없습니다.' : '아직 만든 보유 분석이 없습니다.'}</p>
              {isFiltered ? (
                <button type="button" className="secondary-button" onClick={resetFilters}>
                  필터 초기화
                </button>
              ) : (
                <Link className="primary-link-button" to="/portfolio-analyses/new">
                  보유 분석 만들기
                </Link>
              )}
            </div>
          ) : null}
        </div>

        {portfolioList.total > 0 ? (
          <div className="pagination-footer">
            <div className="pagination-summary">
              <span>
                {rangeStart}-{rangeEnd} / 총 {portfolioList.total}개
              </span>
              <label>
                <span>페이지 크기</span>
                <select
                  value={pagination.pageSize}
                  disabled={status === 'loading'}
                  onChange={(event) => changePageSize(Number(event.target.value) as ReportPageSize)}
                >
                  {pageSizeOptions.map((option) => (
                    <option value={option} key={option}>
                      {option}개
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="pagination-controls" aria-label="보유 분석 목록 페이지 이동">
              <button
                type="button"
                className="secondary-button"
                disabled={status === 'loading' || portfolioList.page <= 1}
                onClick={() => changePage(portfolioList.page - 1)}
              >
                이전
              </button>
              <div className="pagination-pages">
                {getPageItems(portfolioList.page, totalPages).map((item, index) =>
                  item === 'ellipsis' ? (
                    <span className="pagination-ellipsis" key={`ellipsis-${index}`}>
                      ...
                    </span>
                  ) : (
                    <button
                      type="button"
                      className={item === portfolioList.page ? 'pagination-page is-active' : 'pagination-page'}
                      disabled={status === 'loading'}
                      onClick={() => changePage(item)}
                      key={item}
                    >
                      {item}
                    </button>
                  ),
                )}
              </div>
              <span className="pagination-mobile-page">
                {portfolioList.page} / {Math.max(totalPages, 1)}
              </span>
              <button
                type="button"
                className="secondary-button"
                disabled={status === 'loading' || !hasPagination || portfolioList.page >= totalPages}
                onClick={() => changePage(portfolioList.page + 1)}
              >
                다음
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
