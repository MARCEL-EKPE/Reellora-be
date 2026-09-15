<script setup lang="ts">
const year = new Date().getFullYear();
</script>

<template>
  <footer class="relative overflow-hidden border-t border-white/10 bg-[#080910] text-white">
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(99,102,241,0.18),transparent_35%),radial-gradient(circle_at_85%_100%,rgba(168,85,247,0.12),transparent_30%)]" />
    <div class="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:40px_40px]" />

    <div class="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
      <div class="grid gap-12 border-b border-white/10 pb-12 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
        <div>
          <NuxtLink to="/" class="inline-flex items-center gap-3" aria-label="Reellora home">
            <img src="/favicon.ico" alt="" class="size-11 object-contain" />
            <div>
              <span class="block text-xl font-bold leading-none tracking-tight">Reellora</span>
              <span class="mt-1 block text-[9px] font-semibold uppercase tracking-[0.28em] text-indigo-300">AI Video Automation</span>
            </div>
          </NuxtLink>
          <p class="mt-5 max-w-md text-sm leading-6 text-gray-400">
            The intelligent workspace for creators who want to automate the busywork, publish consistently, and grow with confidence.
          </p>
          <div class="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300 backdrop-blur">
            <span class="relative flex size-2">
              <span class="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span class="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            Built for the next generation of creators
          </div>
        </div>

        <div class="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-gray-500">Product</p>
            <nav class="mt-4 flex flex-col gap-3 text-sm text-gray-300">
              <NuxtLink to="/#features" class="transition-colors hover:text-white">Features</NuxtLink>
              <NuxtLink to="/dashboard" class="transition-colors hover:text-white">Dashboard</NuxtLink>
              <NuxtLink to="/#get-started" class="transition-colors hover:text-white">Get started</NuxtLink>
            </nav>
          </div>
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-gray-500">Account</p>
            <nav class="mt-4 flex flex-col gap-3 text-sm text-gray-300">
              <NuxtLink to="/sign-in" class="transition-colors hover:text-white">Sign in</NuxtLink>
              <NuxtLink to="/sign-up" class="transition-colors hover:text-white">Create account</NuxtLink>
            </nav>
          </div>
          <div class="col-span-2 sm:col-span-1">
            <p class="text-xs font-semibold uppercase tracking-wider text-gray-500">Platform</p>
            <div class="mt-4 flex flex-col gap-3 text-sm text-gray-300">
              <span class="flex items-center gap-2"><UIcon name="i-simple-icons:youtube" class="size-4 text-red-400" /> YouTube</span>
              <span class="flex items-center gap-2"><UIcon name="i-lucide-sparkles" class="size-4 text-violet-400" /> AI automation</span>
              <span class="flex items-center gap-2"><UIcon name="i-lucide-calendar-clock" class="size-4 text-blue-400" /> Scheduling</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-3 pt-6 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {{ year }} Reellora. All rights reserved.</p>
        <p class="flex items-center gap-2">
          Create smarter
          <span class="size-1 rounded-full bg-gray-700" />
          Publish faster
          <span class="size-1 rounded-full bg-gray-700" />
          Grow further
        </p>
      </div>
    </div>
  </footer>
</template>
