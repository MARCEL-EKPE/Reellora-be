<script setup lang="ts">
import { SignUp } from '@clerk/nuxt/components';

definePageMeta({
  layout: 'auth',
});
</script>

<template>
  <UCard class="w-full max-w-md" variant="outline">
    <template #header>
      <div class="space-y-1 text-center">
        <h1 class="text-2xl font-bold tracking-tight">Sign up</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Create an account to manage your social accounts
        </p>
      </div>
    </template>

    <SignUp fallback-redirect-url="/dashboard" sign-in-url="/sign-in" />
  </UCard>
</template>
