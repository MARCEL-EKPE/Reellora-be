<script setup lang="ts">
import { SignIn } from '@clerk/nuxt/components';

definePageMeta({
  layout: 'auth',
});
</script>

<template>
  <UCard class="w-full max-w-md" variant="outline">
    <template #header>
      <div class="space-y-1 text-center">
        <h1 class="text-2xl font-bold tracking-tight">Sign in</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Sign in to manage your social accounts
        </p>
      </div>
    </template>

    <SignIn fallback-redirect-url="/dashboard" sign-up-url="/sign-up" />
  </UCard>
</template>
