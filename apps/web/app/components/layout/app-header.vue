<template>
  <header class="sticky top-0 z-50 border-b border-gray-200/80 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-[#0a0a0f]/70">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
      <NuxtLink to="/" class="flex items-center gap-2.5">
        <img src="/images/AppIcon.png" alt="Reellora" class="h-8 w-auto" />
        <div class="flex flex-col">
          <span class="text-lg font-bold leading-none tracking-tight">Reellora</span>
          <span class="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">AI Video Automation</span>
        </div>
      </NuxtLink>

      <nav class="flex items-center gap-3 sm:gap-5">
        <NuxtLink
          to="/"
          class="hidden text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white sm:block"
        >
          Home
        </NuxtLink>
        <NuxtLink
          to="/dashboard"
          class="hidden text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white sm:block"
        >
          Dashboard
        </NuxtLink>

        <SignedOut>
          <UButton to="/sign-in" label="Sign in" variant="ghost" size="sm" />
          <UButton to="/sign-up" label="Get started" size="sm" />
        </SignedOut>

        <SignedIn>
          <UButton to="/dashboard" label="Dashboard" variant="ghost" size="sm" class="hidden sm:flex" />
          <UserButton />
        </SignedIn>
      </nav>
    </div>
  </header>
</template>
