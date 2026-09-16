import type { FeedItem, VideoSummary } from '@reellora/shared';

export const useDashboardStore = defineStore('dashboard', () => {
  const api = useApiClient();
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

  async function loadFeed() {
    if (feedLoading.value) return;
    feedLoading.value = true;
    feedError.value = '';
    try {
      const { data } = await api<{ data: FeedItem[] }>('/dashboard/feed', {
        query: {
          limit: 50,
          ...(selectedCategory.value && selectedCategory.value !== 'all' && { category: selectedCategory.value }),
        },
      });
      feed.value = data;
    } catch (err) {
      console.error('Failed to load feed:', err);
      feedError.value = err instanceof Error ? err.message : 'Failed to load feed';
    } finally {
      feedLoading.value = false;
    }
  }

  async function loadVideos() {
    if (videosLoading.value) return;
    videosLoading.value = true;
    videosError.value = '';
    try {
      const { data } = await api<{ data: VideoSummary[] }>('/videos', {
        query: { limit: 20 },
      });
      videos.value = data;
    } catch (err) {
      console.error('Failed to load videos:', err);
      videosError.value = err instanceof Error ? err.message : 'Failed to load videos';
    } finally {
      videosLoading.value = false;
    }
  }

  async function loadVideo(videoId: string) {
    if (videoLoading.value) return;
    videoLoading.value = true;
    videoError.value = '';
    try {
      const { data } = await api<{ data: VideoSummary }>(`/videos/${videoId}/status`);
      video.value = data;
    } catch (err) {
      console.error('Failed to load video:', err);
      videoError.value = err instanceof Error ? err.message : 'Failed to load video';
    } finally {
      videoLoading.value = false;
    }
  }

  async function generateVideo(newsItemId: string) {
    return api<{ data: { videoId: string; status: string } }>('/videos/generate', {
      method: 'POST',
      query: { newsItemId },
    });
  }

  watch(selectedCategory, () => {
    loadFeed();
  });

  return {
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
