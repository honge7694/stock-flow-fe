import type { ReportListQuery, ReportListResponse, ReportRequest, ReportResponse } from '../types/report';
import { notifyAuthExpiredIfUnauthorized } from './authEvents';

function apiUrl(path: string, apiBaseUrl: string) {
  return `${apiBaseUrl.replace(/\/$/, '')}${path}`;
}

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

function reportsPath(query?: ReportListQuery) {
  const params = new URLSearchParams();

  if (query?.page) params.set('page', String(query.page));
  if (query?.pageSize) params.set('pageSize', String(query.pageSize));
  if (query?.ticker?.trim()) params.set('ticker', query.ticker.trim().toUpperCase());
  if (query?.status) params.set('status', query.status);
  if (query?.source) params.set('source', query.source);
  if (query?.includeAi !== undefined) params.set('includeAi', String(query.includeAi));
  if (query?.from) params.set('from', query.from);
  if (query?.to) params.set('to', query.to);

  const queryString = params.toString();
  return queryString ? `/reports?${queryString}` : '/reports';
}

async function readJson<T>(response: Response, message: string): Promise<T> {
  if (!response.ok) {
    notifyAuthExpiredIfUnauthorized(response);
    const body = await response.text();
    throw new Error(`${message}: ${body || response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchReport(
  request: ReportRequest,
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '',
  accessToken?: string,
): Promise<ReportResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(apiUrl('/reports/generate', apiBaseUrl), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      ticker: request.ticker.trim(),
      from: request.from,
      to: request.to,
      ai: request.ai,
    }),
  });

  if (!response.ok) {
    notifyAuthExpiredIfUnauthorized(response);
    const message = await response.text();
    throw new Error(`리포트 생성 실패: ${message || response.status}`);
  }

  return response.json() as Promise<ReportResponse>;
}

export async function fetchReports(
  accessToken: string,
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '',
  query?: ReportListQuery,
) {
  const response = await fetch(apiUrl(reportsPath(query), apiBaseUrl), {
    headers: authHeaders(accessToken),
  });

  return readJson<ReportListResponse>(response, '리포트 목록 조회 실패');
}

export async function fetchReportById(
  id: string,
  accessToken: string,
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '',
) {
  const response = await fetch(apiUrl(`/reports/${id}`, apiBaseUrl), {
    headers: authHeaders(accessToken),
  });

  return readJson<ReportResponse>(response, '리포트 상세 조회 실패');
}

export async function deleteReport(id: string, accessToken: string, apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '') {
  const response = await fetch(apiUrl(`/reports/${id}`, apiBaseUrl), {
    method: 'DELETE',
    headers: authHeaders(accessToken),
  });

  if (!response.ok) {
    notifyAuthExpiredIfUnauthorized(response);
    const body = await response.text();
    throw new Error(`리포트 삭제 실패: ${body || response.status}`);
  }
}
