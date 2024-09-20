<script setup lang="ts">
  import type { Chapter } from '~/models/chapter';
  import type { Favorite, Readed } from '@prisma/client';
  import type { DownloadManager } from '~/managers/downloadManager';
  import { getCurrentWindow } from '@tauri-apps/api/window';
  const favorite = useState<Favorite>('favorite')
  const dlManager = useState<DownloadManager>('dlManager')
  const images = useState<string[]>('images')
  const chapters = useState<Chapter[]>('chapters')
  const isDivMainHidden = useState<Boolean>('isDivMainHidden', () => false)
  const isFavoriteOpen = useState<Boolean>('isFavoriteOpen')
  const currentWindow = getCurrentWindow()
  const readeds = useState<Readed[]>('readeds')
  async function fetchChapters() {
    chapters.value = await dlManager.value.getChapters(favorite.value.sourceId, favorite.value.source)
  }


  async function readChapter(chapter: Chapter) {
    console.log(chapter.chNumber)
    images.value = await dlManager.value.getChapterImages(chapter.chapterId, favorite.value.source)
    isFavoriteOpen.value = false
    isDivMainHidden.value = true
    currentWindow.setFullscreen(true)
  }
  async function updateFavorite() {
    favorite.value.isUltraFavorite = !favorite.value.isUltraFavorite
    const updatedFavorite = await $fetch('/api/favorites', {
      method: 'PUT',
      body: JSON.stringify({
        id: favorite.value.id,
        name: favorite.value.name,
        folderName: favorite.value.folderName,
        cover: favorite.value.cover,
        source: favorite.value.source,
        sourceId: favorite.value.sourceId,
        type: favorite.value.type,
        extraName: favorite.value.extraName,
        titleColor: favorite.value.titleColor,
        cardColor: favorite.value.cardColor,
        grade: favorite.value.grade,
        author: favorite.value.author,
        description: favorite.value.description,
        isUltraFavorite: favorite.value.isUltraFavorite,
      })
    })
    console.log(updatedFavorite)
  }  
  function isReaded(chapter: Chapter) {
    return readeds.value.find(r => r.chapterId === chapter.chapterId && r.source === favorite.value.source && r.language === chapter.language)
  }
  async function addReaded(chapter: Chapter) {
    const readed = isReaded(chapter)
    if (readed) {
      await deleteReaded(readed)
      return
    }
    await $fetch('/api/readed', {
      method: 'POST',
      body: JSON.stringify({
        favoriteId: favorite.value.id,
        chapterId: chapter.chapterId,
        source: favorite.value.source,
        language: chapter.language,
      })
    })
    //@ts-ignore
    readeds.value = await $fetch('/api/readeds', {
      method: 'GET',
      params: {
        favoriteId: favorite.value.id,
      }
    })
  }
  async function deleteReaded(readed: Readed) {
    await $fetch('/api/readeds', {
      method: 'DELETE',
      body: JSON.stringify({
        id: readed.id,
        favoriteId: favorite.value.id,
      })
    })
    //@ts-ignore
    readeds.value = await $fetch('/api/readeds', {
      method: 'GET',
      params: {
        favoriteId: favorite.value.id,
      }
    })
  }
  onMounted(async () => {
    chapters.value = []
    chapters.value = await dlManager.value.getChapters(favorite.value.sourceId, favorite.value.source)
    readeds.value = await $fetch('/api/readeds', {
      method: 'GET',
      params: {
        favoriteId: favorite.value.id,
      }
    })
  })
</script>

<template>
  <UModal class="rounded">
    <div class="h-120 flex flex-col justify-center items-center">
      <UBadge class="m-1" color="white" variant="solid" >
        {{ favorite.name }}
      </UBadge>
      <div class="flex flex-row justify-between">
        <div class="flex flex-col h-80 m-6">
          <NuxtImg :src="favorite.cover" class="h-60 w-40 m-2 object-contain rounded-xl" />
          <UButton 
            :icon="favorite.isUltraFavorite? 'i-heroicons-star-solid' : 'i-heroicons-star'"
            color="gray"
            variant="link"
            class="h-10 m-0.5"
            @click="updateFavorite"
          />
        </div>
        <UDivider orientation="vertical" size="sm"/>
        <div class="flex flex-col h-80 m-6">
          <UInput placeholder="Chapters..." class="w-50 m-0.5" icon="i-heroicons-magnifying-glass-solid" />
          <div class="bg-gray-800 rounded-xl m-1 p-1 h-60 flex flex-col overflow-y-scroll">
            <div 
              class="w-40 m-0.5 flex flex-col items-center"
              v-for="chapter in chapters" 
              :key="chapter.chapterId">
                <UButtonGroup orientation="horizontal" class=" flex ">
                  <UButton
                    @click="() => readChapter(chapter)"
                    class="h-5 w-20"
                    color="white"
                    variant="solid"
                  >
                    {{ chapter.chNumber }}
                  </UButton>
                  <UButton
                    @click="console.log('nada')"
                    class="h-5"
                    color="white"
                    variant="solid"
                    disabled
                    icon="i-heroicons-arrow-down-tray"
                  />
                  <UButton
                    @click="() => addReaded(chapter)"
                    class="h-5"
                    color="white"
                    variant="solid"
                    :icon="isReaded(chapter)? 'i-heroicons-check' : 'i-heroicons-minus'" 
                  />
                </UButtonGroup>
  
            </div>
          </div>
        </div>
      </div>
    </div> 
  </UModal >
</template>