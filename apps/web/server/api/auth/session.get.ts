export default defineEventHandler((event) => ({
  user: getSessionUser(event),
}));
