import type { FeedItem, VideoSummary } from '@reellora/shared';
import type { ApiClient } from '../composables/useApiClient';

export const useDashboardStore = defineStore('dashboard', () => {
  const api = shallowRef<ApiClient>();

  const feed = ref<FeedItem[]>([]);
  const feedLoading = ref(false);
  const feedError = ref('');
  const selectedCategory = ref('');
  const videos = ref<VideoSummary[]>([]);
  const videosLoading = ref(false);
  const videosError = ref('');
  const video = ref<VideoSummary | null>(null);
  const videoLoading = ref(false);
  const videoError = ref('');

  function setApi(client: ApiClient) {
    api.value = client;
  }

  async function loadFeed() {
    if (!api.value) return;
    feedLoading.value = true;
    feedError.value = '';
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (selectedCategory.value) params.set('category', selectedCategory.value);
      const { data } = await api.value<{ data: FeedItem[] }>(`/dashboard/feed?${params.toString()}`);
      feed.value = data;
    } catch (err) {
      feedError.value = err instanceof Error ? err.message : 'Failed to load feed';
    } finally {
      feedLoading.value = false;
    }
  }

  async function loadVideos() {
    if (!api.value) return;
    videosLoading.value = true;
    videosError.value = '';
    try {
      const { data } = await api.value<{ data: VideoSummary[] }>('/videos?limit=20');
      videos.value = data;
    } catch (err) {
      videosError.value = err instanceof Error ? err.message : 'Failed to load videos';
    } finally {
      videosLoading.value = false;
    }
  }

  async function loadVideo(videoId: string) {
    if (!api.value) return;
    videoLoading.value = true;
    videoError.value = '';
    try {
      const { data } = await api.value<{ data: VideoSummary }>(`/videos/${videoId}/status`);
      video.value = data;
    } catch (err) {
      videoError.value = err instanceof Error ? err.message : 'Failed to load video';
    } finally {
      videoLoading.value = false;
    }
  }

  async function generateVideo(newsItemId: string) {
    if (!api.value) throw new Error('API client not initialized');
    return api.value<{ data: { videoId: string; status: string } }>('/videos/generate', {
      method: 'POST',
      query: { newsItemId },
    });
  }

  watch(selectedCategory, () => {
    loadFeed();
  });

  return {
    api,
    setApi,
    feed,
    feedLoading,
    feedError,
    selectedCategory,
    videos,
    videosLoading,
    videosError,
    video,
    videoLoading,
    videoError,
    loadFeed,
    loadVideos,
    loadVideo,
    generateVideo,
  };
});
