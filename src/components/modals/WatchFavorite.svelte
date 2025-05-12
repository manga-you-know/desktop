<script lang="ts">
  import {
    exists,
    readDir,
    BaseDirectory,
    type DirEntry,
  } from "@tauri-apps/plugin-fs";
  import type { Favorite, Episode } from "@/types";
  import { downloadManager, globalChapters, readeds } from "@/store";
  import { EpisodeButton } from "@/components";
  import {
    isReaded,
    loadFavoriteChapter,
    refreshReadeds,
    stopDiscordPresence,
    setDiscordActivity,
  } from "@/functions";
  import { Dialog } from "@/lib/components";
  import Icon from "@iconify/svelte";

  interface Props {
    favorite: Favorite;
    open: boolean;
  }

  interface Event {
    stopPropagation: () => void;
  }

  let isFetching = $state(false);
  let isWatching = $state(false);
  let downloaded: DirEntry[] = $state([]);
  let { favorite, open = $bindable(false) }: Props = $props();

  async function refreshDownloadeds() {
    const path = `Animes/${favorite.folder_name}`;
    if (await exists(path, { baseDir: BaseDirectory.Download })) {
      downloaded = await readDir(path, {
        baseDir: BaseDirectory.Download,
      });
    }
  }

  $effect(() => {
    if (open) {
      isFetching = true;
      setDiscordActivity("Selecting a episode:", favorite.name);
      (async () => {
        globalChapters.set([]);
        await new Promise((resolve) => setTimeout(resolve, 10));
        await refreshDownloadeds();
        globalChapters.set(await $downloadManager.getEpisodes(favorite));
        await refreshReadeds(favorite);
        isFetching = false;
      })();
    } else {
      stopDiscordPresence();
    }
  });
</script>

<Dialog.Root
  bind:open
  onOpenChange={async (open) => {
    globalChapters.set([]);
    if (!open) {
      await loadFavoriteChapter(favorite);
    }
  }}
>
  <Dialog.Content class="flex justify-center">
    <Dialog.Header>
      <Dialog.Title class="w-full flex justify-center"
        >{favorite.name.length > 40
          ? favorite.name.substring(0, 40) + "..."
          : favorite.name}
      </Dialog.Title>
      <!-- <Dialog.Description
        >Change your favorites attributes and save it.</Dialog.Description
      > -->
      {#if isWatching || isFetching}
        <div class="flex h-44 w-44 justify-center items-center">
          <Icon icon="line-md:loading-twotone-loop" class="w-8 h-8" />
        </div>
      {:else}
        <div class="max-h-64 max-w-96 flex flex-wrap overflow-x-hidden gap-2">
          {#each $globalChapters as chapter}
            <EpisodeButton {favorite} {chapter} bind:isWatching />
          {/each}
        </div>
      {/if}
    </Dialog.Header>
  </Dialog.Content>
</Dialog.Root>
