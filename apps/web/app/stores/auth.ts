interface SignInResponse {
  apiVersion: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const user = ref<{ id: string; email: string; role: string } | null>(null);
  const error = ref<string | null>(null);
  const pending = ref(false);

  const isLoggedIn = computed(() => !!accessToken.value);

  function applySession(response: SignInResponse) {
    accessToken.value = response.data.accessToken;
    refreshToken.value = response.data.refreshToken;

    const payload = JSON.parse(atob(response.data.accessToken.split('.')[1]));
    user.value = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }

  async function signIn(email: string, password: string) {
    const config = useRuntimeConfig();
    pending.value = true;
    error.value = null;

    try {
      const response = await $fetch<SignInResponse>(`${config.public.apiBase}/auth/sign-in`, {
        method: 'POST',
        body: { email, password },
      });

      applySession(response);
      return true;
    } catch (err: any) {
      error.value = err?.data?.message || 'Sign-in failed. Please check your credentials.';
      return false;
    } finally {
      pending.value = false;
    }
  }

  async function signInWithToken(provider: 'google' | 'facebook', token: string) {
    const config = useRuntimeConfig();
    pending.value = true;
    error.value = null;

    try {
      const response = await $fetch<SignInResponse>(`${config.public.apiBase}/${provider}-authentication`, {
        method: 'POST',
        body: { token },
      });

      applySession(response);
      return true;
    } catch (err: any) {
      error.value = err?.data?.message || 'Social login failed.';
      return false;
    } finally {
      pending.value = false;
    }
  }

  function signOut() {
    accessToken.value = null;
    refreshToken.value = null;
    user.value = null;
    error.value = null;
  }

  return {
    accessToken,
    refreshToken,
    user,
    error,
    pending,
    isLoggedIn,
    signIn,
    signInWithToken,
    signOut,
  };
});
