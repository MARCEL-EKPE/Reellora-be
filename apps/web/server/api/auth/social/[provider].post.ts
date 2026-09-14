export default defineEventHandler(async (event) => {
  const provider = getRouterParam(event, 'provider');
  if (provider !== 'google' && provider !== 'facebook') {
    throw createError({ statusCode: 404, statusMessage: 'Provider not found' });
  }

  const body = await readBody<{ token: string }>(event);
  const response = await backendFetch<AuthResponse>(event, `/${provider}-authentication`, {
    method: 'POST',
    body,
  });

  setSessionCookies(event, response);
  return { user: getUserFromToken(response.data.accessToken) };
});
