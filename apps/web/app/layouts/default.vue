<template>
  <div class="flex min-h-dvh flex-col bg-white dark:bg-[#0a0a0f]">
    <div class="hero-glow pointer-events-none fixed inset-0 -z-10" />
    <div class="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_0%_100%,rgba(59,130,246,0.08),transparent_35%)] dark:bg-[radial-gradient(circle_at_0%_100%,rgba(139,92,246,0.10),transparent_35%)]" />
    <AppHeader />
    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>
