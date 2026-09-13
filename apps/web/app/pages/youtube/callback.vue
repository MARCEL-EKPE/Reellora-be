<!-- <template>
  <div class="p-6 space-y-6 flex flex-col items-center justify-center">

    <div v-if="isLoading" class="flex flex-col items-center space-y-3">
      <svg
        class="animate-spin h-10 w-10 text-primary"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      <p class="text-gray-600">Authenticating your YouTube account...</p>
    </div>


    <div v-if="youtubeResponse && !isLoading" class="w-full max-w-md space-y-4">

      <h2 class="text-lg font-semibold">Select Niche</h2>

      <select
        v-model="selectedNiche"
        class="border rounded-md p-2 w-full"
      >
        <option disabled value="">Select niche</option>
        <option v-for="(value, key) in Niche" :key="key" :value="value">
          {{ value }}
        </option>
      </select>

      <Button
        @click="''"
        class="w-full mt-4"
      >
        <span v-if="!isSaving">Save YouTube Channel</span>
        <span v-else class="flex items-center gap-2">
          <Loader2 class="h-4 w-4 animate-spin" />
          Saving...
        </span>
      </Button>

    </div>

  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
// import { useUserStore } from "~/stores/userStore";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-vue-next";

import { Niche } from "~/enums/niche.enum";
import type { YouTubeData } from "~/types/youtubeData.interface";

const userStore = useUserStore();

const youtubeResponse = ref<any>(null);
const selectedNiche = ref("");
const isLoading = ref(true);      // <-- Full-page loading (Google style)
const isSaving = ref(false);      // <-- Button loading

onMounted(async () => {
  const code = new URLSearchParams(window.location.search).get("code");
  if (!code) {
    console.error("No code received from Google.");
    return;
  }

  try {
    const res = await fetch(
      'http://localhost:3000/social-accounts/youtube/exchange-code?code=${code}'
    );

    youtubeResponse.value = await res.json();
    console.log("YouTube channel details:", youtubeResponse.value);

  } catch (error) {
    console.error("Exchange error:", error);

  } finally {
    isLoading.value = false;
  }
});


// const saveYouTubeChannel = async () => {
//   if (!selectedNiche.value) {
//     alert("Please select a niche");
//     return;
//   }

//   isSaving.value = true;

//   const payload: YouTubeData = {
//     channelId: youtubeResponse.value.data.channels[0].id,
//     title: youtubeResponse.value.data.channels[0].title,
//     thumbnail: youtubeResponse.value.data.channels[0].thumbnail,
//     accessToken: youtubeResponse.value.data.accessToken,
//     refreshToken: youtubeResponse.value.data.refreshToken,
//     tokenExpiry: youtubeResponse.value.data.tokenExpiry,
//     userId: userStore.user.id,   // <-- Getting from Pinia
//     niche: selectedNiche.value as Niche,
//   };

//   try {
//     const res = await fetch(`${API_BASE}/social-accounts/youtube/save`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });

//     const result = await res.json();

//     console.log("Saved:", result);
//     // navigateTo('/settings/social-accounts');

//   } catch (e) {
//     console.error("Save error:", e);
//   } finally {
//     isSaving.value = false;
//   }
// };
</script> -->



<template>
  <div class="p-6 text-center">
    Authenticating your YouTube account...
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref} from "vue";
// import { Niche } from "~/enums/niche.enum";
// import { type YouTubeData } from "~/types/youtubeData.interface";

const youtubeResponse = ref([])

onMounted(async () => {
  const code = new URLSearchParams(window.location.search).get("code");
  if (!code) {
    console.error("No code received from Google.");
    return;
  }

  try {
    const res = await fetch(
      `http://localhost:3000/social-accounts/youtube/exchange-code?code=${code}`
    );

    const data = await res.json();
    youtubeResponse.value = data
    console.log("YouTube channel details:", data);

    // Redirect user back to profile/settings
    // navigateTo('/settings/social-accounts');
  } catch (error) {
    console.error("Exchange error:", error);
  }
});
</script>
