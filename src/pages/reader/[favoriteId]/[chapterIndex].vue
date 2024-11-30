<script setup lang="ts">
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { FavoriteRepository, ReadedRepository } from "~/repositories";
  import { addReadedBelow } from "~/functions";
  import type { DownloadManager } from "~/managers";
  import { Chapter } from "~/models";

  const { favoriteId, chapterIndex } = useRoute().params;
  const toast = useToast();
  const window = getCurrentWindow();
  const dlManager = useState<DownloadManager>("dlManager");
  const pages = ref<string[]>([]);
  const favorite = await FavoriteRepository.getFavorite(favoriteId);
  const chapters = useState<Chapter[]>("chapters");
  const chapter = ref<Chapter>(chapters.value[Number(chapterIndex)]);
  const currentlyCount = useState<number>("currentlyCount", () => 1);
  const totalPage = useState<number>("totalPage");
  const currentlyPage = useState<string>("currentlyPage", () => "/myk.svg");
  const openMenuChapters = ref(false);
  const isTheLastChapter = ref(chapter.value === chapters.value[0]);
  const zoom = ref(0);
  const zoomMinusDown = ref(false);
  const zoomPlusDown = ref(false);
  window.setTitle(`MangaYouKnow - ${favorite.name} / ${chapter.value.number}`);
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
  async function readNextOrPrevChapter(way: "next" | "prev" = "next") {
    const nextChapter =
      chapters.value[
        chapters.value.indexOf(chapter.value) - (way === "next" ? 1 : -1)
      ];
    await navigateTo(
      `/reader/${favoriteId}/${chapters.value.indexOf(nextChapter)}`
    );
    closeMenu();
  }
  async function fetchPages() {
    useHead({
      title: favorite.name,
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
      "ctrl_=": {
        usingInput: true,
        handler: () => {
          zoom.value += 1;
        },
      },
      "ctrl_-": {
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
      title: `Chapter ${chapter.value.number}`,
      description: favorite.name,
      color: "info",
      icon: "i-lucide-book-a",
      duration: 1000,
      click: () => {
        toast.clear();
      },
    });
    pages.value = await dlManager.value.getChapterImages(chapter.value);
    await addReadedBelow(
      chapter.value,
      chapters.value,
      favorite,
      undefined,
      true
    );
    totalPage.value = pages.value.length;
    currentlyPage.value = pages.value[0];
    currentlyCount.value = 1;
    isTheLastChapter.value = chapter.value === chapters.value[0];
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
  <MenuChaptersSlideover
    v-model:open="openMenuChapters"
    :chapters="chapters"
    :currentlyChapter="chapter"
    :readChapterNextOrPrev="readNextOrPrevChapter"
    :closeMenu="closeMenu"
  />
  <div
    class="fixed w-screen h-screen z-50 pointer-events-none flex justify-end items-center"
  >
    <UButton
      size="xl"
      v-if="currentlyCount === totalPage && !isTheLastChapter"
      icon="heroicons:arrow-right-solid"
      color="neutral"
      class="pointer-events-auto"
      @click="() => readNextOrPrevChapter('next')"
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
        icon="i-lucide-menu"
        color="neutral"
        variant="outline"
        @click="openMenuChapters = true"
      />
      <UPopover mode="hover" arrow>
        <UButton
          class="pointer-events-auto"
          size="xl"
          icon="nimbus:arrows-horizontal"
          color="neutral"
          variant="outline"
        />
        <template #content>
          <div class="p-2 gap-1 flex flex-row rounded-lg">
            <UButton
              size="xl"
              icon="i-lucide-arrow-left"
              color="neutral"
              variant="outline"
              @click="readNextOrPrevChapter('prev')"
            />
            <UButton
              size="xl"
              icon="i-lucide-arrow-right"
              color="neutral"
              variant="outline"
              @click="readNextOrPrevChapter('next')"
            />
          </div>
        </template>
      </UPopover>
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
      <UTooltip :text="`${favorite.name} / ${chapter.number}`">
        <UButtonGroup class="pointer-events-auto">
          <UBadge
            class="w-[5.5rem] rounded-r-none"
            color="neutral"
            variant="outline"
            :label="favorite.name"
          />
          <UBadge
            class="w-10 rounded-l-none flex justify-center items-center px-2"
            color="neutral"
            variant="outline"
            :label="chapter.number.toString()"
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
