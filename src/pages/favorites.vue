<script setup lang="ts">
import { FavoriteDB } from '~/database';
import type { Favorite, User } from '~/models';
const user = useState<User>('user');
const query = ref('');
const isLoading = ref(false);
const favorites = useState<Favorite[]>('favorites', () => []);
const isSelecting = useState<boolean>('isSelecting', () => false);
const sources = ref<string[]>([]);
const sourceSearch = ref();
async function search() {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 10);
  });
  if (query.value === '') {
    isLoading.value = false;
    favorites.value =
      sourceSearch.value === 'all'
        ? await FavoriteDB.getFavorites(user.value.id)
        : await FavoriteDB.getFavoritesBySource(
            user.value.id,
            sourceSearch.value,
          );
    return;
  }
  isLoading.value = true;
  favorites.value =
    sourceSearch.value === 'all'
      ? await FavoriteDB.getFavorites(user.value.id, query.value)
      : await FavoriteDB.getFavoritesBySource(
          user.value.id,
          sourceSearch.value,
          query.value,
        );
  isLoading.value = false;
}
async function resetResults() {
  query.value = '';
  isLoading.value = false;
  favorites.value = await FavoriteDB.getFavorites(user.value.id);
}
onMounted(async () => {
  favorites.value = await FavoriteDB.getFavorites(user.value.id);
  sources.value = [
    'all',
    ...(await FavoriteDB.getFavoriteSources(user.value.id)),
  ];
  sourceSearch.value = sources.value[0];
});
</script>


<template>
    <div class="w-full h-full">
        <div class="w-full h-12 p-2 flex justify-center z-10 bg-gray-850">
          <div class="relative gap-3 flex">
            <UInput 
                v-model="query"
                v-on:update:model-value="search"
                :loading="isLoading" 
                placeholder="Search..." 
                color="cyan"
                icon="i-heroicons-magnifying-glass-solid" 
                class="w-full"
            >
                <template #trailing>
                    <UButton
                        tabindex="-1"
                        color="gray"
                        variant="link"
                        icon="i-heroicons-x-mark-20-solid"
                        class="pointer-events-auto"
                        @click="resetResults"
                    />
                </template>
            </UInput>
            <USelectMenu
                class="w-32"
                searchable
                clear-search-on-close
                v-on:update:model-value="search"
                v-model="sourceSearch"
                :options="sources"
                color="cyan"
            />
            <UButton
              @click="isSelecting = !isSelecting"
            >
              turn
            </UButton>
          </div>
        </div>
        <div class="w-full h-[calc(100vh-3rem)] pb-5 overflow-y-auto overflow-x-hidden  flex flex-row justify-start gap-2 flex-wrap">
            <div 
                class=""
                v-for="favorite in favorites" 
                :key="favorite.id">
                <FavoriteCard :favorite="favorite" />
            </div>
        </div>
    </div> 
</template>

