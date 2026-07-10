import type { AuthResponse, User } from '../types/report';
import { notifyAuthExpiredIfUnauthorized } from './authEvents';

export type AuthRequest = {
  email: string;
  password: string;
};

async function requestAuth(path: '/auth/login' | '/auth/signup', request: AuthRequest, apiBaseUrl: string) {
  const baseUrl = apiBaseUrl.replace(/\/$/, '');
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: request.email.trim(),
      password: request.password,
    }),
  });

  if (!response.ok) {
    notifyAuthExpiredIfUnauthorized(response);
    const message = await response.text();
    throw new Error(`인증 실패: ${message || response.status}`);
  }

  return response.json() as Promise<AuthResponse>;
}

export function login(request: AuthRequest, apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '') {
  return requestAuth('/auth/login', request, apiBaseUrl);
}

export function signup(request: AuthRequest, apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '') {
  return requestAuth('/auth/signup', request, apiBaseUrl);
}

export async function fetchMe(accessToken: string, apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '') {
  const baseUrl = apiBaseUrl.replace(/\/$/, '');
  const response = await fetch(`${baseUrl}/auth/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    notifyAuthExpiredIfUnauthorized(response);
    const message = await response.text();
    throw new Error(`내 정보 조회 실패: ${message || response.status}`);
  }

  return response.json() as Promise<User>;
}
