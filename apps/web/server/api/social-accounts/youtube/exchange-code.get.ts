export default defineEventHandler((event) =>
  backendFetch(event, '/social-accounts/youtube/exchange-code', {
    query: { code: getQuery(event).code },
  }),
);
