<script setup lang="ts">
import type { FeedItem } from '@reellora/shared';

definePageMeta({
  middleware: 'auth',
});

const store = useDashboardStore();

const generating = ref<Record<string, boolean>>({});
const generationResults = ref<Record<string, { videoId: string; status: string }>>({});

onMounted(() => {
  store.loadFeed();
  store.loadVideos();
});

async function generate(newsItemId: string) {
  generating.value[newsItemId] = true;
  try {
    const { data } = await store.generateVideo(newsItemId);
    generationResults.value[newsItemId] = data;
    await store.loadVideos();
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

function previewAsset(item: FeedItem) {
  return item.assets?.find((asset) => asset.type === 'image')?.sourceUrl;
}
</script>

<template>
  <div class="space-y-8 py-6">
    <div class="rounded-2xl border border-gray-200/80 bg-gradient-to-br from-blue-50/80 via-white to-violet-50/80 p-6 shadow-sm dark:border-white/10 dark:from-blue-950/30 dark:via-[#0f1016] dark:to-violet-950/30 sm:p-8">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-start gap-4">
          <div class="hidden rounded-xl bg-blue-100 p-3 dark:bg-blue-500/10 sm:block">
            <UIcon name="i-lucide-layout-dashboard" class="size-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              Dashboard
            </h1>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Browse curated news and generate videos in one place.
            </p>
          </div>
        </div>

        <UButton
          :loading="store.feedLoading || store.videosLoading"
          variant="outline"
          color="neutral"
          size="sm"
          @click="store.loadFeed(); store.loadVideos();"
        >
          <UIcon name="i-lucide-refresh-cw" class="size-4" />
          <span class="hidden sm:inline">Refresh</span>
        </UButton>
      </div>
    </div>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">News Feed</h2>
          <USelect
            v-model="store.selectedCategory"
            :items="[
              { label: 'All categories', value: 'all' },
              { label: 'African Business', value: 'african-business' },
              { label: 'Banking & Finance', value: 'banking-finance' },
              { label: 'Lifestyle', value: 'lifestyle' },
            ]"
            placeholder="Filter by category"
            :disabled="store.feedLoading"
            class="w-56"
          />
        </div>
      </template>

      <div v-if="store.feedLoading" class="divide-y divide-gray-100 dark:divide-white/10">
        <div
          v-for="i in 3"
          :key="i"
          class="flex flex-col gap-4 py-6 sm:flex-row sm:items-start"
        >
          <USkeleton class="size-32 shrink-0 rounded-lg" />
          <div class="flex-1 space-y-3">
            <div class="flex items-center gap-2">
              <USkeleton class="h-5 w-24 rounded-full" />
              <USkeleton class="h-4 w-32" />
            </div>
            <USkeleton class="h-6 w-3/4" />
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-2/3" />
            <div class="flex gap-3 pt-2">
              <USkeleton class="h-9 w-24" />
              <USkeleton class="h-9 w-28" />
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="store.feedError" class="py-12 text-center">
        <UIcon name="i-lucide-alert-triangle" class="mx-auto size-10 text-red-400" />
        <h3 class="mt-3 text-sm font-medium text-gray-900 dark:text-white">Failed to load news feed</h3>
        <p class="mt-1 text-sm text-gray-500">{{ store.feedError }}</p>
        <UButton class="mt-4" size="sm" @click="store.loadFeed()">
          Try again
        </UButton>
      </div>

      <div v-else-if="!store.feed?.length" class="py-12 text-center">
        <UIcon name="i-lucide-newspaper" class="mx-auto size-10 text-gray-300 dark:text-gray-600" />
        <h3 class="mt-3 text-sm font-medium text-gray-900 dark:text-white">No news items</h3>
        <p class="mt-1 text-sm text-gray-500">Content discovery runs hourly. Check back soon.</p>
      </div>

      <div v-else class="divide-y divide-gray-100 dark:divide-white/10">
        <div
          v-for="item in store.feed"
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
                @click="generate(item.id)"
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

      <ul v-if="store.videosLoading" class="divide-y divide-gray-100 dark:divide-white/10">
        <li
          v-for="i in 3"
          :key="i"
          class="flex items-center justify-between py-4"
        >
          <div class="space-y-2">
            <USkeleton class="h-5 w-48" />
            <USkeleton class="h-4 w-32" />
          </div>
          <USkeleton class="h-4 w-12" />
        </li>
      </ul>

      <div v-else-if="store.videosError" class="py-12 text-center">
        <UIcon name="i-lucide-alert-triangle" class="mx-auto size-10 text-red-400" />
        <h3 class="mt-3 text-sm font-medium text-gray-900 dark:text-white">Failed to load videos</h3>
        <p class="mt-1 text-sm text-gray-500">{{ store.videosError }}</p>
        <UButton class="mt-4" size="sm" @click="store.loadVideos()">
          Try again
        </UButton>
      </div>

      <div v-else-if="!store.videos?.length" class="py-12 text-center">
        <UIcon name="i-lucide-film" class="mx-auto size-10 text-gray-300 dark:text-gray-600" />
        <h3 class="mt-3 text-sm font-medium text-gray-900 dark:text-white">No videos generated yet</h3>
        <p class="mt-1 text-sm text-gray-500">Select a news story above to create your first video.</p>
      </div>

      <ul v-else class="divide-y divide-gray-100 dark:divide-white/10">
        <li
          v-for="video in store.videos"
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
