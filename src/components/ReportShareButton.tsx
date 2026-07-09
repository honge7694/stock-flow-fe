import { useState } from 'react';
import type { RefObject } from 'react';
import type { ReportPayload, ReportResponse } from '../types/report';
import { shareReport, type ShareReportResult } from '../utils/shareReport';

type ReportShareButtonProps = {
  report: ReportResponse;
  payload: ReportPayload;
  captureTargetRef?: RefObject<HTMLElement | null>;
};

function getSuccessMessage(result: ShareReportResult) {
  return result === 'shared' ? '공유창을 열었습니다.' : '공유 이미지를 다운로드했습니다.';
}

export function ReportShareButton({ report, payload, captureTargetRef }: ReportShareButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  const [message, setMessage] = useState<string>();

  async function handleShare() {
    setStatus('loading');
    setMessage(undefined);

    try {
      const result = await shareReport(report, payload, captureTargetRef?.current);
      setMessage(getSuccessMessage(result));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '공유 이미지를 만들지 못했습니다.');
    } finally {
      setStatus('idle');
    }
  }

  return (
    <section className="content-section report-share-panel" aria-label="리포트 공유">
      <div>
        <p className="eyebrow">SHARE</p>
        <h2>리포트 공유</h2>
        <p>요약 이미지를 만들어 카카오톡이나 다른 앱으로 보낼 수 있습니다.</p>
      </div>
      <div className="report-share-actions">
        <button type="button" className="primary-button" disabled={status === 'loading'} onClick={handleShare}>
          {status === 'loading' ? '이미지 생성 중...' : '공유'}
        </button>
        {message ? (
          <p className="form-message" data-share-exclude="true">
            {message}
          </p>
        ) : null}
      </div>
    </section>
  );
}
