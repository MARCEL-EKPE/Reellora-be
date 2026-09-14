<template>
  <main class="max-w-[1200px] mx-auto min-h-screen p-8">
    <section class="max-w-md rounded-xl border border-gray-200 p-6 shadow-sm">
      <h1 class="mb-1 text-2xl font-semibold">Admin sign in</h1>
      <p class="mb-5 text-sm text-gray-600">Use the seeded admin account to test the API connection.</p>

      <form class="space-y-4" @submit.prevent="signIn">
        <label class="block">
          <span class="mb-1 block text-sm font-medium">Email</span>
          <input v-model="email" type="email" required class="w-full rounded-md border px-3 py-2" />
        </label>
        <label class="block">
          <span class="mb-1 block text-sm font-medium">Password</span>
          <input v-model="password" type="password" required class="w-full rounded-md border px-3 py-2" />
        </label>
        <button :disabled="pending" class="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50">
          {{ pending ? 'Connecting...' : 'Sign in' }}
        </button>
      </form>

      <p v-if="status" class="mt-4 text-sm" :class="authenticated ? 'text-green-700' : 'text-red-700'">
        {{ status }}
      </p>
    </section>

    <section class="mt-8">
      <div class="flex gap-4">
        <social-google-login />
        <social-facebook-login />
      </div>
      <div class="mt-4 flex gap-4">
        <social-youtube-link />
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const email = ref('');
const password = ref('');
const pending = ref(false);
const authenticated = ref(false);
const status = ref('');

const signIn = async () => {
  pending.value = true;
  authenticated.value = false;
  status.value = '';

  try {
    await $fetch(`${config.public.apiBase}/auth/sign-in`, {
      method: 'POST',
      body: { email: email.value, password: password.value },
    });
    authenticated.value = true;
    status.value = 'Connected to the API and signed in successfully.';
  } catch {
    status.value = 'Sign-in failed. Check the credentials and API status.';
  } finally {
    pending.value = false;
  }
};
</script>
