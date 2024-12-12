<script lang="ts" setup>
  import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
  import { invoke } from "@tauri-apps/api/core";
  import type { User, Favorite, Chapter, Readed } from "~/models";

  const { favorite, chapter, chapters } = defineProps<{
    favorite: Favorite;
    chapter: Chapter;
    chapters: Chapter[];
    readeds: Readed[];
    addReaded: (chapter: Chapter) => void;
    isReaded: (chapter: Chapter) => Readed | undefined;
  }>();
  async function readExternal() {
    const user = useState<User>("user");
    const key = Math.random().toString(36).substring(2, 15);

    await invoke("set_data", {
      key: key,
      value: {
        user_id: user.value.id,
        favorite_id: favorite.id,
        chapter_index: chapters.indexOf(chapter),
        chapters: chapters,
      },
    });
    const window = new WebviewWindow(key, {
      url: `/reader/${favorite.id}/${chapters.indexOf(
        chapter
      )}?mode=external&key=${key}`,
      title: `MangaYouKnow - ${favorite.name} / ${chapter.number}`,
      width: 800,
      height: 600,
      resizable: true,
    });
    window.once("tauri://error", (e) => {
      console.log(e);
    });
    // navigateTo(`/reader/${favorite.id}/${chapters.indexOf(chapter)}`);
  }
</script>
<template>
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
  />
  <div
    class="inline-flex -space-x-px overflow-hidden rounded-md border border-gray-500 bg-slate-700 shadow-sm"
    @click.prevent
  >
    <button
      class="cursor-pointer w-28 p-0.5 flex justify-start bg-slate-800 font-medium text-white hover:bg-transparent"
      @click="
        true
          ? navigateTo(`/reader/${favorite.id}/${chapters.indexOf(chapter)}`)
          : readExternal()
      "
      @mousedown="
        (e) => {
          if (e.button === 1) readExternal();
        }
      "
      @auxclick.prevent
    >
      {{ chapter.number }}
    </button>
    <button
      class="cursor-pointer w-7 bg-slate-800 font-medium text-white hover:bg-transparent"
      @click="console.log('nada')"
    >
      <i class="fa fa-download"></i>
    </button>
    <button
      class="cursor-pointer w-7 bg-slate-800 font-medium text-white hover:bg-transparent"
      @click="() => addReaded(chapter)"
    >
      <i :class="isReaded(chapter) ? 'fa fa-check' : 'fa fa-minus'" />
    </button>
  </div>
</template>
