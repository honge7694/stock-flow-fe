import type { Stock, StockRequest } from '../types/report';
import { notifyAuthExpiredIfUnauthorized } from './authEvents';

function apiUrl(path: string, apiBaseUrl: string) {
  return `${apiBaseUrl.replace(/\/$/, '')}${path}`;
}

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

async function readJson<T>(response: Response, message: string): Promise<T> {
  if (!response.ok) {
    notifyAuthExpiredIfUnauthorized(response);
    const body = await response.text();
    throw new Error(`${message}: ${body || response.status}`);
  }

  return response.json() as Promise<T>;
}

function serializeStockRequest(request: StockRequest): StockRequest {
  return {
    ...request,
    ticker: request.ticker?.trim(),
  };
}

export async function fetchStocks(accessToken: string, apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '') {
  const response = await fetch(apiUrl('/stocks', apiBaseUrl), {
    headers: authHeaders(accessToken),
  });

  return readJson<Stock[]>(response, '관심 종목 목록 조회 실패');
}

export async function createStock(
  request: StockRequest,
  accessToken: string,
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '',
) {
  const response = await fetch(apiUrl('/stocks', apiBaseUrl), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(accessToken),
    },
    body: JSON.stringify(serializeStockRequest(request)),
  });

  return readJson<Stock>(response, '관심 종목 생성 실패');
}

export async function updateStock(
  id: string,
  request: Partial<StockRequest>,
  accessToken: string,
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '',
) {
  const response = await fetch(apiUrl(`/stocks/${id}`, apiBaseUrl), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(accessToken),
    },
    body: JSON.stringify(request),
  });

  return readJson<Stock>(response, '관심 종목 수정 실패');
}

export async function deleteStock(id: string, accessToken: string, apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '') {
  const response = await fetch(apiUrl(`/stocks/${id}`, apiBaseUrl), {
    method: 'DELETE',
    headers: authHeaders(accessToken),
  });

  if (!response.ok) {
    notifyAuthExpiredIfUnauthorized(response);
    const body = await response.text();
    throw new Error(`관심 종목 삭제 실패: ${body || response.status}`);
  }
}
