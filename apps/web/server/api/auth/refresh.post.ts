export default defineEventHandler(async (event) => {
  const refreshed = await refreshSession(event);

  if (!refreshed) {
    throw createError({ statusCode: 401, statusMessage: 'Session expired' });
  }

  return { user: getSessionUser(event) };
});
