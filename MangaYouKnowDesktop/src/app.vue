<script setup lang="ts">
  import type { User } from "@prisma/client";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  const isDivMainHidden = useState<Boolean>('isDivMainHidden', () => false)
  const isLogged = useState<Boolean>('isLogged', () => false)
  const currentWindow = getCurrentWindow()

  const user = useState<User>('user')
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
  <!-- main app -->
  <div v-if="isLogged">
    <div v-if="!isDivMainHidden" class="flex" >
      <Sidebar />
      <NuxtPage />
    </div>
    <div v-if="isDivMainHidden">
      <Reader />
    </div>
  </div>
  <!-- login -->
  <div v-if="!isLogged">
    <Login />
  </div>
</template>
 