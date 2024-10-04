<script setup lang="ts">
  import type { Favorite, Readed, Chapter, User } from '~/models';
  import type { DownloadManager } from '~/managers/downloadManager';
  import { getCurrentWindow } from '@tauri-apps/api/window';
  import { FavoriteDB, ReadedDB } from '~/database';
  const favorite = useState<Favorite>('favorite')
  const dlManager = useState<DownloadManager>('dlManager')
  const images = useState<string[]>('images')
  const chapters = useState<Chapter[]>('chapters')
  const chaptersDisplayed = ref<Chapter[]>([])
  const isDivMainHidden = useState<Boolean>('isDivMainHidden', () => false)
  const isFavoriteOpen = useState<Boolean>('isFavoriteOpen')
  const rerenderIndex = useState<number>('rerenderIndex')
  const currentWindow = getCurrentWindow()
  const readeds = useState<Readed[]>('readeds')
  const ultraFavorites = useState<Favorite[]>('ultraFavorites')
  const chapterQuery = ref('')
  const isSearching = ref(false)
  const currentChapter = ref<Chapter>()
  const user = useState<User>('user')

  async function readChapter(chapter: Chapter) {
    images.value = await dlManager.value.getChapterImages(chapter.chapter_id, favorite.value.source)
    isFavoriteOpen.value = false
    isDivMainHidden.value = true
    currentWindow.setFullscreen(true)
    if (!isReaded(chapter)) {
      addReadedBelow(chapter)
    }
  }
  async function searchChapters() {
    isSearching.value = true
    await new Promise(resolve => {
      setTimeout(() => {
        resolve(true)
      }, 10)
    })
    if (chapterQuery.value === '') {
      chaptersDisplayed.value = chapters.value
      isSearching.value = false
      return
    }
    chaptersDisplayed.value = chapters.value.filter(chapter => chapter.number.toString().includes(chapterQuery.value)).reverse()
    isSearching.value = false
  }
  function resetChapters() {
    isSearching.value = true
    chapterQuery.value = ''
    chaptersDisplayed.value = chapters.value
    isSearching.value = false
  }
  async function updateFavoriteHandler() {
    favorite.value.is_ultra_favorite = !favorite.value.is_ultra_favorite
    await FavoriteDB.updateFavorite(favorite.value)
  }  
  function isReaded(chapter: Chapter) {
    return readeds.value.find(r => r.chapter_id === chapter.chapter_id && r.source === favorite.value.source && r.language === chapter.language)
  }
  async function addReadedBelow(chapter: Chapter) {
    const readed = isReaded(chapter)
    if (readed) {
      await deleteReadedAbove(readed)
      return
    }
    var toAdd = []
    var isForAdd = false
    for (var chapterI of chapters.value) {
      if (chapterI.chapter_id == chapter.chapter_id) {
        isForAdd = true
      }
      if (isForAdd ) {
        const read = isReaded(chapterI) 
        if (!read) {
          toAdd.push(chapterI)
        }
      }
    }
    await ReadedDB.createReadeds(toAdd, favorite.value.id)
    readeds.value = await ReadedDB.getReadeds(favorite.value)
    currentChapter.value = getNextForRead()
  }
  function getLastReaded() {
    return chapters.value.filter(chapter => isReaded(chapter))[0]
  }
  function getNextForRead() {
    return chapters.value.filter(chapter => !isReaded(chapter)).reverse()[0]
  }
  async function deleteReadedAbove(readed: Readed) {
    var toDelete = []
    var isForDelete = false
    for (var chapter of [...chapters.value].reverse()) {
      if (chapter.chapter_id == readed.chapter_id) {
        isForDelete = true
      }
      if (isForDelete ) {
        const read = isReaded(chapter) 
        if (read) {
          toDelete.push(read)
        }
      }
    }
    await ReadedDB.deleteReadeds(toDelete)
    readeds.value = await ReadedDB.getReadeds(favorite.value)
    currentChapter.value = getNextForRead()
  }
  async function onClose() {
    ultraFavorites.value = await FavoriteDB.getUltraFavorites(user.value.id)
    rerenderIndex.value++
  }
  var isChapterFetched = false
  onBeforeMount(async () => {
    chaptersDisplayed.value = []
    chapters.value = await dlManager.value.getChapters(favorite.value)
    isChapterFetched = true
  })
  onMounted(async () => {
    if (!favorite.value) {
      return
    }
    readeds.value = await ReadedDB.getReadeds(favorite.value)
    chaptersDisplayed.value = []
    while (!isChapterFetched) {
      await new Promise(resolve => {
        setTimeout(() => {
          resolve(true)
        }, 10)
      })
    }
    chaptersDisplayed.value = chapters.value
    currentChapter.value = getNextForRead()
  })
</script>

<template>
  <UModal class="rounded-xl" @close="onClose">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <div v-if="favorite" class="h-120 flex flex-col justify-center items-center">
      <UBadge class="m-1" color="white" variant="solid" >
        {{ favorite.name }}
      </UBadge>
      <div class="flex flex-row justify-between">
        <div class="w-[50%] flex flex-col h-80 m-6">
          <NuxtImg :src="favorite.cover" class="h-60 w-40 m-2 object-contain rounded-xl" />
          <UButton 
            :icon="favorite.is_ultra_favorite? 'i-heroicons-star-solid' : 'i-heroicons-star'"
            color="gray"
            variant="link"
            class="h-10 m-0.5"
            @click="updateFavoriteHandler"
          />
        </div>
        <UDivider orientation="vertical" size="sm"/>
        <div class="w-[50%] flex flex-col h-80 m-6">
          <div class="w-[200px] bg-gray-800 rounded-xl m-1 p-1 flex justify-center">
            <div class="inline-flex -space-x-px overflow-hidden rounded-md border border-gray-500 bg-slate-700 shadow-sm">
                <button 
                  :class="['w-[115px]', 'p-0.5', 'flex', 'justify-start', 'bg-slate-800', 'font-medium', 'text-white', currentChapter ? 'hover:bg-transparent' : '']"
                  @click="() => currentChapter? readChapter(currentChapter) : console.log('nada')"
                >
                  {{ currentChapter?.number || 'all readed!' }}
                </button>
                <button 
                  class="w-[40px] bg-slate-800 font-medium text-white hover:bg-transparent"
                  @click="console.log('nada')"
                >
                  <i class="fa fa-download"></i>
                </button> 
                <button 
                  class="w-[33px] bg-slate-800 font-medium text-white hover:bg-transparent"
                  @click="() => currentChapter? addReadedBelow(currentChapter) : console.log('nada')"
                >
                  <i class="fa fa-angle-right" />
                </button>
              </div>
          </div>
          <UInput 
            v-model="chapterQuery"
            v-on:update:model-value="searchChapters"
            :loading="isSearching"
            color="cyan"
            placeholder="Chapters..." 
            icon="i-heroicons-magnifying-glass-solid" 
            class="w-50 m-0.5" 
            autocomplete="off"
            :ui="{ icon: { trailing: { pointer: '' } } }"
          >
            <template #trailing>
              <UButton
                v-show="chapterQuery !== ''"
                color="gray"
                variant="link"
                icon="i-heroicons-x-mark-20-solid"
                :padded="false"
                @click="resetChapters"
              />
            </template>
          </UInput>
          <div class="h-72 bg-gray-800 rounded-xl m-1 p-1 flex flex-col overflow-y-scroll">
            <div 
              class=" m-0.5 flex flex-col items-center "
              v-for="chapter in chaptersDisplayed" 
              :key="chapter.chapter_id"
            >
              <!-- Uses nested components to better performance :) -->
              <div class="inline-flex -space-x-px overflow-hidden rounded-md border border-gray-500 bg-slate-700 shadow-sm">
                <button 
                  class="w-28 p-0.5 flex justify-start  bg-slate-800 font-medium text-white hover:bg-transparent"
                  @click="() => readChapter(chapter)"
                >
                  {{ chapter.number }}
                </button>
                <button 
                  class="w-7 bg-slate-800 font-medium text-white hover:bg-transparent"
                  @click="console.log('nada')"
                >
                  <i class="fa fa-download"></i>
                </button> 
                <button 
                  class="w-7 bg-slate-800 font-medium text-white hover:bg-transparent"
                  @click="() => addReadedBelow(chapter)"
                >
                  <i :class="isReaded(chapter)? 'fa fa-check' : 'fa fa-minus'" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div> 
  </UModal >
</template>