export type SocialProvider = 'google' | 'facebook';

export interface SessionUser {
  id: string;
  email: string;
  role: string;
}

interface SessionResponse {
  user: SessionUser | null;
}

export function useAuthService() {
  const { $api } = useNuxtApp();

  return {
    signIn(email: string, password: string) {
      return $api<SessionResponse>('/auth/sign-in', {
        method: 'POST',
        body: { email, password },
      });
    },
    socialSignIn(provider: SocialProvider, token: string) {
      return $api<SessionResponse>(`/auth/social/${provider}`, {
        method: 'POST',
        body: { token },
      });
    },
    session() {
      return $api<SessionResponse>('/auth/session');
    },
    signOut() {
      return $api('/auth/sign-out', { method: 'POST' });
    },
  };
}
