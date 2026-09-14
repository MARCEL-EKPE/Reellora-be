<template>
  <HFaceBookLogin
    v-slot="fbLogin"
    app-id="1966803287385992"
    @on-success="fbLoginSuccess"
    @on-failure="fbLoginError"
    scope="email,public_profile"
    fields="id,name,email,name,picture"
  >
    <UButton
      color="info"
      variant="solid"
      label="Facebook"
      icon="i-simple-icons:facebook"
      block
      @click="fbLogin.initFBLogin"
    />
  </HFaceBookLogin>
</template>

<script setup lang="ts">
import FacebookLoginPkg from '@healerlab/vue3-facebook-login';

const HFaceBookLogin = (FacebookLoginPkg as any).HFaceBookLogin || FacebookLoginPkg;
const auth = useAuthStore();

async function fbLoginSuccess(response: any) {
  const accessToken = response?.authResponse?.accessToken;
  if (accessToken) {
    await auth.signInWithToken(accessToken);
  }
}

function fbLoginError(error: any) {
  console.error('Facebook login failed', error);
}
</script>
