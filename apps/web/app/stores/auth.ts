import { useAuthService, type SessionUser, type SocialProvider } from '~/services/auth.service';

interface ApiError {
  data?: {
    message?: string;
  };
}

function errorMessage(error: unknown, fallback: string) {
  return (error as ApiError | null)?.data?.message ?? fallback;
}

export const useAuthStore = defineStore('auth', () => {
  const authService = useAuthService();
  const user = ref<SessionUser | null>(null);
  const error = ref<string | null>(null);
  const pending = ref(false);

  const isLoggedIn = computed(() => user.value !== null);

  async function restoreSession() {
    user.value = (await authService.session()).user;
  }

  async function authenticate(request: () => Promise<{ user: SessionUser | null }>, fallback: string) {
    pending.value = true;
    error.value = null;

    try {
      user.value = (await request()).user;
      return true;
    } catch (cause) {
      error.value = errorMessage(cause, fallback);
      return false;
    } finally {
      pending.value = false;
    }
  }

  function signIn(email: string, password: string) {
    return authenticate(
      () => authService.signIn(email, password),
      'Sign-in failed. Please check your credentials.',
    );
  }

  function signInWithToken(provider: SocialProvider, token: string) {
    return authenticate(
      () => authService.socialSignIn(provider, token),
      'Social login failed.',
    );
  }

  async function signOut() {
    await authService.signOut();
    user.value = null;
    error.value = null;
  }

  return {
    user,
    error,
    pending,
    isLoggedIn,
    restoreSession,
    signIn,
    signInWithToken,
    signOut,
  };
});
