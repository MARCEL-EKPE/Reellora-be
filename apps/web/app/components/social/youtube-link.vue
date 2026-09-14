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

async function linkYoutube() {
  try {
    const res = await $fetch(`${config.public.apiBase}/social-accounts/youtube/link`);
    if (res?.data?.url) {
      window.location.href = res.data.url;
    }
  } catch (error) {
    console.error('Failed to get YouTube auth URL:', error);
  }
}
</script>
