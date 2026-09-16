export default defineNuxtRouteMiddleware(async () => {
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
