<template>
  <div>
    <!-- Hero -->
    <section class="relative px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8 lg:pt-32">
      <div class="mx-auto max-w-4xl text-center">
        <div class="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-4 py-1.5 dark:border-blue-500/20 dark:bg-blue-500/10">
          <UIcon name="i-lucide-sparkles" class="size-4 text-blue-600 dark:text-blue-400" />
          <span class="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">AI Video Automation</span>
        </div>

        <h1 class="text-balance text-5xl font-bold leading-[1.1] tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl">
          Manage your socials,<br />
          <span class="gradient-text">powered by AI</span>
        </h1>

        <p class="mx-auto mt-6 max-w-2xl text-balance text-lg text-gray-600 dark:text-gray-400 sm:text-xl">
          Reellora connects your YouTube and social accounts so you can automate, schedule, and scale your video content with intelligent tools.
        </p>

        <div class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Show when="signed-out">
            <UButton to="/sign-up" label="Start creating free" size="xl" class="min-w-[12rem]" />
            <UButton to="/sign-in" label="Sign in" variant="outline" size="xl" class="min-w-[12rem]" />
          </Show>

          <Show when="signed-in">
            <UButton to="/dashboard" label="Go to dashboard" size="xl" class="min-w-[12rem]" />
          </Show>
        </div>

        <div class="mt-12 flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
          <span class="flex items-center gap-2">
            <UIcon name="i-lucide-check-circle" class="size-4 text-green-500" />
            No credit card required
          </span>
          <span class="flex items-center gap-2">
            <UIcon name="i-lucide-check-circle" class="size-4 text-green-500" />
            Free to get started
          </span>
        </div>
      </div>
    </section>

    <!-- Brand strip -->
    <section class="relative overflow-hidden border-y border-gray-100 bg-gray-50/70 px-4 py-10 dark:border-white/5 dark:bg-white/[0.02] sm:px-6 lg:px-8">
      <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.10),transparent_55%)]" />
      <div class="relative mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[1fr_auto]">
        <div class="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <div class="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-white shadow-sm shadow-indigo-100/60 dark:border-indigo-500/20 dark:bg-white/5 dark:shadow-none">
            <img src="/favicon.ico" alt="" class="size-9 object-contain" />
          </div>
          <div>
            <div class="mb-1 flex items-center justify-center gap-2 sm:justify-start">
              <span class="font-semibold text-gray-900 dark:text-white">Built for creators, by design</span>
              <span class="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">Reellora</span>
            </div>
            <p class="max-w-xl text-sm leading-6 text-gray-500 dark:text-gray-400">
              One intelligent workspace to plan, automate, and grow your video presence without the busywork.
            </p>
          </div>
        </div>

        <div class="grid grid-cols-3 divide-x divide-gray-200 rounded-2xl border border-gray-200/80 bg-white/80 px-2 py-4 shadow-sm backdrop-blur dark:divide-white/10 dark:border-white/10 dark:bg-white/[0.03]">
          <div class="px-4 text-center">
            <UIcon name="i-lucide-zap" class="mx-auto mb-1 size-4 text-amber-500" />
            <span class="text-xs font-medium text-gray-600 dark:text-gray-300">Automate</span>
          </div>
          <div class="px-4 text-center">
            <UIcon name="i-lucide-calendar-clock" class="mx-auto mb-1 size-4 text-blue-500" />
            <span class="text-xs font-medium text-gray-600 dark:text-gray-300">Schedule</span>
          </div>
          <div class="px-4 text-center">
            <UIcon name="i-lucide-trending-up" class="mx-auto mb-1 size-4 text-emerald-500" />
            <span class="text-xs font-medium text-gray-600 dark:text-gray-300">Grow</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-6xl">
        <div class="mb-12 text-center">
          <h2 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Built for modern creators
          </h2>
          <p class="mx-auto mt-4 max-w-2xl text-gray-600 dark:text-gray-400">
            Everything you need to connect, automate, and manage your video presence.
          </p>
        </div>

        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <UCard class="bg-white/60 dark:bg-white/[0.03]" variant="outline">
            <div class="mb-4 inline-flex rounded-xl bg-red-50 p-3 dark:bg-red-500/10">
              <UIcon name="i-simple-icons:youtube" class="size-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">YouTube linking</h3>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Securely connect your YouTube channel and start automating uploads, metadata, and analytics.
            </p>
          </UCard>

          <UCard class="bg-white/60 dark:bg-white/[0.03]" variant="outline">
            <div class="mb-4 inline-flex rounded-xl bg-blue-50 p-3 dark:bg-blue-500/10">
              <UIcon name="i-lucide-bot" class="size-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">AI automation</h3>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Let AI handle repetitive tasks so you can focus on creating content that matters.
            </p>
          </UCard>

          <UCard class="bg-white/60 dark:bg-white/[0.03]" variant="outline">
            <div class="mb-4 inline-flex rounded-xl bg-violet-50 p-3 dark:bg-violet-500/10">
              <UIcon name="i-lucide-share-2" class="size-6 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Social accounts</h3>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Bring all your social profiles into one simple dashboard designed for growth.
            </p>
          </UCard>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section id="get-started" class="scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-4xl rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/80 via-white to-violet-50/80 p-10 text-center dark:border-white/10 dark:from-blue-950/30 dark:via-[#0f1016] dark:to-violet-950/30 sm:p-16">
        <h2 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Ready to automate your videos?
        </h2>
        <p class="mx-auto mt-4 max-w-xl text-gray-600 dark:text-gray-400">
          Join Reellora today and turn your content workflow into a growth engine.
        </p>
        <div class="mt-8 flex justify-center">
          <Show when="signed-out">
            <UButton to="/sign-up" label="Create your free account" size="xl" />
          </Show>
          <Show when="signed-in">
            <UButton to="/dashboard" label="Open dashboard" size="xl" />
          </Show>
        </div>
      </div>
    </section>

    <LayoutAppFooter />
  </div>
</template>
