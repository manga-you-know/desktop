<script lang="ts">
  import {
    AlertDialog,
    Button,
    Input,
    Label,
    ScrollArea,
    Separator,
  } from "@/lib/components";
  import { Source } from "@/components";
  import { openSearch, downloadManager, selectedSource } from "@/store";
  import { FavoriteRepository } from "@/repositories";
  import {
    refreshLibrary,
    stopDiscordPresence,
    setDiscordActivity,
  } from "@/functions";
  import type { Favorite } from "@/interfaces";
  import { onMount } from "svelte";
  import { cn } from "@/lib/utils";
  import Icon from "@iconify/svelte";

  let isSearching = $state(false);
  let isFavoriteOpen = $state(false);
  let favoriteOpen: Favorite | null = $state(null);
  let searchTerm = $state("");
  let results: Favorite[] = $state([]);
  let rawFavorites: Favorite[] = $state([]);

  function isFavorite(favorite: Favorite) {
    return rawFavorites.find(
      (f) => f.source_id === favorite.source_id && f.source === favorite.source
    );
  }
  async function refreshRawFavorites() {
    rawFavorites = await FavoriteRepository.getRawFavorites();
  }
  async function search() {
    await new Promise((resolve) => setTimeout(resolve, 5));
    if (searchTerm.length === 0) {
      results = [];
      isSearching = false;
      return;
    }
    isSearching = true;
    results = await $downloadManager.search(searchTerm, $selectedSource);
    isSearching = false;
  }
  selectedSource.subscribe((_) => {
    results = [];
    search();
  });
  async function saveResult(result: Favorite) {
    if (isFavorite(result)) {
      const favorite = await FavoriteRepository.getFavoriteBySource(
        result.source_id,
        result.source
      );
      await FavoriteRepository.deleteFavorite(favorite);
    } else {
      await FavoriteRepository.createFavorite(result);
    }
    await refreshRawFavorites();
    await refreshLibrary();
  }
  openSearch.subscribe(async (open) => {
    searchTerm = "";
    results = [];
    if (open) {
      await setDiscordActivity("Searching mangas...");
    } else {
      await stopDiscordPresence();
    }
  });
  onMount(async () => {
    await refreshRawFavorites();
  });
</script>

<AlertDialog.Root bind:open={$openSearch}>
  <AlertDialog.Content class="overflow-hidden h-[16rem] w-[30rem]  p-0 gap-0">
    <div
      class={cn(
        "w-full absolute transition-all duration-500 ease-in-out",
        isFavoriteOpen ? "-translate-x-full" : "translate-x-0'"
      )}
    >
      <AlertDialog.Header>
        <div class="flex w-full items-center ml-3 my-1">
          <div class="w-5 h-5 mr-2">
            <Icon
              icon={isSearching
                ? "eos-icons:bubble-loading"
                : "mingcute:search-2-fill"}
              class="!w-[1.2rem] !h-[1.2rem]"
              color="gray"
            />
          </div>
          <Input
            variant="link"
            autofocus
            bind:value={searchTerm}
            placeholder="Search..."
            floatingLabel
            oninput={search}
          />
          <Source />
        </div>
      </AlertDialog.Header>
      <Separator />
      <div
        class="w-[30rem] bg-gray-200 dark:bg-gray-900 pt-1 pl-1 h-52 flex gap-2 rounded-b-xl"
      >
        {#if results.length !== 0}
          <ScrollArea class="w-[30rem]">
            {#each results.slice(0, 20) as result}
              <div class="inline-flex w-[98%]">
                <Button
                  class="w-full flex justify-start rounded-r-none"
                  variant="ghost"
                  onclick={() => {
                    favoriteOpen = null;
                    isFavoriteOpen = true;
                    favoriteOpen = result;
                  }}
                >
                  <span class="ml-2 truncate">{result.name}</span>
                </Button>
                <Button
                  onclick={async () => saveResult(result)}
                  class="rounded-l-none"
                  variant="ghost"
                >
                  <Icon
                    icon={isFavorite(result)
                      ? "tabler:bookmark-filled"
                      : "tabler:bookmark"}
                  />
                </Button>
              </div>
            {/each}
          </ScrollArea>
        {:else}
          <div class="flex h-full w-full justify-center items-center">
            <Icon icon="lucide:error" class="w-5 h-5" color="gray" />
            <span class="text-sm text-gray-500 select-none"
              >{searchTerm.length === 0
                ? "Type anything..."
                : isSearching
                  ? "Searching..."
                  : "No results found."}</span
            >
          </div>
        {/if}
      </div>

      <AlertDialog.Footer></AlertDialog.Footer>
    </div>
    <div
      class={cn(
        "flex justify-between w-full h-full bg-gray-200 dark:bg-gray-900 p-2 absolute transition-all duration-500 ease-in-out",
        isFavoriteOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <Button variant="outline" onclick={() => (isFavoriteOpen = false)}>
        <Icon icon="ion:caret-back" />
      </Button>
      <div class="flex w-full px-2 justify-between select-none">
        <img
          class="max-w-[170px] object-contain rounded-xl"
          src={favoriteOpen?.cover ?? "/myk.png"}
          alt="Result cover"
        />
        <div class="flex w-full flex-col items-center justify-between">
          <Label class="dark:text-white text-clip text-gray-500 p-2 pr-2">
            {favoriteOpen?.name}
          </Label>
          <div class="flex flex-col max-h-52 justify-center items-center px-3">
            <Label
              class="text-xs text-ellipsis dark:text-gray-300 text-gray-800"
            >
              {favoriteOpen?.extra_name}
            </Label>
            <p
              class="text-[10px] text-ellipsis max-h-[88px] overflow-hidden max-w-52 dark:text-white text-gray-500"
            >
              {favoriteOpen?.description}
            </p>
          </div>
          <Button
            class="w-[110px] flex justify-between text-xs"
            onclick={async () => (favoriteOpen ? saveResult(favoriteOpen) : "")}
          >
            <div class="flex justify-center w-full">
              {favoriteOpen
                ? isFavorite(favoriteOpen)
                  ? "Remove"
                  : "Save"
                : ""}
            </div>
            <Icon
              class="!w-5 !h-5"
              icon={favoriteOpen
                ? isFavorite(favoriteOpen)
                  ? "tabler:bookmark-filled"
                  : "tabler:bookmark"
                : "lucide:trash"}
            />
          </Button>
        </div>
      </div>
    </div>
  </AlertDialog.Content>
</AlertDialog.Root>
