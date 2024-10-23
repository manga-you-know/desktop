
<script setup lang="ts">
import { FavoriteDB } from '~/database';
import { MANGASOURCES } from '~/constants';
import type { Favorite, User } from '~/models';

const user = useState<User>('user');
const rerender = useState<number>('rerenderIndex', () => 0);
const isOpen = useState<boolean>('isSearchOpen', () => false);
const ultraFavorites = useState<Favorite[]>('ultraFavorites', () => []);
const sourceSearch = useState<string>('sourceSearch', () => MANGASOURCES[0]);
defineShortcuts({
  meta_r: {
    usingInput: true,
    handler: () => {
      rerender.value++;
    },
  },
});
onMounted(async () => {
  ultraFavorites.value = await FavoriteDB.getUltraFavorites(user.value.id);
});
</script>

<template>
  <div :key="rerender" class="h-full w-full flex flex-col">
    <div class="w-full h-16 flex relative justify-end">
      <div class="m-5 gap-1 flex ">
        <div>
          <UTooltip text="Search" :shortcuts="['Ctrl', 'K']">
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-magnifying-glass-20-solid"
              @click="isOpen = true"
            />
          </UTooltip>
          <UTooltip text="Refresh" :shortcuts="['Ctrl', 'R']">
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-arrow-path-solid"
              @click="rerender++"
            />
          </UTooltip>
        </div>
        <div>
          <USelectMenu
            searchable
            class="w-[150px]"
            clear-search-on-close
            v-model="sourceSearch"
            :options="MANGASOURCES"
            color="cyan"
          />  
        </div>
      </div>
    </div>
    <div class=" h-[calc(100vh-4rem)] w-full pb-5 flex flex-row flex-wrap justify-start gap-2 overflow-y-auto overflow-x-hidden">
      <div v-for="favorite in ultraFavorites" :key="favorite.name">
        <UltraFavoriteCard :favorite="favorite" />
      </div>
    </div>
  </div>
</template>
