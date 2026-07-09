import { type FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteReport, fetchReports } from '../api/reportApi';
import type {
  ReportAiStatus,
  ReportInstrument,
  ReportListQuery,
  ReportListResponse,
  ReportPageSize,
  ReportResponse,
  ReportSource,
  ReportStatus,
} from '../types/report';

type ReportsPageProps = {
  accessToken: string;
};

const pageSizeOptions: ReportPageSize[] = [5, 10, 30, 50];

const emptyReportList: ReportListResponse = {
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

function formatSource(source: ReportSource) {
  return source === 'manual' ? '직접 생성' : '예약 생성';
}

function formatStatus(status: ReportStatus) {
  return status === 'completed' ? '완료' : '실패';
}

function formatAiStatus(status: ReportAiStatus | undefined, includeAi: boolean) {
  if (status === 'available') return 'AI 분석 완료';
  if (status === 'unavailable') return 'AI 분석 실패';
  if (status === 'not_requested') return 'AI 미요청';
  return includeAi ? 'AI 요청' : 'AI 미요청';
}

function formatInstrumentTitle(report: ReportResponse) {
  return report.instrument?.name ? `${report.instrument.name} (${report.ticker})` : report.ticker;
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

function getActiveFilterChips(filters: ReportListQuery) {
  const chips: string[] = [];

  if (filters.ticker) chips.push(filters.ticker);
  if (filters.status) chips.push(formatStatus(filters.status));
  if (filters.source) chips.push(formatSource(filters.source));
  if (filters.includeAi !== undefined) chips.push(`AI ${filters.includeAi ? '포함' : '제외'}`);
  if (filters.from || filters.to) chips.push(`${filters.from ?? '시작일'} - ${filters.to ?? '종료일'}`);

  return chips;
}

export function ReportsPage({ accessToken }: ReportsPageProps) {
  const [reportList, setReportList] = useState<ReportListResponse>(emptyReportList);
  const [filters, setFilters] = useState<ReportListQuery>({});
  const [appliedFilters, setAppliedFilters] = useState<ReportListQuery>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [pagination, setPagination] = useState<{ page: number; pageSize: ReportPageSize }>({
    page: 1,
    pageSize: 10,
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [deletingReportId, setDeletingReportId] = useState<string>();
  const [message, setMessage] = useState<string>();
  const reports = reportList.items;
  const totalPages = reportList.totalPages;
  const hasPagination = reportList.total > reportList.pageSize;
  const rangeStart = reportList.total === 0 ? 0 : (reportList.page - 1) * reportList.pageSize + 1;
  const rangeEnd = Math.min(reportList.page * reportList.pageSize, reportList.total);
  const isFiltered = Object.keys(appliedFilters).length > 0;
  const activeFilterChips = getActiveFilterChips(appliedFilters);

  useEffect(() => {
    if (!accessToken) return;

    async function loadReports() {
      setStatus('loading');
      setMessage(undefined);
      try {
        const nextReportList = await fetchReports(accessToken, undefined, {
          ...appliedFilters,
          page: pagination.page,
          pageSize: pagination.pageSize,
        });
        setReportList(nextReportList);
        if (nextReportList.totalPages > 0 && pagination.page > nextReportList.totalPages) {
          setPagination((current) => ({ ...current, page: nextReportList.totalPages }));
        }
        setStatus('idle');
      } catch (error) {
        setMessage(error instanceof Error ? error.message : '리포트 목록을 불러오지 못했습니다.');
        setStatus('error');
      }
    }

    void loadReports();
  }, [accessToken, appliedFilters, pagination]);

  function cleanFilters(nextFilters: ReportListQuery) {
    return Object.fromEntries(
      Object.entries(nextFilters).filter(([, value]) => value !== '' && value !== undefined),
    ) as ReportListQuery;
  }

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedFilters(cleanFilters(filters));
    setIsFilterOpen(false);
    setPagination((current) => ({ ...current, page: 1 }));
  }

  function resetFilters() {
    setFilters({});
    setAppliedFilters({});
    setIsFilterOpen(false);
    setPagination((current) => ({ ...current, page: 1 }));
  }

  function toggleFilters() {
    setFilters(appliedFilters);
    setIsFilterOpen((current) => !current);
  }

  function changePage(page: number) {
    if (status === 'loading') return;
    setPagination((current) => ({ ...current, page }));
  }

  function changePageSize(pageSize: ReportPageSize) {
    setPagination({ page: 1, pageSize });
  }

  async function handleDeleteReport(report: ReportResponse) {
    setDeletingReportId(report.id);
    setMessage(undefined);

    try {
      await deleteReport(report.id, accessToken);
      const nextPage = reports.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page;
      const nextReportList = await fetchReports(accessToken, undefined, {
        ...appliedFilters,
        page: nextPage,
        pageSize: pagination.pageSize,
      });
      setReportList(nextReportList);
      if (nextPage !== pagination.page) {
        setPagination((current) => ({ ...current, page: nextPage }));
      } else if (nextReportList.totalPages > 0 && nextPage > nextReportList.totalPages) {
        setPagination((current) => ({ ...current, page: nextReportList.totalPages }));
      }
      setStatus('idle');
      setMessage('리포트를 삭제했습니다.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '리포트 삭제에 실패했습니다.');
      setStatus('error');
    } finally {
      setDeletingReportId(undefined);
    }
  }

  if (!accessToken) {
    return <section className="state-panel">리포트 목록은 로그인이 필요합니다.</section>;
  }

  return (
    <section className="content-section reports-page">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">REPORT HISTORY</p>
          <h1>리포트 목록</h1>
          <p>내가 생성했거나 예약으로 만들어진 교육용 분석 리포트입니다.</p>
        </div>
        <Link className="primary-link-button" to="/reports/new">
          리포트 생성
        </Link>
      </div>

      <div className="surface-panel">
        <form className="report-filter-form" onSubmit={handleFilterSubmit}>
          <div className="filter-heading">
            <div>
              <span className="card-label">FILTERS</span>
              <h2>목록 필터</h2>
            </div>
            <div className="active-filter-strip" aria-label="적용된 필터">
              {activeFilterChips.length ? (
                activeFilterChips.map((chip) => (
                  <span className="pill pill-accent" key={chip}>
                    {chip}
                  </span>
                ))
              ) : (
                <span className="pill">전체 리포트</span>
              )}
            </div>
            <div className="filter-heading-actions">
              <span className="pill">총 {reportList.total}개</span>
              {isFiltered ? (
                <button type="button" className="secondary-button" onClick={resetFilters}>
                  필터 초기화
                </button>
              ) : null}
              <button
                type="button"
                className="secondary-button"
                aria-expanded={isFilterOpen}
                aria-controls="report-filter-fields"
                onClick={toggleFilters}
              >
                {isFilterOpen ? '필터 닫기' : '필터 열기'}
              </button>
            </div>
          </div>
          {isFilterOpen ? (
            <div className="filter-panel-body" id="report-filter-fields">
              <div className="filter-grid">
                <label>
                  <span>종목</span>
                  <input
                    value={filters.ticker ?? ''}
                    placeholder="예: AAPL"
                    onChange={(event) => setFilters({ ...filters, ticker: event.target.value })}
                  />
                </label>
                <label>
                  <span>상태</span>
                  <select
                    value={filters.status ?? ''}
                    onChange={(event) =>
                      setFilters({ ...filters, status: (event.target.value || undefined) as ReportStatus | undefined })
                    }
                  >
                    <option value="">전체</option>
                    <option value="completed">완료</option>
                    <option value="failed">실패</option>
                  </select>
                </label>
                <label>
                  <span>생성 방식</span>
                  <select
                    value={filters.source ?? ''}
                    onChange={(event) =>
                      setFilters({ ...filters, source: (event.target.value || undefined) as ReportSource | undefined })
                    }
                  >
                    <option value="">전체</option>
                    <option value="manual">직접 생성</option>
                    <option value="scheduled">예약 생성</option>
                  </select>
                </label>
                <label>
                  <span>AI 포함</span>
                  <select
                    value={filters.includeAi === undefined ? '' : String(filters.includeAi)}
                    onChange={(event) =>
                      setFilters({
                        ...filters,
                        includeAi: event.target.value === '' ? undefined : event.target.value === 'true',
                      })
                    }
                  >
                    <option value="">전체</option>
                    <option value="true">포함</option>
                    <option value="false">제외</option>
                  </select>
                </label>
                <label>
                  <span>시작일</span>
                  <input
                    type="date"
                    value={filters.from ?? ''}
                    onChange={(event) => setFilters({ ...filters, from: event.target.value })}
                  />
                </label>
                <label>
                  <span>종료일</span>
                  <input
                    type="date"
                    value={filters.to ?? ''}
                    onChange={(event) => setFilters({ ...filters, to: event.target.value })}
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

        {status === 'loading' ? <p>리포트 목록을 불러오는 중입니다.</p> : null}
        {message ? <p className="form-error">{message}</p> : null}

        <div className="table-list report-list">
          {reports.map((report) => (
            <article className="list-row report-row" key={report.id}>
              <Link className="report-row-link-body" to={`/reports/${report.id}`}>
                <div className="report-row-main">
                  <strong>{formatInstrumentTitle(report)}</strong>
                  {formatInstrumentMeta(report.instrument) ? (
                    <span className="instrument-meta">{formatInstrumentMeta(report.instrument)}</span>
                  ) : null}
                  <p className="report-period">
                    {report.from} - {report.to}
                  </p>
                </div>
                <div className="report-row-meta">
                  <span className={`pill status-${report.status === 'completed' ? 'positive' : 'negative'}`}>
                    {report.status === 'completed' ? '완료' : '실패'}
                  </span>
                  <span className="pill">{formatSource(report.source)}</span>
                  <span className="pill">{formatAiStatus(report.aiStatus, report.includeAi)}</span>
                </div>
                <span className="date-cell">{formatDateTime(report.generatedAt)}</span>
              </Link>
              <button
                type="button"
                className="danger-button report-delete-button"
                disabled={deletingReportId === report.id}
                aria-label={`리포트 삭제 ${report.ticker}`}
                onClick={() => void handleDeleteReport(report)}
              >
                {deletingReportId === report.id ? '삭제 중...' : '삭제'}
              </button>
            </article>
          ))}
          {status !== 'loading' && reports.length === 0 ? (
            <div className="empty-list-state">
              <p>{isFiltered ? '조건에 맞는 리포트가 없습니다.' : '아직 생성된 리포트가 없습니다.'}</p>
              {isFiltered ? (
                <button type="button" className="secondary-button" onClick={resetFilters}>
                  필터 초기화
                </button>
              ) : (
                <Link className="primary-link-button" to="/reports/new">
                  리포트 생성
                </Link>
              )}
            </div>
          ) : null}
        </div>

        {reportList.total > 0 ? (
          <div className="pagination-footer">
            <div className="pagination-summary">
              <span>
                {rangeStart}-{rangeEnd} / 총 {reportList.total}개
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
            <div className="pagination-controls" aria-label="리포트 목록 페이지 이동">
              <button
                type="button"
                className="secondary-button"
                disabled={status === 'loading' || reportList.page <= 1}
                onClick={() => changePage(reportList.page - 1)}
              >
                이전
              </button>
              <div className="pagination-pages">
                {getPageItems(reportList.page, totalPages).map((item, index) =>
                  item === 'ellipsis' ? (
                    <span className="pagination-ellipsis" key={`ellipsis-${index}`}>
                      ...
                    </span>
                  ) : (
                    <button
                      type="button"
                      className={item === reportList.page ? 'pagination-page is-active' : 'pagination-page'}
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
                {reportList.page} / {Math.max(totalPages, 1)}
              </span>
              <button
                type="button"
                className="secondary-button"
                disabled={status === 'loading' || !hasPagination || reportList.page >= totalPages}
                onClick={() => changePage(reportList.page + 1)}
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
