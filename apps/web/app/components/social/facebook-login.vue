<template>
      <HFaceBookLogin 
        v-slot="fbLogin" 
        app-id="1966803287385992" 
        @onSuccess="fbLoginSuccess" 
        @onFailure="fbLoginError"
        scope="email,public_profile"
        fields="id,name,email,name,picture"
      >
        <button 
          @click="fbLogin.initFBLogin"
          class="flex items-center justify-center gap-3 px-5 py-2 rounded-[0.3rem] text-white font-medium transition-all duration-200 ease-in-out bg-[#1877f2] hover:bg-[#166fe5] focus:ring-2 focus:ring-[#1877f2]/50 active:scale-95 shadow-sm"
        >
          <Icon name="mdi:facebook" class="text-2xl" />
          <span class="text-sm">Continue with Facebook</span>
        </button>
      </HFaceBookLogin>
</template>

<script setup lang="ts">
import { useFetch } from "#app";
import FacebookLoginPkg from "@healerlab/vue3-facebook-login";

const { HFaceBookLogin } = FacebookLoginPkg as any;


const fbLoginSuccess = async (response: any) => {
  const { accessToken } = response.authResponse;
  // send token to your backend for verification
  await useFetch("http://localhost:3000/facebook-authentication", {
    method: "POST",
    body: {token: accessToken },
  });
};

const fbLoginError = (error: any) => {
  console.error("Facebook login failed", error);
};
</script>
<!-- https://www.termsfeed.com/live/53ee2405-06e3-4d2e-a434-01aab4831efd -->
