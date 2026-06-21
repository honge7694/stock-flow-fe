import type { ReportRequest, ReportResponse } from '../types/report';

export function toReportQueryString(request: ReportRequest): string {
  const params = new URLSearchParams({
    ticker: request.ticker.trim(),
    from: request.from,
    to: request.to,
    ai: String(request.ai),
  });

  return params.toString();
}

export async function fetchReport(
  request: ReportRequest,
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '',
): Promise<ReportResponse> {
  const baseUrl = apiBaseUrl.replace(/\/$/, '');
  const response = await fetch(`${baseUrl}/api/reports?${toReportQueryString(request)}`);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`리포트 조회 실패: ${message || response.status}`);
  }

  return response.json() as Promise<ReportResponse>;
}
