export default defineEventHandler(async (event) => {
  const body = await readBody<{ email: string; password: string }>(event);
  const response = await backendFetch<AuthResponse>(event, '/auth/sign-in', {
    method: 'POST',
    body,
  });

  setSessionCookies(event, response);
  return { user: getUserFromToken(response.data.accessToken) };
});
