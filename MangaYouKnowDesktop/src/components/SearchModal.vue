<script setup lang="ts">
  import type { Favorite, Readed, User } from '~/models';
  import { DownloadManager } from '~/managers/downloadManager';
  import { FavoriteDB } from '~/database';

  const user = useState<User>('user')
  const query = ref('')
  const dlManager = useState<DownloadManager>('dlManager')
  const isLoading = ref(false)
  const results = ref<Favorite[]>([]);
  const favorites = useState<Favorite[]>('favorites')

  const finished = ref()

  function resetResults() {
    query.value = ''
    results.value = []
  }

  async function search() {
    isLoading.value = true
    await new Promise(resolve => {
      setTimeout(() => {
        resolve(true)
      }, 10)
    })
    if (query.value === '') {
      results.value = []
      isLoading.value = false
      return
    }
    try {
      favorites.value = await FavoriteDB.getFavorites(user.value.id)
      results.value = (await dlManager.value.search(query.value, 'MangaSee')).slice(0, 20);
    } catch (error) {
      finished.value = error
    } finally {
      isLoading.value = false;
    }
  }
  async function verifyFavorites() {
    const favorites = await FavoriteDB.getFavorites(user.value.id)
  }
  function isFavorite(favorite: Favorite) {
    return favorites.value.find(f => f.name === favorite.name && f.source === favorite.source && f.sourceID === favorite.sourceID)
  }

  async function favorite(favorite: Favorite) {
    const isFavoriteh = isFavorite(favorite)
    if (isFavoriteh) {
      await FavoriteDB.deleteFavorite(isFavoriteh)
      favorites.value = await FavoriteDB.getFavorites(user.value.id)
      return
    }
    await FavoriteDB.createFavorite(favorite, user.value.id)
    favorites.value = await FavoriteDB.getFavorites(user.value.id)
  }
</script>

<template>
  <UModal class="rounded" :overlay="true">
    <div class="w-full h-11 flex justify-center items-center">
      <UInput
        v-model="query"
        v-on:update:model-value="search"
        name="query"
        :loading="isLoading"
        variant="none"
        :padded="false"
        class="w-[97%]"
        placeholder="Search..."
        icon="i-heroicons-magnifying-glass-20-solid"
        leading
        autocomplete="off"
        :ui="{ icon: { trailing: { pointer: '' } } }"
      >
        <template #trailing>
          <UButton
            v-show="query !== ''"
            color="gray"
            variant="link"
            icon="i-heroicons-x-mark-20-solid"
            :padded="false"
            @click="resetResults"
          />
        </template>
      </UInput>
    </div>
    <UDivider class="w-full h-1"/>
    <div class="w-full h-48 flex flex-col overflow-y-scroll">
      <div v-for="result in results" :key="result.name">
        <UButtonGroup orientation="horizontal" class="w-full">
          <UButton 
            @click="console.log('nada')" 
            color="gray"
            variant="ghost"
            class="w-[93%] h-10 m-0.5 flex justify-between">
             {{ result.name.substring(0, 60) + (result.name.length > 60? "..." : "") }} 
          </UButton>
          <UButton 
            :icon="isFavorite(result)? 'i-heroicons-star-solid' : 'i-heroicons-star'"
            color="gray" 
            variant="link"
            class="h-10 m-0.5"
            @click="() => favorite(result)"
          />
        </UButtonGroup>
      </div>
    </div> 
  </UModal >
</template>