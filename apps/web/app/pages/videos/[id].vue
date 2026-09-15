<script setup lang="ts">
import type { VideoSummary as Video } from '@reellora/shared';

definePageMeta({
  middleware: 'auth',
});

const route = useRoute();
const videoId = route.params.id as string;

const { data, refresh, pending } = useApi<{ data: Video }>(() => `/videos/${videoId}/status`);

let interval: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  interval = setInterval(() => {
    refresh();
  }, 5000);
});

onUnmounted(() => {
  if (interval) {
    clearInterval(interval);
  }
});

function formatDate(date?: string) {
  if (!date) return '';
  return new Date(date).toLocaleString();
}

function finalVideoUrl(video?: Video) {
  return video?.assets?.find((asset) => asset.type === 'VIDEO')?.url;
}
</script>

<template>
  <div class="space-y-6 py-6">
    <div class="flex items-center gap-2 text-sm text-gray-500">
      <NuxtLink to="/dashboard" class="hover:underline">
        ← Dashboard
      </NuxtLink>
    </div>

    <UCard>
      <template #header>
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">
          {{ data?.data?.title || 'Video generation' }}
        </h1>
      </template>

      <div v-if="pending" class="py-8 text-center text-gray-500">
        Loading...
      </div>

      <div v-else-if="!data?.data" class="py-8 text-center text-gray-500">
        Video not found.
      </div>

      <div v-else class="space-y-4">
        <div class="flex items-center gap-3">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
          <span
            class="rounded-full px-2.5 py-0.5 text-xs font-medium"
            :class="{
              'bg-green-100 text-green-700': data.data.status === 'ready_to_publish' || data.data.status === 'published',
              'bg-red-100 text-red-700': data.data.status.includes('failed'),
              'bg-blue-100 text-blue-700': !data.data.status.includes('failed') && data.data.status !== 'ready_to_publish' && data.data.status !== 'published',
            }"
          >
            {{ data.data.status }}
          </span>
        </div>

        <p v-if="data.data.errorMessage" class="text-sm text-red-600">
          {{ data.data.errorMessage }}
        </p>

        <p class="text-sm text-gray-500">
          Created at {{ formatDate(data.data.createdAt) }}
        </p>

        <video
          v-if="finalVideoUrl(data.data)"
          controls
          class="w-full max-w-2xl rounded-lg"
        >
          <source :src="finalVideoUrl(data.data)" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </UCard>
  </div>
</template>
