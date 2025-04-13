<script lang="ts">
  import {
    AlertDialog,
    Button,
    Input,
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
  import Icon from "@iconify/svelte";
  import type { Favorite } from "@/interfaces";
  import { onMount } from "svelte";

  let isSearching = $state(false);
  let searchTerm = $state("");
  let results: Favorite[] = $state([]);
  let favorites: Favorite[] = $state([]);

  function isFavorite(favorite: Favorite) {
    return favorites.find(
      (f) => f.source_id === favorite.source_id && f.source === favorite.source
    );
  }
  async function refreshFavorites() {
    favorites = await FavoriteRepository.getRawFavorites();
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
    await refreshFavorites();
  });
</script>

<AlertDialog.Root bind:open={$openSearch}>
  <AlertDialog.Content class="w-[30rem] max-h-[23rem] p-0 gap-0">
    <AlertDialog.Header>
      <div class="flex items-center ml-3 my-1">
        <div class="w-5 h-5 mr-2">
          <Icon
            icon={isSearching
              ? "line-md:loading-twotone-loop"
              : "mingcute:search-line"}
            class="!w-[1.2rem] !h-[1.2rem]"
            color="gray"
          />
        </div>
        <Input
          variant="link"
          autofocus
          bind:value={searchTerm}
          placeholder="Search..."
          oninput={search}
        />
        <Source />
        <Button
          variant="link"
          size="sm"
          onclick={() => {
            $openSearch = false;
          }}
        >
          <Icon icon="lucide:x" color="gray" />
        </Button>
      </div>
    </AlertDialog.Header>
    <Separator />
    <div class="w-[30rem] pt-1 pl-1 h-52 flex gap-2">
      {#if results.length !== 0}
        <ScrollArea class="w-[30rem]">
          {#each results.slice(0, 20) as result}
            <Button
              class="w-[98%] flex justify-between"
              variant="ghost"
              onclick={async () => {
                if (isFavorite(result)) {
                  const favorite = await FavoriteRepository.getFavoriteBySource(
                    result.source_id,
                    result.source
                  );
                  await FavoriteRepository.deleteFavorite(favorite);
                  await refreshFavorites();
                  await refreshLibrary();
                  return;
                }
                await FavoriteRepository.createFavorite(result);
                await refreshFavorites();
                await refreshLibrary();
              }}
            >
              <span class="ml-2 truncate">{result.name}</span>
              <Icon
                icon={isFavorite(result)
                  ? "heroicons:star-solid"
                  : "heroicons:star"}
              />
            </Button>
          {/each}
        </ScrollArea>
      {:else}
        <div class="flex h-full w-full justify-center items-center">
          <Icon icon="lucide:error" class="w-5 h-5" color="gray" />
          <span class="text-sm text-gray-500"
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
  </AlertDialog.Content>
</AlertDialog.Root>
