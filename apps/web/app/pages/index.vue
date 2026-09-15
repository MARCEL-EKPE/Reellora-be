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
    <section class="border-y border-gray-100 bg-gray-50/50 px-4 py-10 dark:border-white/5 dark:bg-white/[0.02] sm:px-6 lg:px-8">
      <div class="mx-auto flex max-w-6xl flex-col items-center justify-center gap-6 sm:flex-row">
        <img src="/images/AppLogo.png" alt="Reellora" class="h-10 w-auto opacity-90 dark:opacity-100" />
        <p class="text-center text-sm text-gray-500 dark:text-gray-400 sm:text-left">
          The unified workspace for creators who want to grow faster with AI-driven video automation.
        </p>
      </div>
    </section>

    <!-- Features -->
    <section class="px-4 py-20 sm:px-6 lg:px-8">
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
    <section class="px-4 py-20 sm:px-6 lg:px-8">
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
  </div>
</template>
