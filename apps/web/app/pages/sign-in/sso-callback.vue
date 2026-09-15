<script setup lang="ts">
import { AuthenticateWithRedirectCallback } from '@clerk/nuxt/components';

definePageMeta({
  layout: 'auth',
});
</script>

<template>
  <div class="flex min-h-[50vh] flex-col items-center justify-center text-center">
    <div class="space-y-4">
      <div class="mx-auto size-8 animate-spin rounded-full border-b-2 border-blue-600" />
      <h1 class="text-xl font-semibold">Completing sign in...</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Please wait while we finish signing you in.
      </p>
    </div>

    <AuthenticateWithRedirectCallback
      sign-in-force-redirect-url="/dashboard"
      sign-up-force-redirect-url="/dashboard"
    />
  </div>
</template>
