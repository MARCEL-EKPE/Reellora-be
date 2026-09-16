<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
});

const route = useRoute();
const store = useDashboardStore();

const videoId = route.params.id as string;

let interval: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  store.loadVideo(videoId);
  interval = setInterval(() => store.loadVideo(videoId), 5000);
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

function finalVideoUrl(video?: typeof store.video) {
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
          {{ store.video?.title || 'Video generation' }}
        </h1>
      </template>

      <div v-if="store.videoLoading" class="py-8 text-center text-gray-500">
        Loading...
      </div>

      <div v-else-if="!store.video" class="py-8 text-center text-gray-500">
        Video not found.
      </div>

      <div v-else class="space-y-4">
        <div class="flex items-center gap-3">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
          <span
            class="rounded-full px-2.5 py-0.5 text-xs font-medium"
            :class="{
              'bg-green-100 text-green-700': store.video.status === 'ready_to_publish' || store.video.status === 'published',
              'bg-red-100 text-red-700': store.video.status.includes('failed'),
              'bg-blue-100 text-blue-700': !store.video.status.includes('failed') && store.video.status !== 'ready_to_publish' && store.video.status !== 'published',
            }"
          >
            {{ store.video.status }}
          </span>
        </div>

        <p v-if="store.video.errorMessage" class="text-sm text-red-600">
          {{ store.video.errorMessage }}
        </p>

        <p class="text-sm text-gray-500">
          Created at {{ formatDate(store.video.createdAt) }}
        </p>

        <video
          v-if="finalVideoUrl(store.video)"
          controls
          class="w-full max-w-2xl rounded-lg"
        >
          <source :src="finalVideoUrl(store.video)" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </UCard>
  </div>
</template>
