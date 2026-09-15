<script setup lang="ts">
import type { FeedItem as NewsItem, VideoSummary as Video } from '@reellora/shared';

definePageMeta({
  middleware: 'auth',
});

const selectedCategory = ref<string>('');
const { data: feed, refresh: refreshFeed, pending: feedPending } = useApi<{ data: NewsItem[] }>(() => `/dashboard/feed?limit=50${selectedCategory.value ? `&category=${selectedCategory.value}` : ''}`);
const { data: videos, refresh: refreshVideos, pending: videosPending } = useApi<{ data: Video[] }>('/videos?limit=20');

const generating = ref<Record<string, boolean>>({});
const generationResults = ref<Record<string, { videoId: string; status: string }>>({});

async function generateVideo(newsItemId: string) {
  generating.value[newsItemId] = true;
  try {
    const response = await $fetch(`/videos/generate?newsItemId=${newsItemId}`, {
      method: 'POST',
      baseURL: '/api',
      credentials: 'include',
    });
    generationResults.value[newsItemId] = (response as { data: { videoId: string; status: string } }).data;
    refreshVideos();
  } catch (error) {
    console.error('Failed to generate video:', error);
  } finally {
    generating.value[newsItemId] = false;
  }
}

function formatDate(date?: string) {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
}

function previewAsset(item: NewsItem) {
  return item.assets?.find((asset) => asset.type === 'image')?.sourceUrl;
}
</script>

<template>
  <div class="space-y-8 py-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Browse curated news and generate videos
        </p>
      </div>
      <UserButton />
    </div>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">News Feed</h2>
          <USelect
            v-model="selectedCategory"
            :items="[
              { label: 'All categories', value: '' },
              { label: 'African Business', value: 'african-business' },
              { label: 'Banking & Finance', value: 'banking-finance' },
              { label: 'Lifestyle', value: 'lifestyle' },
            ]"
            placeholder="Filter by category"
            class="w-56"
            @change="() => refreshFeed()"
          />
        </div>
      </template>

      <div v-if="feedPending" class="py-8 text-center text-gray-500">
        Loading feed...
      </div>

      <div v-else-if="!feed?.data?.length" class="py-8 text-center text-gray-500">
        No news items available. Content discovery runs hourly.
      </div>

      <div v-else class="divide-y divide-gray-100 dark:divide-white/10">
        <div
          v-for="item in feed.data"
          :key="item.id"
          class="flex flex-col gap-4 py-6 sm:flex-row sm:items-start"
        >
          <div
            v-if="previewAsset(item)"
            class="shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-white/5"
          >
            <img
              :src="previewAsset(item)"
              alt=""
              class="size-32 object-cover"
            />
          </div>

          <div class="flex-1 space-y-2">
            <div class="flex items-center gap-2 text-xs text-gray-500">
              <span class="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                {{ item.category?.name || 'News' }}
              </span>
              <span>{{ item.source }}</span>
              <span v-if="item.publishedAt">· {{ formatDate(item.publishedAt) }}</span>
            </div>

            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ item.title }}
            </h3>

            <p v-if="item.summary" class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {{ item.summary }}
            </p>

            <div class="flex flex-wrap items-center gap-3 pt-2">
              <UButton
                v-if="item.sourceUrl"
                :to="item.sourceUrl"
                target="_blank"
                variant="ghost"
                size="sm"
              >
                View story
              </UButton>

              <UButton
                :loading="generating[item.id]"
                size="sm"
                @click="generateVideo(item.id)"
              >
                Generate video
              </UButton>

              <span
                v-if="generationResults[item.id]"
                class="text-xs text-green-600"
              >
                Queued: {{ generationResults[item.id]?.videoId }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Generated Videos</h2>
      </template>

      <div v-if="videosPending" class="py-8 text-center text-gray-500">
        Loading videos...
      </div>

      <div v-else-if="!videos?.data?.length" class="py-8 text-center text-gray-500">
        No videos generated yet.
      </div>

      <ul v-else class="divide-y divide-gray-100 dark:divide-white/10">
        <li
          v-for="video in videos.data"
          :key="video.id"
          class="flex items-center justify-between py-4"
        >
          <div>
            <p class="font-medium text-gray-900 dark:text-white">
              {{ video.title || 'Untitled video' }}
            </p>
            <p class="text-xs text-gray-500">
              {{ video.status }} · {{ formatDate(video.createdAt) }}
            </p>
          </div>
          <NuxtLink
            :to="`/videos/${video.id}`"
            class="text-sm text-blue-600 hover:underline"
          >
            View
          </NuxtLink>
        </li>
      </ul>
    </UCard>
  </div>
</template>
