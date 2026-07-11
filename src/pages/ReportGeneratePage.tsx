import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchReport } from '../api/reportApi';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { ReportQueryForm } from '../components/ReportQueryForm';
import { ReportState } from '../components/ReportState';
import type { ReportRequest } from '../types/report';

type ReportGeneratePageProps = {
  accessToken: string;
};

export function ReportGeneratePage({ accessToken }: ReportGeneratePageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTicker = searchParams.get('ticker') ?? undefined;
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>();

  async function handleSubmit(request: ReportRequest) {
    if (!accessToken) {
      setErrorMessage('리포트 생성에는 로그인이 필요합니다.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage(undefined);

    try {
      const report = await fetchReport(request, undefined, accessToken);
      if (report.status === 'failed') {
        setErrorMessage(report.errorMessage ?? '리포트 생성에 실패했습니다.');
        setStatus('error');
        return;
      }
      navigate(`/reports/${report.id}`, { state: { report } });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '리포트 생성 중 알 수 없는 오류가 발생했습니다.');
      setStatus('error');
    }
  }

  return (
    <section className="report-create-page">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">MANUAL REPORT</p>
          <h1>리포트 생성</h1>
          <p>종목과 기간을 선택해 과거 데이터 기반 교육용 분석 리포트를 만듭니다.</p>
        </div>
      </div>

      <div className="report-workflow-grid">
        <div className="workflow-card">
          <div className="card-heading">
            <span className="card-label">REPORT PARAMETERS</span>
            <h2>생성 조건</h2>
          </div>
          <ReportQueryForm isLoading={status === 'loading'} initialTicker={initialTicker} onSubmit={handleSubmit} />
          {status === 'error' ? <ReportState status={status} errorMessage={errorMessage} /> : null}
        </div>

        <aside className="workflow-card context-card">
          <div className="card-heading">
            <span className="card-label">OUTPUT</span>
            <h2>리포트에 포함되는 항목</h2>
          </div>
          <ul className="check-list">
            <li>가격 캔들 및 거래량</li>
            <li>SMA20, SMA50 이동평균선</li>
            <li>RSI14, MACD 보조 지표</li>
            <li>선택 시 AI 학습 요약</li>
          </ul>
          <p className="muted-note">과거 데이터와 기술 지표를 학습 목적으로 정리합니다. 투자 판단을 대신하지 않습니다.</p>
        </aside>
      </div>
      {status === 'loading' ? (
        <LoadingOverlay
          title="리포트를 생성하는 중입니다"
          description="선택한 종목과 기간의 과거 가격 데이터와 기술 지표를 분석하고 있습니다."
          subcopy="잠시만 기다려 주세요. 완료되면 자동으로 이동합니다."
        />
      ) : null}
    </section>
  );
}
