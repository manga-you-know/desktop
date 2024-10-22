<script setup lang="ts">
import { ReadedDB } from '~/database';
import { isReaded } from '~/functions';
import type { DownloadManager } from '~/managers/downloadManager';
import type { Favorite } from '~/models';
const { favorite } = defineProps<{
  favorite: Favorite;
}>();
const dlManager = useState<DownloadManager>('dlManager');
const isFavoriteOpen = useState<boolean>('isFavoriteOpen');
const favoriteOpen = useState<Favorite>('favorite');
const isLoading = ref(false);
const chaptersToRead = ref();
const chaptersReaded = ref();
onMounted(async () => {
  isLoading.value = true;
  const readeds = await ReadedDB.getReadeds(favorite);
  const chapters = await dlManager.value.getChapters(favorite);
  isLoading.value = false;
  if (!chapters.ok) {
    chaptersToRead.value = 'Error';
    chaptersReaded.value = 'Error';
    return;
  }
  const chaptersLen = Number(chapters?.chapters?.length) ?? 0;
  let countToRead = 0;
  //@ts-ignore
  for (const chapter of chapters.chapters) {
    if (isReaded(chapter, readeds)) {
      break;
    }
    countToRead++;
  }
  //@ts-ignore
  chaptersToRead.value =
    countToRead > 0
      //@ts-ignore
      ? `+${countToRead}`
      : 'All readed';
  //@ts-ignore
  chaptersReaded.value = `${chaptersLen - countToRead}/${chapters.chapters.length}`;
});
function openFavorite() {
  favoriteOpen.value = favorite;
  isFavoriteOpen.value = true;
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