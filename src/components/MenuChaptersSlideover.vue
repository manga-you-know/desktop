<script setup lang="ts">
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { ReadedRepository } from "~/repositories";
  import { addReadedBelow, isReaded } from "~/functions";
  import type { DownloadManager } from "~/managers";
  import type { Chapter, Favorite, Readed } from "~/models";
  const isOpen = ref(false);
  const { chapters, currentlyChapter, readChapterNextOrPrev, closeMenu } =
    defineProps<{
      chapters: Chapter[];
      currentlyChapter: Chapter;
      readChapterNextOrPrev: (way: "next" | "prev") => void;
      closeMenu: () => void;
      mode: string;
    }>();

  const dlManager = useState<DownloadManager>("dlManager");
  const favorite = useState<Favorite>("favorite");
  const images = useState<string[]>("images");
  const chapterH = useState<Chapter>("chapter");
  const readeds = ref<Readed[]>([]);
  const currentlyCount = useState<number>("currentlyCount");
  const totalPage = useState<number>("totalPage");
  const currentlyPage = useState<string>("currentlyPage");
  const rerender = ref(0);
  async function readChapter(chapter: Chapter) {
    images.value = await dlManager.value.getChapterImages(chapter);
    closeMenu();
    currentlyPage.value = images.value[currentlyCount.value - 1];
    totalPage.value = images.value.length;
    chapterH.value = chapter;
    currentlyCount.value = 1;
    await fetchPages();
    await addReadedBelow(chapter, chapters, favorite.value, undefined, true);
  }
  async function addReaded(chapter: Chapter) {
    await addReadedBelow(chapter, chapters, favorite.value, readeds.value);
    readeds.value = await ReadedRepository.getReadeds(favorite.value);
  }
  function isReadedHere(chapter: Chapter) {
    return isReaded(chapter, readeds.value);
  }
  async function fetchPages() {
    useHead({
      title: favorite.value.name,
      link: images.value.map((image) => {
        return {
          rel: "preload",
          href: image,
          as: "image",
        };
      }),
    });
  }

  onMounted(async () => {
    readeds.value = await ReadedRepository.getReadeds(favorite.value);
    rerender.value++;
  });
</script>

<template>
  <USlideover :key="rerender" v-model:open="isOpen">
    <template #content>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
      />
      <div>
        <div class="w-full h-11 flex justify-center items-center">
          <UButton
            size="xl"
            color="neutral"
            @click="
              () => {
                if (mode !== 'external') {
                  isOpen = false;
                  getCurrentWindow().setFullscreen(false);
                  navigateTo(useRoute().redirectedFrom);
                } else {
                  getCurrentWindow().destroy();
                }
              }
            "
            :icon="mode !== 'external' ? 'i-lucide-home' : 'i-lucide-x'"
          />
          <div class="p-2 gap-1 flex flex-row rounded-lg">
            <UButton
              size="xl"
              icon="heroicons:arrow-left-solid"
              color="neutral"
              @click="readChapterNextOrPrev('prev')"
            />
            <UButton
              size="xl"
              icon="heroicons:arrow-right-solid"
              color="neutral"
              @click="readChapterNextOrPrev('next')"
            />
          </div>
        </div>
        <USeparator class="w-full h-1" />
        <div
          class="h-[calc(100vh-3rem)] bg-gray-800 rounded-xl m-1 p-1 flex flex-col overflow-y-scroll"
        >
          <div
            class="m-0.5 flex flex-col items-center"
            v-for="chapter in chapters"
            :key="chapter.chapter_id"
          >
            <!-- Uses nested components to better performance :) -->
            <div
              class="inline-flex -space-x-px overflow-hidden rounded-md border border-gray-500 bg-slate-700 shadow-sm"
            >
              <p>
                {{
                  chapter.chapter_id == currentlyChapter.chapter_id ? "~" : ""
                }}
              </p>
              <button
                class="w-52 p-0.5 flex justify-start bg-slate-800 font-medium text-white hover:bg-transparent"
                @click="
                  () =>
                    navigateTo(
                      `/reader/${favorite.id}/${chapters.indexOf(chapter)}`
                    )
                "
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
                @click="() => addReaded(chapter)"
              >
                <i
                  :class="isReadedHere(chapter) ? 'fa fa-check' : 'fa fa-minus'"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </USlideover>
</template>
