import { type FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPortfolioEducationAnalyses } from '../api/portfolioApi';
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
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string }>();
  const items = portfolioList.items;
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
              <span className="filter-count-badge">총 {portfolioList.total}개</span>
              {isFiltered ? (
                <button type="button" className="secondary-button filter-reset-button" onClick={resetFilters}>
                  필터 초기화
                </button>
              ) : null}
              <button
                type="button"
                className={isFiltered ? 'filter-toggle-button filter-toggle-button-active' : 'filter-toggle-button'}
                aria-expanded={isFilterOpen}
                aria-controls="portfolio-filter-fields"
                onClick={() => {
                  setFilters(appliedFilters);
                  setIsFilterOpen((current) => !current);
                }}
              >
                <svg className="filter-button-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 6h16" />
                  <path d="M7 12h10" />
                  <path d="M10 18h4" />
                </svg>
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
            return (
              <article className="list-row portfolio-row" key={item.id}>
                <Link className="report-row-link-body" to={`/portfolio-analyses/${item.id}`}>
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
              </article>
            );
          })}
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
