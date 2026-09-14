<script setup lang="ts">
import * as z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';

const auth = useAuthStore();

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  email: '',
  password: '',
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  await auth.signIn(event.data.email, event.data.password);
}
</script>

<template>
  <div class="flex min-h-dvh items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-950 dark:to-slate-900">
    <UCard class="w-full max-w-md" variant="outline">
      <template #header>
        <div class="space-y-1 text-center">
          <h1 class="text-2xl font-bold tracking-tight">Reellora</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Sign in to manage your social accounts
          </p>
        </div>
      </template>

      <div class="space-y-6">
        <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
          <UFormField label="Email" name="email">
            <UInput
              v-model="state.email"
              type="email"
              placeholder="admin@example.com"
              icon="i-lucide-mail"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Password" name="password">
            <UInput
              v-model="state.password"
              type="password"
              placeholder="••••••••"
              icon="i-lucide-lock"
              class="w-full"
            />
          </UFormField>

          <UButton
            type="submit"
            label="Sign in"
            :loading="auth.pending"
            block
          />
        </UForm>

        <UAlert
          v-if="auth.error"
          color="error"
          variant="soft"
          :title="auth.error"
          icon="i-lucide-circle-alert"
          class="mt-4"
        />

        <UAlert
          v-if="auth.isLoggedIn"
          color="success"
          variant="soft"
          title="Connected to the API successfully."
          icon="i-lucide-check-circle-2"
          class="mt-4"
        />

        <div class="relative my-4">
          <USeparator label="or continue with" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <social-google-login />
          <social-facebook-login />
        </div>

        <UButton
          color="error"
          variant="soft"
          label="Link YouTube"
          icon="i-simple-icons:youtube"
          block
          class="mt-2"
          @click="navigateTo('/youtube/callback')"
        />
      </div>
    </UCard>

    <div v-if="auth.isLoggedIn" class="fixed inset-x-0 top-6 mx-auto w-full max-w-md">
      <UCard class="shadow-lg" variant="soft" color="success">
        <div class="flex items-center gap-3">
          <UAvatar icon="i-lucide-user" color="primary" />
          <div>
            <p class="font-semibold">{{ auth.user?.email }}</p>
            <p class="text-xs text-gray-500">Role: {{ auth.user?.role }}</p>
          </div>
          <UButton
            size="sm"
            color="neutral"
            variant="ghost"
            label="Sign out"
            class="ms-auto"
            @click="auth.signOut()"
          />
        </div>
      </UCard>
    </div>
  </div>
</template>
