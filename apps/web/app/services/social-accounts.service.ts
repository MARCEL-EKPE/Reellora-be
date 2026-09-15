import type { YouTubeLinkResponse } from '@reellora/shared';

export function useSocialAccountsService() {
  const { $api } = useNuxtApp();

  return {
    getYouTubeLink() {
      return $api<YouTubeLinkResponse>('/social-accounts/youtube/link');
    },
    exchangeYouTubeCode(code: string) {
      return $api('/social-accounts/youtube/exchange-code', {
        query: { code },
      });
    },
  };
}
