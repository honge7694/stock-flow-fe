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
    <div className="report-share-actions" aria-label="리포트 공유">
      <button type="button" className="report-share-button" disabled={status === 'loading'} onClick={handleShare}>
        <svg className="report-share-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M8 12h8" />
          <path d="M13 7l5 5-5 5" />
          <path d="M5 5v14" />
        </svg>
        <span>{status === 'loading' ? '공유 준비 중...' : '요약 이미지 공유'}</span>
      </button>
      {message ? (
        <p className="form-message" role="status" data-share-exclude="true">
          {message}
        </p>
      ) : null}
    </div>
  );
}
