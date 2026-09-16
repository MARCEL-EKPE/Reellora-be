export function useApiClient() {
  const { getToken } = useAuth();
  const config = useRuntimeConfig();

  return $fetch.create({
    baseURL: config.public.apiBase,
    async onRequest({ options }) {
      const token = await getToken.value();
      if (token) {
        const headers = new Headers(options.headers);
        headers.set('Authorization', `Bearer ${token}`);
        options.headers = headers;
      }
    },
  });
}

export type ApiClient = ReturnType<typeof useApiClient>;
