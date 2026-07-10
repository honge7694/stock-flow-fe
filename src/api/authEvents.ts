export const AUTH_EXPIRED_EVENT = 'stock-flow-auth-expired';

export function notifyAuthExpiredIfUnauthorized(response: Response) {
  if (response.status === 401) {
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
  }
}
