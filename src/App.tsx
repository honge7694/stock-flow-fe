import { useState } from 'react';
import { fetchReport } from './api/reportApi';
import { AiAnalysisPanel } from './components/AiAnalysisPanel';
import { ReportCharts } from './components/ReportCharts';
import { ReportQueryForm } from './components/ReportQueryForm';
import { ReportState } from './components/ReportState';
import { ReportSummary } from './components/ReportSummary';
import type { ReportRequest, ReportResponse } from './types/report';

type LoadState = 'idle' | 'loading' | 'success' | 'error';

export default function App() {
  const [status, setStatus] = useState<LoadState>('idle');
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>();

  async function handleSubmit(request: ReportRequest) {
    setStatus('loading');
    setErrorMessage(undefined);

    try {
      const nextReport = await fetchReport(request);
      setReport(nextReport);
      setStatus('success');
    } catch (error) {
      setReport(null);
      setErrorMessage(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
      setStatus('error');
    }
  }

  return (
    <main className="page">
      <section className="app-header">
        <div>
          <p className="eyebrow">STOCK FLOW</p>
          <h1>리포트 조회</h1>
          <p>종목 코드와 기간을 지정해 백엔드 분석 리포트를 확인합니다.</p>
        </div>
        <ReportQueryForm isLoading={status === 'loading'} onSubmit={handleSubmit} />
      </section>

      {report && status === 'success' ? (
        <>
          <ReportSummary report={report} />
          <ReportCharts report={report} />
          <AiAnalysisPanel aiAnalysis={report.aiAnalysis} />
        </>
      ) : (
        <ReportState status={status === 'success' ? 'idle' : status} errorMessage={errorMessage} />
      )}
    </main>
  );
}
