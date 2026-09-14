export default defineEventHandler((event) =>
  backendFetch(event, '/social-accounts/youtube/link'),
);
