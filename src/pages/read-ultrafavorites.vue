<script setup lang="ts">
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { addReadedBelow } from "~/functions";
  import type { DownloadManager } from "~/managers";
  import { Favorite, Chapter } from "~/models";

  definePageMeta({
    name: "Read Ultra Favorites",
  });
  const ultraChapters = useState<{
    [key: string]: {
      chapters: Chapter[];
      allChapters: Chapter[];
      self: Favorite;
    };
  }>("ultraChapters", () => ({}));
  const chapters = ref<
    { chapter: Chapter; allChapters: Chapter[]; favorite: Favorite }[]
  >(
    Object.values(ultraChapters.value).flatMap((ultraFavorite) =>
      ultraFavorite.chapters.map((chapter) => ({
        chapter,
        allChapters: ultraFavorite.allChapters,
        favorite: ultraFavorite.self,
      }))
    )
  );
  const chapter = ref<{
    chapter: Chapter;
    allChapters: Chapter[];
    favorite: Favorite;
  }>(chapters.value?.[0]);
  const isTheLastChapter = ref(
    chapter.value.chapter === chapters.value[chapters.value.length - 1].chapter
  );
  const toast = useToast();
  const window = getCurrentWindow();
  const dlManager = useState<DownloadManager>("dlManager");
  const pages = ref<string[]>([]);
  const currentlyCount = ref(1);
  const totalPage = ref(0);
  const currentlyPage = useState<string>("currentlyPage", () => "/myk.svg");
  const openMenuChapters = ref(false);
  const zoom = ref(0);
  const zoomMinusDown = ref(false);
  const zoomPlusDown = ref(false);
  function toNextPage() {
    if (currentlyCount.value === totalPage.value) return;
    currentlyCount.value++;
    currentlyPage.value = pages.value[currentlyCount.value - 1];
  }
  function toPrevPage() {
    if (currentlyCount.value === 1) return;
    currentlyCount.value--;
    currentlyPage.value = pages.value[currentlyCount.value - 1];
  }
  async function readNextChapter() {
    currentlyPage.value = "/myk.svg";
    const nextChapter =
      chapters.value[chapters.value.indexOf(chapter.value) + 1];
    chapters.value.splice(0, 1);
    ultraChapters.value[chapter.value.favorite.id ?? 0].chapters.splice(0, 1);
    chapter.value = nextChapter;
    toast.add({
      title: `Chapter ${chapter.value.chapter.number}`,
      description: chapter.value.favorite.name,
      color: "info",
      icon: "i-lucide-book-a",
      duration: 1000,
      click: () => {
        toast.clear();
      },
    });
    pages.value = await dlManager.value.getChapterImages(chapter.value.chapter);
    await addReadedBelow(
      chapter.value.chapter,
      chapter.value.allChapters,
      chapter.value.favorite,
      undefined,
      true
    );
    totalPage.value = pages.value.length;
    currentlyPage.value = pages.value[0];
    currentlyCount.value = 1;
    isTheLastChapter.value =
      chapter.value.chapter ===
      chapters.value[chapters.value.length - 1].chapter;
    fetchPages();
    closeMenu();
  }
  async function fetchPages() {
    useHead({
      link: pages.value.map((image) => {
        return {
          rel: "preload",
          href: image,
          as: "image",
        };
      }),
    });
  }
  function closeMenu() {
    openMenuChapters.value = false;
  }
  defineShortcuts(
    {
      f4: {
        usingInput: true,
        handler: () => {
          navigateTo(useRoute().redirectedFrom);
        },
      },
      arrowleft: {
        usingInput: true,
        handler: toPrevPage,
      },
      arrowright: {
        usingInput: true,
        handler: toNextPage,
      },
      ctrl_plus: {
        usingInput: true,
        handler: () => {
          zoom.value += 1;
        },
      },
      ctrl_minus: {
        usingInput: true,
        handler: () => {
          zoom.value -= 1;
        },
      },
    },
    { chainDelay: 400 }
  );
  onMounted(async () => {
    toast.add({
      title: `Chapter ${chapter.value.chapter.number}`,
      description: chapter.value.favorite.name,
      color: "info",
      icon: "i-lucide-book-a",
      duration: 1000,
      click: () => {
        toast.clear();
      },
    });
    pages.value = await dlManager.value.getChapterImages(chapter.value.chapter);
    await addReadedBelow(
      chapter.value.chapter,
      chapter.value.allChapters,
      chapter.value.favorite,
      undefined,
      true
    );
    totalPage.value = pages.value.length;
    currentlyPage.value = pages.value[0];
    currentlyCount.value = 1;
    isTheLastChapter.value =
      chapter.value.chapter ===
      chapters.value[chapters.value.length - 1].chapter;
    fetchPages();
  });
  watch(zoomMinusDown, async () => {
    zoom.value -= 1;
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 500);
    });
    while (zoomMinusDown.value) {
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 100);
      });
      zoom.value -= 1;
    }
  });
  watch(zoomPlusDown, async () => {
    zoom.value += 1;
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 500);
    });
    while (zoomPlusDown.value) {
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 100);
      });
      zoom.value += 1;
    }
  });
</script>

<template>
  <div
    class="fixed w-screen h-screen z-50 pointer-events-none flex justify-end items-center"
  >
    <UButton
      size="xl"
      v-if="currentlyCount === totalPage && !isTheLastChapter"
      icon="heroicons:arrow-right-solid"
      color="neutral"
      class="pointer-events-auto"
      @click="readNextChapter"
    />
  </div>
  <div class="fixed w-screen h-screen flex">
    <button
      class="w-[50%] cursor-default outline-none border-none"
      tabindex="-1"
      @click="toPrevPage"
    />
    <button
      class="w-[50%] cursor-default outline-none border-none"
      tabindex="-1"
      @click="toNextPage"
    />
  </div>
  <div
    class="fixed w-screen gap-1 p-[1%] flex flex-col justify-end items-end pointer-events-none"
  >
    <div class="flex gap-1 z-30">
      <UBadge class="m-1" color="neutral" variant="outline">
        {{ currentlyCount }} / {{ totalPage }}
      </UBadge>
      <UButton
        size="xl"
        class="pointer-events-auto"
        icon="i-lucide-home"
        color="neutral"
        variant="outline"
        @click="navigateTo('/')"
      />
      <UButton
        size="xl"
        class="pointer-events-auto"
        icon="i-lucide-arrow-right"
        color="neutral"
        variant="outline"
        :disabled="isTheLastChapter"
        @click="readNextChapter"
      />
    </div>
    <div class="flex gap-2">
      <UButtonGroup class="gap-0.5 pointer-events-auto z-50">
        <UButton
          color="neutral"
          variant="outline"
          icon="ic:round-minus"
          @mousedown="zoomMinusDown = true"
          @mouseup="zoomMinusDown = false"
        />
        <UButton
          class="w-10 p-0 flex justify-center"
          color="neutral"
          variant="outline"
          @click="zoom = 0"
          :label="zoom * 2 + 100 + '%'"
        />
        <UButton
          color="neutral"
          variant="outline"
          icon="ic:round-plus"
          @mousedown="zoomPlusDown = true"
          @mouseup="zoomPlusDown = false"
        />
      </UButtonGroup>
      <UButton
        class="pointer-events-auto z-50"
        icon="ic:outline-fullscreen-exit"
        color="neutral"
        variant="outline"
        @click="
          async () => {
            window.setFullscreen(!(await window.isFullscreen()));
          }
        "
      />
    </div>
    <div flex="flex gap-1 z-30">
      <UTooltip :text="`${chapter.favorite.name} / ${chapter.chapter.number}`">
        <UButtonGroup class="pointer-events-auto">
          <UBadge
            class="w-[5.5rem] rounded-r-none"
            color="neutral"
            variant="outline"
            :label="chapter.favorite.name"
          />
          <UBadge
            class="w-10 rounded-l-none flex justify-center items-center px-2"
            color="neutral"
            variant="outline"
            :label="chapter.chapter.number.toString()"
          />
        </UButtonGroup>
      </UTooltip>
    </div>
  </div>

  <div class="h-full w-full overflow-auto">
    <div class="min-h-full w-full flex items-center justify-center">
      <NuxtImg
        :src="currentlyPage"
        placeholder
        class="object-contain transition-all duration-200"
        :style="{
          height: `calc(100vh + ${zoom}rem)`,
          maxWidth: '100%',
          maxHeight: `calc(100vh + ${zoom}rem)`,
        }"
      />
    </div>
  </div>
</template>
