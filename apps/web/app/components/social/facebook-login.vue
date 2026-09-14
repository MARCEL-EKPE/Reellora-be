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
interface FacebookResponse {
  authResponse?: {
    accessToken?: string;
  };
}

const HFaceBookLogin = moduleExports.HFaceBookLogin || moduleExports.default?.HFaceBookLogin;
const auth = useAuthStore();
const toast = useToast();

async function fbLoginSuccess(response: FacebookResponse) {
  const accessToken = response.authResponse?.accessToken;
  if (accessToken) {
    await auth.signInWithToken('facebook', accessToken);
  }
}

function fbLoginError() {
  toast.add({ title: 'Facebook login failed', color: 'error' });
}
</script>
