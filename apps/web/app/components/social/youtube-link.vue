<template>
  <UButton
    color="error"
    variant="soft"
    label="Link YouTube"
    icon="i-simple-icons:youtube"
    block
    @click="linkYoutube"
  />
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const auth = useAuthStore();

async function linkYoutube() {
  try {
    const res = await $fetch<{ data: { url: string } }>(`${config.public.apiBase}/social-accounts/youtube/link`, {
      headers: auth.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : undefined,
    });
    if (res?.data?.url) {
      window.location.href = res.data.url;
    }
  } catch (error) {
    console.error('Failed to get YouTube auth URL:', error);
  }
}
</script>
