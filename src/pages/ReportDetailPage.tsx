import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { fetchReportById } from '../api/reportApi';
import { AiAnalysisPanel } from '../components/AiAnalysisPanel';
import { ReportCharts } from '../components/ReportCharts';
import { ReportSummary } from '../components/ReportSummary';
import type { ReportResponse } from '../types/report';

type ReportDetailPageProps = {
  accessToken: string;
};

type LocationState = {
  report?: ReportResponse;
};

export function ReportDetailPage({ accessToken }: ReportDetailPageProps) {
  const { id } = useParams();
  const location = useLocation();
  const seededReport = (location.state as LocationState | null)?.report;
  const [report, setReport] = useState<ReportResponse | null>(seededReport ?? null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>(seededReport ? 'idle' : 'loading');
  const [message, setMessage] = useState<string>();

  useEffect(() => {
    if (!accessToken || !id) return;
    if (seededReport?.id === id) return;
    const reportId = id;

    async function loadReport() {
      setStatus('loading');
      setMessage(undefined);
      try {
        setReport(await fetchReportById(reportId, accessToken));
        setStatus('idle');
      } catch (error) {
        setMessage(error instanceof Error ? error.message : '리포트 상세를 불러오지 못했습니다.');
        setStatus('error');
      }
    }

    void loadReport();
  }, [accessToken, id, seededReport]);

  if (!accessToken) {
    return <section className="state-panel">리포트 상세는 로그인이 필요합니다.</section>;
  }

  if (status === 'loading') {
    return <section className="state-panel">리포트 상세를 불러오는 중입니다.</section>;
  }

  if (status === 'error' || !report) {
    return <section className="state-panel state-panel-error">{message ?? '리포트 상세를 표시할 수 없습니다.'}</section>;
  }

  if (report.status !== 'completed' || !report.payload) {
    return (
      <section className="state-panel state-panel-error">
        <h2>{report.ticker} 리포트 생성 실패</h2>
        <p>{report.errorMessage ?? '차트로 표시할 수 있는 payload가 없습니다.'}</p>
        <Link className="text-link" to="/reports">
          리포트 목록으로 돌아가기
        </Link>
      </section>
    );
  }

  return (
    <>
      <ReportSummary report={report} payload={report.payload} />
      <AiAnalysisPanel aiAnalysis={report.payload.aiAnalysis} />
      <ReportCharts payload={report.payload} />
      <section className="content-section">
        <p className="disclaimer">이 화면은 교육용 분석이며 투자 조언이 아닙니다.</p>
      </section>
    </>
  );
}
