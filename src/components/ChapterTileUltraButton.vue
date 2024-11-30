<script lang="ts" setup>
  import type { Favorite, Chapter } from "~/models";
  const globalChapters = useState<Chapter[]>("chapters");
  defineProps<{
    favorite: Favorite;
    chapter: Chapter;
    chapters: Chapter[];
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
      class="w-40 p-0.5 flex justify-start pl-2 bg-slate-900 font-medium text-white hover:bg-transparent"
      @click="
        () => {
          globalChapters = chapters;
          navigateTo(`/reader/${favorite.id}/${chapters.indexOf(chapter)}`);
        }
      "
    >
      {{ chapter.number }}
    </button>
    <button
      class="w-7 bg-slate-900 font-medium text-white hover:bg-transparent"
      @click="console.log('nada')"
    >
      <i class="fa fa-download"></i>
    </button>
  </div>
</template>
