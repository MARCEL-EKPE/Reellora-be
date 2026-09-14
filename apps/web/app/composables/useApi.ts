import type { UseFetchOptions } from 'nuxt/app';

export function useApi<T>(url: string | (() => string), options: UseFetchOptions<T> = {}) {
  const api = useNuxtApp().$api as typeof $fetch;

  return useFetch(url, {
    ...options,
    $fetch: api,
  });
}
