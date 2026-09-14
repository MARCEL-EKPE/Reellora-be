interface YouTubeLinkResponse {
  data: {
    url: string;
  };
}

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
