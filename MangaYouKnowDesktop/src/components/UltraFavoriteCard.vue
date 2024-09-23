<script setup lang="ts">
  import type { Favorite } from '@prisma/client';
  import type { DownloadManager } from '~/managers/downloadManager';
  const { favorite } = defineProps<{
        favorite: Favorite
  }>()
  const dlManager = useState<DownloadManager>('dlManager')
  const isFavoriteOpen = useState<Boolean>('isFavoriteOpen')
  const favoriteOpen = useState<Favorite>('favorite')
  const isLoading = ref(false)
  const chaptersToRead = ref()
  const chaptersReaded = ref()
  onMounted(async () => {
    isLoading.value = true
    const chapters = await dlManager.value.getChapters(favorite)
    isLoading.value = false
    const readeds = await $fetch('/api/readeds', {
      method: 'GET',
      params: {
        favoriteId: favorite.id,
      }
    })
    chaptersToRead.value = (chapters.length - readeds.length) > 0 ? ('+' + (chapters.length - readeds.length)) : 'All readed'
    chaptersReaded.value = `${readeds.length}/${chapters.length}`
  })
  function openFavorite() {
    favoriteOpen.value = favorite
    isFavoriteOpen.value = true
  }
</script>

<template>
  <div>
    <div class="bg-gray-900 rounded-xl h-[280px] w-40 flex flex-col !p-0 items-center">
    <UTooltip :text=favorite.name :popper="{ placement: 'bottom', arrow: true }" >
      <UBadge class="w-36 m-1 flex justify-center" color="white" variant="solid" >
        {{ favorite.name.substring(0, 16) + (favorite.name.length > 16? "..." : "") }}
      </UBadge>
    </UTooltip>
    <NuxtImg :src="favorite.cover" class="h-52 w-36 object-contain rounded-xl" />
    <UButtonGroup orientation="horizontal" class="w-full flex justify-center">
      <UButton
        @click="openFavorite"
        class="h-10"
        color="white"
        variant="solid"
        icon="i-heroicons-book-open-solid"
      />
      <UTooltip :text="chaptersReaded" :popper="{ placement: 'top', arrow: true }" >
        <UButton
          :loading="isLoading"
          color="white"
          variant="solid"
          >
          {{ chaptersToRead }}
        </UButton>
      </UTooltip>
    </UButtonGroup>
  </div>
  </div>
</template>