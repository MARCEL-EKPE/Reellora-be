<template>
  <GoogleSignInButton
    @success="ggLoginSuccess"
    @error="ggLoginError"
    size="large"
    width="240"
    text="continue_with"
  />
</template>

<script setup lang="ts">
import { GoogleSignInButton, type CredentialResponse } from 'vue3-google-signin';

const auth = useAuthStore();

async function ggLoginSuccess(response: CredentialResponse) {
  const { credential } = response;
  if (credential) {
    await auth.signInWithToken(credential);
  }
}

function ggLoginError() {
  console.error('Google login failed');
}
</script>
