<script setup lang="ts">
  import type { User } from "@prisma/client";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { DownloadManager } from "./managers/downloadManager";
  import { Favorite } from "./models/favorite";
  const isDivMainHidden = useState<Boolean>('isDivMainHidden', () => false)
  const isLogged = useState<Boolean>('isLogged', () => false)
  const isSearchOpen = useState<Boolean>('isSearchOpen', () => false)
  const isFavoriteOpen = useState<Boolean>('isFavoriteOpen', () => false)
  const currentWindow = getCurrentWindow()
  const user = useState<User>('user')
  const favorite = useState<Favorite>('favorite')
  const dlManager = useState<DownloadManager>('dlManager', () => new DownloadManager())
  defineShortcuts({
    meta_k: {
      usingInput: true,
      handler: () => {
        isSearchOpen.value = !isSearchOpen.value
      }
  }})
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
  <!-- overlay's -->
  <SearchModal v-model="isSearchOpen" />
  <FavoriteModal v-if="favorite" v-model="isFavoriteOpen" :key="favorite.id" />
  <!-- main app -->
  <div v-if="isLogged">
    <div v-if="!isDivMainHidden" class="flex" >
      <Sidebar />
      <div class="w-[30px] min-w-[30px] md:w-[100px] md:min-w-[100px] mr-5" />
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
 