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

export async function backendFetch<T>(
  event: H3Event,
  path: string,
  options: Parameters<typeof $fetch>[1] = {},
): Promise<T> {
  const config = useRuntimeConfig(event);

  const makeRequest = async (accessToken?: string) => {
    const headers = new Headers(options.headers);

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    return $fetch<T, string>(path, {
      ...options,
      baseURL: config.apiBase,
      headers,
    });
  };

  const accessToken = getCookie(event, 'access-token');

  try {
    return await makeRequest(accessToken);
  } catch (error: any) {
    if (error?.statusCode === 401 && accessToken) {
      const refreshed = await refreshSession(event);
      if (refreshed) {
        return await makeRequest(getCookie(event, 'access-token'));
      }
    }

    throw error;
  }
}

export async function refreshSession(event: H3Event): Promise<boolean> {
  const config = useRuntimeConfig(event);
  const refreshToken = getCookie(event, 'refresh-token');

  if (!refreshToken) {
    clearSessionCookies(event);
    return false;
  }

  try {
    const response = await $fetch<AuthResponse>('/auth/refresh-tokens', {
      baseURL: config.apiBase,
      method: 'POST',
      body: { refreshToken },
    });

    setSessionCookies(event, response);
    return true;
  } catch {
    clearSessionCookies(event);
    return false;
  }
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
    const encodedPayload = token.split('.')[1];
    if (!encodedPayload) return null;

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());
    return { id: payload.sub, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}

export function getSessionUser(event: H3Event) {
  return getUserFromToken(getCookie(event, 'access-token'));
}
