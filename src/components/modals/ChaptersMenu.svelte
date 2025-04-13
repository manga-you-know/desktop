<script lang="ts">
  import {
    loadFavoriteChapter,
    saveSettings,
    stopDiscordPresence,
    setFullscreen,
  } from "@/functions";
  import type { Chapter, Favorite } from "@/interfaces";
  import { Button, Checkbox, Label, Sheet, Switch } from "@/lib/components";
  import { openMenuChapters, globalChapters, lastPage } from "@/store";
  import Icon from "@iconify/svelte";

  interface Props {
    favorite?: Favorite;
    currentlyChapter?: Chapter;
    goHome: VoidFunction;
    gotoPage: (page: string) => void;
    handleGoChapter: (way: "next" | "prev") => void;
  }

  let { favorite, currentlyChapter, goHome, gotoPage, handleGoChapter }: Props =
    $props();
  let closeOnChange = $state(true);
</script>

<Sheet.Root bind:open={$openMenuChapters}>
  <Sheet.Content class="max-h-svh">
    <Sheet.Header class="mb-2">
      <Sheet.Title>{favorite?.name}</Sheet.Title>
      <div class="flex gap-2">
        <Button variant="outline" onclick={goHome}>
          <Icon icon="lucide:home" />
        </Button>
        <Button
          variant="outline"
          onclick={() => {
            if (closeOnChange) openMenuChapters.set(false);
            handleGoChapter("prev");
          }}
        >
          <Icon icon="lucide:arrow-left" />
        </Button>
        <Button
          variant="outline"
          onclick={() => {
            if (closeOnChange) openMenuChapters.set(false);
            handleGoChapter("next");
          }}
        >
          <Icon icon="lucide:arrow-right" />
        </Button>
        <div class="flex items-center">
          <Switch
            id="close-on-change"
            bind:checked={closeOnChange}
            class="flex-shrink-0 mr-2"
          />
          <Label class="dark:text-white" for="close-on-change"
            >Close on change</Label
          >
        </div>
      </div>
    </Sheet.Header>
    <div
      class="max-h-[calc(100vh-8rem)] w-full overflow-y-auto mb-5 pb-1 flex flex-col rounded-md border"
    >
      {#each $globalChapters as chapter, i}
        <Button
          class="w-full flex justify-between {currentlyChapter?.chapter_id ===
          chapter.chapter_id
            ? 'bg-slate-800'
            : ''}"
          variant="ghost"
          onclick={() => {
            if (closeOnChange) openMenuChapters.set(false);
            gotoPage(`/reader/${favorite?.id}/${i}`);
          }}
        >
          <span class="pl-5">
            {chapter.number}
          </span>
          <span class="text-sm text-gray-500 truncate">
            {chapter?.title ?? "No title given"}
          </span>
        </Button>
      {/each}
    </div>
    <Sheet.Footer></Sheet.Footer>
  </Sheet.Content>
</Sheet.Root>
