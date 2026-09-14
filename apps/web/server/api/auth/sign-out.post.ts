export default defineEventHandler((event) => {
  clearSessionCookies(event);
  return { success: true };
});
