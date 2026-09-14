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
import { useSocialAccountsService } from '~/services/social-accounts.service';

const socialAccounts = useSocialAccountsService();
const toast = useToast();

async function linkYoutube() {
  try {
    const { data } = await socialAccounts.getYouTubeLink();
    await navigateTo(data.url, { external: true });
  } catch {
    toast.add({ title: 'Unable to connect YouTube', color: 'error' });
  }
}
</script>
