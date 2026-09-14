import type { H3Event } from 'h3';

export async function backendFetch<T>(
  event: H3Event,
  path: string,
  options: Parameters<typeof $fetch>[1] = {},
): Promise<T> {
  const config = useRuntimeConfig(event);
  const auth = event.context.auth();
  const token = await auth.getToken();
  const headers = new Headers(options.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return $fetch<T, string>(path, {
    ...options,
    baseURL: config.apiBase,
    headers,
  });
}
