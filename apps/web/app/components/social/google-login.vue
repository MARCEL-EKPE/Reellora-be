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
import { useFetch , useNuxtApp } from "#app";
import { GoogleSignInButton, type CredentialResponse } from "vue3-google-signin";

const ggLoginSuccess = async (response: CredentialResponse) => {
  const { credential } = response;
  try {
    await $fetch("http://localhost:3000/google-authentication", {
      method: "POST",
      body: { token: credential },
    });
  } catch (err) {
    console.error("Request failed:", err);
  }
};

const ggLoginError = () => {
  console.error("Login failed");
};
</script>
