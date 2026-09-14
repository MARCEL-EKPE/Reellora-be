<template>
  <div class="flex min-h-dvh items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-950 dark:to-slate-900">
    <UCard class="w-full max-w-md" variant="outline">
      <template #header>
        <div class="space-y-1 text-center">
          <h1 class="text-2xl font-bold tracking-tight">Sign up</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Create an account to manage your social accounts
          </p>
        </div>
      </template>

      <SignUp fallback-redirect-url="/" sign-in-url="/sign-in" />
    </UCard>
  </div>
</template>
