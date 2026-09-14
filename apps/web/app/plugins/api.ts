export default defineNuxtPlugin(() => {
  const api = $fetch.create({
    baseURL: '/api',
    credentials: 'include',
    headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
  });

  return {
    provide: { api },
  };
});
