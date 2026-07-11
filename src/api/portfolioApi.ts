import type {
  PortfolioEducationAnalysisListResponse,
  PortfolioEducationAnalysisResponse,
  PortfolioEducationListQuery,
  PortfolioEducationRequest,
} from '../types/report';
import { notifyAuthExpiredIfUnauthorized } from './authEvents';

function apiUrl(path: string, apiBaseUrl: string) {
  return `${apiBaseUrl.replace(/\/$/, '')}${path}`;
}

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

function educationAnalysisPath(query?: PortfolioEducationListQuery) {
  const params = new URLSearchParams();

  if (query?.page) params.set('page', String(query.page));
  if (query?.pageSize) params.set('pageSize', String(query.pageSize));
  if (query?.ticker?.trim()) params.set('ticker', query.ticker.trim().toUpperCase());

  const queryString = params.toString();
  return queryString ? `/portfolio/education-analysis?${queryString}` : '/portfolio/education-analysis';
}

function normalizeRequest(request: PortfolioEducationRequest) {
  const nextRequest: PortfolioEducationRequest = {
    savedStockId: request.savedStockId,
    ticker: request.ticker?.trim() ? request.ticker.trim().toUpperCase() : undefined,
    quantity: request.quantity,
    averagePrice: request.averagePrice,
    currency: request.currency?.trim() ? request.currency.trim().toUpperCase() : undefined,
    from: request.from || undefined,
    to: request.to || undefined,
  };

  if (nextRequest.quantity === '') delete nextRequest.quantity;
  if (nextRequest.averagePrice === '') delete nextRequest.averagePrice;

  return nextRequest;
}

async function readJson<T>(response: Response, message: string): Promise<T> {
  if (!response.ok) {
    notifyAuthExpiredIfUnauthorized(response);
    const body = await response.text();
    throw new Error(`${message}: ${body || response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function createPortfolioEducationAnalysis(
  request: PortfolioEducationRequest,
  accessToken: string,
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '',
) {
  const response = await fetch(apiUrl('/portfolio/education-analysis', apiBaseUrl), {
    method: 'POST',
    headers: {
      ...authHeaders(accessToken),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(normalizeRequest(request)),
  });

  return readJson<PortfolioEducationAnalysisResponse>(response, '보유 분석 생성 실패');
}

export async function fetchPortfolioEducationAnalyses(
  accessToken: string,
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '',
  query?: PortfolioEducationListQuery,
) {
  const response = await fetch(apiUrl(educationAnalysisPath(query), apiBaseUrl), {
    headers: authHeaders(accessToken),
  });

  return readJson<PortfolioEducationAnalysisListResponse>(response, '보유 분석 목록 조회 실패');
}

export async function fetchPortfolioEducationAnalysisById(
  id: string,
  accessToken: string,
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '',
) {
  const response = await fetch(apiUrl(`/portfolio/education-analysis/${id}`, apiBaseUrl), {
    headers: authHeaders(accessToken),
  });

  return readJson<PortfolioEducationAnalysisResponse>(response, '보유 분석 상세 조회 실패');
}

export async function updatePortfolioEducationAnalysis(
  id: string,
  request: PortfolioEducationRequest,
  accessToken: string,
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '',
) {
  const response = await fetch(apiUrl(`/portfolio/education-analysis/${id}`, apiBaseUrl), {
    method: 'PATCH',
    headers: {
      ...authHeaders(accessToken),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(normalizeRequest(request)),
  });

  return readJson<PortfolioEducationAnalysisResponse>(response, '보유 분석 수정 실패');
}

export async function deletePortfolioEducationAnalysis(
  id: string,
  accessToken: string,
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '',
) {
  const response = await fetch(apiUrl(`/portfolio/education-analysis/${id}`, apiBaseUrl), {
    method: 'DELETE',
    headers: authHeaders(accessToken),
  });

  if (!response.ok) {
    notifyAuthExpiredIfUnauthorized(response);
    const body = await response.text();
    throw new Error(`보유 분석 삭제 실패: ${body || response.status}`);
  }
}
