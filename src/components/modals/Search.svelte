<script lang="ts">
  import {
    AlertDialog,
    Button,
    Input,
    Label,
    ScrollArea,
    Separator,
  } from "@/lib/components";
  import { ReadFavorite, Source, WatchFavorite, Image } from "@/components";
  import {
    openSearch,
    downloadManager,
    selectedSource,
    searchTerm,
    rawFavorites,
  } from "@/store";
  import { FavoriteDB } from "@/repositories";
  import {
    refreshLibrary,
    stopDiscordPresence,
    setDiscordActivity,
    refreshRawFavorites,
  } from "@/functions";
  import type { Favorite } from "@/types";
  import { onMount } from "svelte";
  import { cn } from "@/lib/utils";
  import { delay, limitStr } from "@/utils";
  import Icon from "@iconify/svelte";
  import { IsMobile } from "@/lib/hooks";

  let isSearching = $state(false);
  let isResultOpen = $state(false);
  let isFavoriteOpen = $state(false);
  let favoriteOpen: Favorite | null = $state(null);
  let results: Favorite[] = $state([]);

  function isFavorite(favorite: Favorite) {
    return $rawFavorites.find(
      (f) => f.source_id === favorite.source_id && f.source === favorite.source,
    );
  }

  async function search() {
    await delay(5);
    if ($searchTerm.length === 0) {
      results = [];
      isSearching = false;
      return;
    }
    isSearching = true;
    const term = $searchTerm.toLowerCase();
    const source = $selectedSource;
    const getResults = await $downloadManager.search(
      $searchTerm.toLowerCase(),
      $selectedSource,
    );
    if (term === $searchTerm.toLowerCase() && source === $selectedSource) {
      results = getResults;
      isSearching = false;
    }
  }
  selectedSource.subscribe((_) => {
    results = [];
    search();
  });
  async function saveResult(result: Favorite) {
    if (isFavorite(result)) {
      const favorite = await FavoriteDB.getFavoriteBySource(
        result.source_id,
        result.source,
      );
      await FavoriteDB.deleteFavorite(favorite);
    } else {
      await FavoriteDB.createFavorite(result);
    }
    refreshRawFavorites();
    refreshLibrary();
  }

  openSearch.subscribe(async (open) => {
    isResultOpen = false;
    if (open) {
      refreshRawFavorites();
      await new Promise((resolve) => setTimeout(resolve, 50));
      const input = document.querySelector(
        `input[id="search-input"]`,
      ) as HTMLInputElement;
      input?.focus();
      if ($searchTerm.length > 0) search();
      await setDiscordActivity("Searching mangas...");
    } else {
      await stopDiscordPresence();
    }
  });

  const isMobileInstance = new IsMobile();
  const isMobile = $derived(isMobileInstance.current);

  onMount(async () => {
    await refreshRawFavorites();
  });
</script>

{#if favoriteOpen !== null}
  {#if favoriteOpen?.type === "anime"}
    <WatchFavorite favorite={favoriteOpen} bind:open={isFavoriteOpen} />
  {:else}
    <ReadFavorite favorite={favoriteOpen} bind:open={isFavoriteOpen} />
  {/if}
{/if}

<AlertDialog.Root bind:open={$openSearch}>
  <AlertDialog.Content
    overlayClass="bg-black/40"
    class={cn(
      "overflow-hidden p-0 gap-0 !bg-background/65 border-0.5",
      isMobile ? "h-[36rem] w-[26rem]" : "h-[16.2rem] w-[30.5rem]",
    )}
  >
    <div
      class={cn(
        "w-full absolute transition-all duration-500 ease-in-out",
        isResultOpen ? "-translate-x-full" : "translate-x-0'",
      )}
    >
      <AlertDialog.Header class="bg-accent border-secondary border-1">
        <div class="flex w-full items-center ml-3 my-1">
          <div class="size-5 mr-2">
            <Icon
              icon={isSearching
                ? "eos-icons:bubble-loading"
                : $searchTerm.length > 0
                  ? "lucide:x"
                  : "mingcute:search-2-fill"}
              class={cn(
                "!size-[1.2rem]",
                $searchTerm.length > 0 && !isSearching && "cursor-pointer",
              )}
              color="gray"
              onclick={() => {
                if ($searchTerm.length > 0 && !isSearching) {
                  $searchTerm = "";
                  results = [];
                }
              }}
            />
          </div>
          <Input
            class={cn("text-sm font-medium", isMobile && "w-[7.5rem]")}
            id="search-input"
            variant="link"
            autofocus
            bind:value={$searchTerm}
            placeholder="Search..."
            floatingLabel
            oninput={search}
          />
          <Source />
        </div>
      </AlertDialog.Header>
      <Separator />
      <div
        class={cn(
          "bg-secondary/50 py-1 pl-1  flex gap-2 rounded-b-3xl ",
          isMobile ? "w-[26rem] h-[33rem]" : "w-[30.5rem] h-52",
        )}
      >
        {#if results.length !== 0}
          <ScrollArea class="w-[30rem] rounded-xl !scrollbar">
            {#each results.slice(0, 20) as result}
              <div class="inline-flex w-[98%]">
                <Button
                  class="w-full flex justify-start rounded-r-none transition-colors duration-500"
                  variant="ghost"
                  onclick={() => {
                    favoriteOpen = null;
                    isResultOpen = true;
                    favoriteOpen = result;
                  }}
                >
                  <span class="ml-2 truncate"
                    >{limitStr(result.name, isMobile ? 45 : 50)}</span
                  >
                </Button>
                <Button
                  onclick={async () => saveResult(result)}
                  class="rounded-l-none transition-colors duration-500"
                  variant="ghost"
                >
                  <Icon
                    class="!size-4"
                    icon={isFavorite(result)
                      ? "tabler:bookmark-filled"
                      : "tabler:bookmark"}
                  />
                </Button>
              </div>
              <img
                class="hidden"
                src={result.cover}
                alt="Prefetched"
                data-sveltekit-prefetch
              />
            {/each}
          </ScrollArea>
        {:else}
          <div class="flex h-full w-full justify-center items-center">
            <Icon icon="lucide:error" class="w-5 h-5" color="gray" />
            <span class="text-sm text-gray-500 select-none"
              >{$searchTerm.length === 0
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
        "flex justify-between w-full h-full bg-gray-200 dark:bg-secondary/50 p-2 absolute transition-all duration-500 ease-in-out ",
        isResultOpen ? "translate-x-0" : "translate-x-full",
      )}
    >
      <Button
        class="bg-background/60 border-0.5"
        variant="outline"
        onclick={() => (isResultOpen = false)}
      >
        <Icon icon="ion:caret-back" />
      </Button>
      <div class="flex w-full px-2 justify-between select-none">
        <Image
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
          <div class="inline-flex">
            <Button
              class="w-[110px] flex justify-between text-xs rounded-r-none"
              variant="secondary"
              onclick={async () =>
                favoriteOpen ? saveResult(favoriteOpen) : ""}
            >
              <div class="flex justify-center w-full">
                {favoriteOpen
                  ? isFavorite(favoriteOpen)
                    ? "Remove"
                    : "Save"
                  : ""}
              </div>
              <Icon
                class="!size-5"
                icon={favoriteOpen
                  ? isFavorite(favoriteOpen)
                    ? "tabler:bookmark-filled"
                    : "tabler:bookmark"
                  : "lucide:trash"}
              />
            </Button>
            <Button
              class="bg-background/60 border-0.5 rounded-l-none items-center"
              variant="outline"
              onclick={() => {
                if (favoriteOpen !== null) {
                  favoriteOpen = isFavorite(favoriteOpen) ?? favoriteOpen;
                }
                isFavoriteOpen = true;
              }}
              disabled={!(favoriteOpen ? isFavorite(favoriteOpen) : false)}
            >
              <Icon
                class="!size-5"
                icon={favoriteOpen?.type === "anime"
                  ? "lucide:tv-minimal-play"
                  : "lucide:book-open-text"}
              />
              Open
            </Button>
          </div>
        </div>
      </div>
    </div>
  </AlertDialog.Content>
</AlertDialog.Root>
