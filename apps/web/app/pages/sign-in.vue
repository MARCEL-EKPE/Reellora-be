<template>
  <div class="flex min-h-dvh items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-950 dark:to-slate-900">
    <UCard class="w-full max-w-md" variant="outline">
      <template #header>
        <div class="space-y-1 text-center">
          <h1 class="text-2xl font-bold tracking-tight">Sign in</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Sign in to manage your social accounts
          </p>
        </div>
      </template>

      <SignIn fallback-redirect-url="/" sign-up-url="/sign-up" />
    </UCard>
  </div>
</template>
