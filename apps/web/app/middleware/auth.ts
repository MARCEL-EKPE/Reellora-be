export default defineNuxtRouteMiddleware(async () => {
  // Clerk server middleware is disabled (skipServerMiddleware), so auth state
  // only exists in the browser. Let SSR render and enforce auth on the client.
  if (import.meta.server) return;

  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded.value) {
    await new Promise<void>((resolve) => {
      const stop = watch(isLoaded, (loaded) => {
        if (loaded) {
          stop();
          resolve();
        }
      });
    });
  }

  if (!isSignedIn.value) {
    return navigateTo('/sign-in');
  }
});
