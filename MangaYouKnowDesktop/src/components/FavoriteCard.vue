<script setup lang="ts">
  import type { Favorite, User } from '@prisma/client';
  const { favorite } = defineProps<{
    favorite: Favorite
  }>()
  const user = useState<User>('user')
  const isFavoriteOpen = useState<Boolean>('isFavoriteOpen', () => false)
  const favoriteOpen = useState<Favorite>('favorite')
  const favorites = useState<Favorite[]>('favorites')

  function openFavorite() {
    favoriteOpen.value = favorite
    isFavoriteOpen.value = true
  }

  async function deleteFavorite() {
    await $fetch('/api/favorites', {
      method: 'DELETE',
      body: JSON.stringify({
        id: favorite.id,
        userId: user.value.id,
      })
    })
    //@ts-ignore
    favorites.value = await $fetch('/api/favorites', {
      method: 'GET',
      params: {
        userId: user.value.id,
      }
    })
  }
</script>

<template>
  <div class="bg-gray-900 rounded-xl h-[280px] w-40 flex flex-col !p-0 items-center">
    <UTooltip :text=favorite.name placement="bottom">
      <UBadge class="w-36 m-1 flex justify-center" color="white" variant="solid" >
        {{ favorite.name.substring(0, 16) + (favorite.name.length > 16? "..." : "") }}
      </UBadge>
    </UTooltip>
    <NuxtImg :src="favorite.cover" class="h-52 w-36 object-contain rounded-xl" />
    <UButtonGroup orientation="horizontal" class="w-full flex justify-center">
      <UButton
        @click="openFavorite"
        class="h-10"
        color="gray"
        variant="ghost"
        icon="i-heroicons-book-open-solid"
      />
      <UButton
        @click="console.log('nada')"
        color="gray"
        variant="ghost"
        icon="i-heroicons-pencil-square-solid"
      />
      <UButton
        @click="deleteFavorite"
        color="gray"
        variant="ghost"
        icon="i-heroicons-x-circle-solid"
      />
    </UButtonGroup>
  </div>
</template>