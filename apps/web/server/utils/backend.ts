import type { H3Event } from 'h3';

export interface AuthResponse {
  apiVersion: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface SessionUser {
  id: string;
  email: string;
  role: string;
}

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NUXT_COOKIE_SECURE === 'true',
  path: '/',
};

export function backendFetch<T>(event: H3Event, path: string, options: Parameters<typeof $fetch<T>>[1] = {}) {
  const config = useRuntimeConfig(event);
  const accessToken = getCookie(event, 'access-token');
  const headers = new Headers(options.headers);

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return $fetch<T>(path, {
    ...options,
    baseURL: config.apiBase,
    headers,
  });
}

export function setSessionCookies(event: H3Event, response: AuthResponse) {
  setCookie(event, 'access-token', response.data.accessToken, cookieOptions);
  setCookie(event, 'refresh-token', response.data.refreshToken, cookieOptions);
}

export function clearSessionCookies(event: H3Event) {
  deleteCookie(event, 'access-token', cookieOptions);
  deleteCookie(event, 'refresh-token', cookieOptions);
}

export function getUserFromToken(token?: string): SessionUser | null {
  if (!token) return null;

  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    return { id: payload.sub, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}

export function getSessionUser(event: H3Event) {
  return getUserFromToken(getCookie(event, 'access-token'));
}
