<script setup lang="ts">
import { getCurrentWindow } from '@tauri-apps/api/window';
import Database from '@tauri-apps/plugin-sql';
import { migrationQuery } from '~/database';
import type { Favorite, User } from '~/models';
import { DATABASE_NAME } from './constants';
import { DownloadManager } from './managers/downloadManager';
const activeSidebar = useState<boolean>('activeSidebar', () => true);
const isLogged = useState<boolean>('isLogged', () => false);
const isSearchOpen = useState<boolean>('isSearchOpen', () => false);
const isFavoriteOpen = useState<boolean>('isFavoriteOpen', () => false);
const isEditFavoriteOpen = useState<boolean>('isEditFavoriteOpen', () => false);
const currentWindow = getCurrentWindow();
const user = useState<User>('user');
const favorite = useState<Favorite>('favorite');
useState<DownloadManager>('dlManager', () => new DownloadManager());
defineShortcuts({
  meta_k: {
    usingInput: true,
    handler: () => {
      if (user.value) {
        isSearchOpen.value = !isSearchOpen.value;
      }
    },
  },
});
defineShortcuts({
  f11: {
    usingInput: true,
    handler: async () => {
      currentWindow.setFullscreen(!(await currentWindow.isFullscreen()));
    },
  },
});
onBeforeMount(async () => {
  const db = await Database.load(`sqlite:${DATABASE_NAME}`);
  await db.execute(migrationQuery);
});
</script>


<template class="w-full h-full">
  <!-- overlay's -->
  <SearchModal v-model="isSearchOpen" />
  <FavoriteModal v-if="favorite" v-model="isFavoriteOpen" :key="favorite.id" />
  <EditFavoriteModal v-if="favorite" v-model="isEditFavoriteOpen" :key="favorite.id" />
  <!-- main app -->
  <div v-if="isLogged">
    <div class="flex">
      <Sidebar v-if="activeSidebar"/>
      <div class="w-[30px] min-w-[30px] md:w-[100px] md:min-w-[100px] mr-5 -z-10" />
      <NuxtPage />
    </div>
  </div>
  <!-- login -->
  <div class="w-full" v-if="!isLogged">
    <Login />
  </div>
</template>
 