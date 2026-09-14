<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
});
</script>

<template>
  <div class="space-y-6 py-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Manage your connected social accounts
        </p>
      </div>
      <UserButton />
    </div>

    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Connected accounts</h2>
      </template>
      <social-youtube-link />
    </UCard>
  </div>
</template>
