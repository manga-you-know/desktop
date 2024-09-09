<script setup lang="ts">
  import { getCurrentWindow } from "@tauri-apps/api/window";
  const isDivMainHidden = useState<Boolean>('isDivMainHidden', () => false)
  const currentWindow = getCurrentWindow()
  defineShortcuts({
    f11: {
      usingInput: true,
      handler: async () => {
        currentWindow.setFullscreen(!await currentWindow.isFullscreen());
      }
    }
  })

</script>


<template class="w-full h-full">
  <div class="flex" :class="{ 'hidden': isDivMainHidden }" >
    <Sidebar />
    <NuxtPage />
  </div>
  <div :class="isDivMainHidden ? 'visible' : 'hidden'" >
    <Reader />
  </div>
</template>
 