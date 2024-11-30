<script lang="ts" setup>
  import type { Favorite, Chapter, Readed } from "~/models";
  defineProps<{
    favorite: Favorite;
    chapter: Chapter;
    chapters: Chapter[];
    readeds: Readed[];
    addReaded: (chapter: Chapter) => void;
    isReaded: (chapter: Chapter) => Readed | undefined;
  }>();
</script>
<template>
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
  />
  <div
    class="inline-flex -space-x-px overflow-hidden rounded-md border border-gray-500 bg-slate-700 shadow-sm"
  >
    <button
      class="w-28 p-0.5 flex justify-start bg-slate-800 font-medium text-white hover:bg-transparent"
      @click="
        () => navigateTo(`/reader/${favorite.id}/${chapters.indexOf(chapter)}`)
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
      <i :class="isReaded(chapter) ? 'fa fa-check' : 'fa fa-minus'" />
    </button>
  </div>
</template>
