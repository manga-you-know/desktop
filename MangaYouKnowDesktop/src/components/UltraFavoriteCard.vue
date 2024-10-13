<script setup lang="ts">
  import { ReadedDB } from '~/database';
  import type { Favorite } from '~/models';
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
    const readeds = await ReadedDB.getReadeds(favorite)
    const chapters = await dlManager.value.getChapters(favorite)
    isLoading.value = false
    if (!chapters.ok) {
      chaptersToRead.value = 'Error'
      chaptersReaded.value = 'Error'
      return
    }
    //@ts-ignore
    chaptersToRead.value = (chapters.chapters.length - readeds.length) > 0 ? ('+' + (chapters.chapters.length - readeds.length)) : 'All readed'
    //@ts-ignore
    chaptersReaded.value = `${readeds.length}/${chapters.chapters.length}`
  })
  function openFavorite() {
    favoriteOpen.value = favorite
    isFavoriteOpen.value = true
  }
</script>

<template>
  <div>
    <div class="relative bg-gray-900 rounded-xl h-[280px] w-40 flex flex-col !p-0 items-center hover:bg-gray-800 hover:cursor-pointer hover:shadow-lg transition-transform duration-300 ease-in-out transform hover:scale-[1.08] hover:z-10 border border-transparent hover:border-white hover:border-2" @click="openFavorite">
    <UTooltip :prevent="favorite.name.length < 17" :text=favorite.name :popper="{ placement: 'bottom', arrow: true }" >
      <UBadge class="w-36 m-1 flex justify-center cursor-default" color="white" variant="solid" >
        {{ favorite.name.substring(0, 16) + (favorite.name.length > 16? "..." : "") }}
      </UBadge>
    </UTooltip>
    <NuxtImg :src="favorite.cover" class="h-52 w-36 object-contain rounded-xl select-none" />
    <UButtonGroup orientation="horizontal" class="w-full flex justify-center">
      <UButton
        @click="openFavorite"
        class="h-8"
        color="white"
        variant="solid"
        icon="i-heroicons-book-open-solid"
      />
      <UTooltip :prevent="isLoading" :text="chaptersReaded" :popper="{ placement: 'top', arrow: true,  }" >
        <UButton
          class="cursor-default disabled:cursor-default"
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