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
import * as FacebookLoginPkg from '@healerlab/vue3-facebook-login';

const moduleExports = FacebookLoginPkg as typeof FacebookLoginPkg & {
  default?: typeof FacebookLoginPkg;
};
const HFaceBookLogin = moduleExports.HFaceBookLogin || moduleExports.default?.HFaceBookLogin;
const auth = useAuthStore();

async function fbLoginSuccess(response: any) {
  const accessToken = response?.authResponse?.accessToken;
  if (accessToken) {
    await auth.signInWithToken('facebook', accessToken);
  }
}

function fbLoginError(error: any) {
  console.error('Facebook login failed', error);
}
</script>
