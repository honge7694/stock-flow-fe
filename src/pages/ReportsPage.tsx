import { type FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchReports } from '../api/reportApi';
import type { ReportInstrument, ReportListQuery, ReportResponse, ReportSource, ReportStatus } from '../types/report';

type ReportsPageProps = {
  accessToken: string;
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

function formatInstrumentTitle(report: ReportResponse) {
  return report.instrument?.name ? `${report.instrument.name} (${report.ticker})` : report.ticker;
}

function formatInstrumentMeta(instrument?: ReportInstrument) {
  if (!instrument || instrument.metadataStatus === 'unknown') return null;
  const parts = [instrument.exchange, instrument.currency, instrument.country].filter(Boolean);
  return parts.length ? parts.join(' · ') : null;
}

export function ReportsPage({ accessToken }: ReportsPageProps) {
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [filters, setFilters] = useState<ReportListQuery>({});
  const [appliedFilters, setAppliedFilters] = useState<ReportListQuery>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [message, setMessage] = useState<string>();

  useEffect(() => {
    if (!accessToken) return;

    async function loadReports() {
      setStatus('loading');
      setMessage(undefined);
      try {
        setReports(await fetchReports(accessToken, undefined, appliedFilters));
        setStatus('idle');
      } catch (error) {
        setMessage(error instanceof Error ? error.message : '리포트 목록을 불러오지 못했습니다.');
        setStatus('error');
      }
    }

    void loadReports();
  }, [accessToken, appliedFilters]);

  function cleanFilters(nextFilters: ReportListQuery) {
    return Object.fromEntries(
      Object.entries(nextFilters).filter(([, value]) => value !== '' && value !== undefined),
    ) as ReportListQuery;
  }

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedFilters(cleanFilters(filters));
  }

  function resetFilters() {
    setFilters({});
    setAppliedFilters({});
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
            <span className="pill">{reports.length}개</span>
          </div>
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
              초기화
            </button>
          </div>
        </form>

        {status === 'loading' ? <p>리포트 목록을 불러오는 중입니다.</p> : null}
        {message ? <p className="form-error">{message}</p> : null}

        <div className="table-list report-list">
          {reports.map((report) => (
            <Link className="list-row report-row list-row-link" to={`/reports/${report.id}`} key={report.id}>
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
                <span className="pill">AI {report.includeAi ? '포함' : '제외'}</span>
              </div>
              <span className="date-cell">{formatDateTime(report.generatedAt)}</span>
            </Link>
          ))}
          {status !== 'loading' && reports.length === 0 ? <p>아직 생성된 리포트가 없습니다.</p> : null}
        </div>
      </div>
    </section>
  );
}
