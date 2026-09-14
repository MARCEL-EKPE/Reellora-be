<template>
  <div class="flex min-h-dvh items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-950 dark:to-slate-900">
    <UCard class="w-full max-w-md" variant="outline">
      <template #header>
        <div class="space-y-1 text-center">
          <h1 class="text-2xl font-bold tracking-tight">Reellora</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Manage your social accounts
          </p>
        </div>
      </template>

      <SignedOut>
        <div class="space-y-6">
          <SignIn routing="hash" />
        </div>
      </SignedOut>

      <SignedIn>
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-semibold">{{ user?.primaryEmailAddress?.emailAddress }}</p>
              <p class="text-xs text-gray-500">Signed in with Clerk</p>
            </div>
            <UserButton />
          </div>

          <social-youtube-link />
        </div>
      </SignedIn>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const { user } = useUser();
</script>
