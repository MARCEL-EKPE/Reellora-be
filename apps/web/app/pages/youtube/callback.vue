<script setup lang="ts">
import { useSocialAccountsService } from '~/services/social-accounts.service';

const route = useRoute();
const code = typeof route.query.code === 'string' ? route.query.code : null;

if (!code) {
  throw createError({ statusCode: 400, statusMessage: 'Missing YouTube authorization code.' });
}

const socialAccounts = useSocialAccountsService();
const { error } = await useAsyncData('youtube-code-exchange', () =>
  socialAccounts.exchangeYouTubeCode(code),
);

if (error.value) {
  throw createError({ statusCode: 502, statusMessage: 'YouTube authentication failed.' });
}
</script>

<template>
  <div class="flex min-h-dvh items-center justify-center p-4">
    <UCard class="w-full max-w-md text-center">
      <UIcon name="i-lucide-circle-check" class="mx-auto mb-4 size-12 text-success" />
      <h1 class="text-xl font-semibold">YouTube connected</h1>
      <p class="mt-2 text-sm text-muted">Your YouTube account was authenticated successfully.</p>
      <UButton to="/" label="Return home" class="mt-6" block />
    </UCard>
  </div>
</template>
