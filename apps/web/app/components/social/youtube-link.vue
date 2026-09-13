<template>
  <button
  @click="linkYoutube"
    class="group flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-red-600 font-semibold border border-red-300 shadow-sm hover:bg-red-600 hover:text-white transition-all duration-300 focus:ring-4 focus:ring-red-300"
  >
    <Icon
      name="mdi:youtube"
      size="25"
      class="transition-transform duration-300 group-hover:scale-110"
    />
    <span class="tracking-wide">Link YouTube</span>
  </button>
</template>

<!-- <template>
  <button
   @click="linkYoutube"
    class="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-600 text-white font-medium shadow-sm hover:bg-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
  >
    <Icon name="mdi:youtube" size="20" />
    Link YouTube
  </button>
</template> -->


<script setup lang="ts">
const linkYoutube = async () => {
  try {
    const res = await fetch('http://localhost:3000/social-accounts/youtube/link');

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const parseResponse = await res.json();

    window.location.href = parseResponse.data.url; // Redirect to Google OAuth
  } catch (error) {
    console.error('Failed to get YouTube auth URL:', error);
  }
};

</script>
