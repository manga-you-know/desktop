<script lang="ts">
  import { onMount } from "svelte";
  import Icon from "@iconify/svelte";
  import { toast } from "svelte-sonner";
  import { Button, Badge, Label } from "@/lib/components";
  import {
    ReadFavorite,
    EditFavorite,
    AskDelete,
    Tooltip,
    WatchFavorite,
  } from "@/components";
  import {
    downloadManager,
    globalChapters,
    favoritesLoaded,
    preferableLanguage,
    showOnlyNew,
    useMpv,
    theme,
  } from "@/store";
  import { FavoriteRepository, ReadedRepository } from "@/repositories";
  import { ContextMenu } from "@/lib/components";
  import {
    refreshFavorites,
    isReaded,
    openPlayer,
    addReadedBelow,
    loadFavoriteChapter,
  } from "@/functions";
  import type { Favorite, Chapter, Readed } from "@/interfaces";
  import { goto } from "$app/navigation";
  import { strNotEmpty } from "@/utils";
  import { twMerge } from "tailwind-merge";

  const { favorite }: { favorite: Favorite } = $props();
  let isOpen = $state(false);
  let isEdit = $state(false);
  let isDelete = $state(false);
  let isUltraFavorite = $state(favorite.is_ultra_favorite);
  let nextChaptersImages: string[] = $state([]);
  let favoriteLoad = $derived($favoritesLoaded[strNotEmpty(favorite.id)]);
  let variant: "destructive" | "secondary" | "default" | "outline" | undefined =
    $derived(favoriteLoad.toReadCount > 0 ? "destructive" : "secondary");

  async function updateReaded() {
    favoriteLoad.readeds = await ReadedRepository.getReadeds(favorite);
  }

  $effect.pre(() => {
    if (favoriteLoad) {
    } else {
      $favoritesLoaded[strNotEmpty(favorite.id)] = {
        isLoaded: false,
        isLoading: false,
        chapters: [],
        readeds: [],
        toReadCount: 0,
        startLoading: () => loadFavoriteChapter(favorite),
        nextChapter: null,
      };
    }
    if (!favoriteLoad.isLoaded && !favoriteLoad.isLoading) {
      favoriteLoad.startLoading();
    }
    updateReaded();
    preloadChapter();
  });
  async function preloadChapter(): Promise<void> {
    if (favorite.type === "anime") return;
    while (!favoriteLoad.isLoaded) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const chapter = favoriteLoad.nextChapter;
    if (chapter) {
      nextChaptersImages = await $downloadManager.getChapterImages(chapter);
    }
  }
  // onMount(async () => {
  //   await getToRead();
  // });
</script>

{#if favoriteLoad?.toReadCount > 0 || !$showOnlyNew}
  {#if favorite.type === "anime"}
    <WatchFavorite {favorite} bind:open={isOpen} />
  {:else}
    <ReadFavorite {favorite} bind:open={isOpen} />
  {/if}
  <EditFavorite {favorite} bind:open={isEdit} />
  <AskDelete {favorite} bind:open={isDelete} />
  <ContextMenu.Root
    onOpenChange={() => {
      isUltraFavorite = favorite.is_ultra_favorite;
    }}
  >
    <ContextMenu.Trigger>
      <button
        class={`group relative rounded-xl h-[234px] max-h-[234px] w-[158px] max-w-[158px] border-transparent flex flex-col p-1 items-center transition-* duration-200 ease-in-out  outline-none bg-gray-400 hover:bg-gray-300 dark:bg-gray-900 dark:hover:bg-gray-800 dark:hover:shadow-lg hover:z-30 transform hover:scale-[1.08] focus:bg-slate-400 dark:focus:bg-gray-800 focus:shadow-lg hover:opacity-100 hover:bg-transparent hover:border-1 dark:hover:border-gray-500 ${favoriteLoad.toReadCount > 0 ? "opacity-100 " : "opacity-60"}`}
        onclick={() => (isOpen = true)}
        tabindex={favoriteLoad?.toReadCount > 0 ? 0 : -1}
      >
        <img
          src={favorite.cover}
          alt={favorite.name}
          class="w-[155px] h-[225px] min-w-[155px] max-w-[155px] min-h-[225px] max-h-[225px] object-contain rounded-b-xl !bg-transparent"
          id={strNotEmpty(favorite.id)}
          onerror={() => {
            const coverElement = document.getElementById(
              strNotEmpty(favorite.id)
            );
            if (coverElement instanceof HTMLImageElement) {
              coverElement.src = "/myk.png";
            }
          }}
        />
        <div
          class="w-full h-full fixed rounded-t-[80%] flex flex-col justify-between items-center m-[-5.5px]"
        >
          <!-- <Badge
            class=" w-40 max-w-40 flex justify-center rounded-xl bg-"
            {variant}
          > -->
          <div
            class="h-52 w-[168px] max-w-[168px] flex justify-center from-slate-400 dark:from-black bg-gradient-to-b to-50% to-transparent"
          >
            <Label
              class="max-w-[150px] mt-[7px] text-sm truncate opacity-100 text-white"
            >
              {favorite.name}
            </Label>
          </div>
          <!-- </Badge> -->

          <div
            class={`w-full h-full px-[5px] fixed transform transition-all duration-300 ease-in-out group-hover:translate-x-0 flex flex-col justify-end items-start ${favoriteLoad.toReadCount > 0 ? "opacity-100 translate-x-0 " : "opacity-0 translate-x-[-40%]"} group-hover:opacity-100`}
          >
            <Tooltip
              text={`${favoriteLoad.chapters.length - favoriteLoad.toReadCount}/${favoriteLoad.chapters.length}`}
            >
              <div
                class={`${favoriteLoad.toReadCount > 0 ? "transition-all duration-500 group-hover:rotate-[720deg]" : ""}`}
                role="group"
              >
                <Badge
                  class="min-w-10 max-w-12 h-10 mb-1 flex justify-center rounded-xl text-center cursor-default"
                  {variant}
                  tabindex={-1}
                >
                  {#if favoriteLoad.isLoading}
                    <Icon icon="line-md:loading-twotone-loop" class="w-5 h-5" />
                  {:else if favoriteLoad.toReadCount > 0}
                    <Label tabindex={-1}>+{favoriteLoad.toReadCount}</Label>
                  {:else}
                    <Icon icon="mingcute:check-2-fill" class="w-5 h-5" />
                  {/if}
                </Badge>
              </div>
            </Tooltip>
          </div>
          <div
            class="w-full h-full flex fixed items-end justify-center transform transition-all ease-in-out translate-y-[20%] opacity-0 duration-300 group-hover:translate-y-0 group-hover:opacity-100"
          >
            <Badge
              {variant}
              class="w-14 mb-1 flex justify-center text-xs px-[-0.2px] rounded-md"
            >
              {`${
                favoriteLoad.chapters.length - favoriteLoad.toReadCount
              }/${favoriteLoad.chapters.length}`}
            </Badge>
          </div>
          <div
            class="w-full h-22 flex flex-col justify-end items-end p-1 transform translate-x-[40%] opacity-0 transition-all duration-300 ease-in-out group-hover:translate-x-0 group-hover:opacity-100"
          >
            <div
              class="flex flex-col mr-0.5 justify-end rounded-xl shadow-sm"
              role="group"
            >
              <Button
                class={`rounded-b-none rounded-t-xl `}
                size="sm"
                tabindex={-1}
                disabled={favoriteLoad.nextChapter === null}
                onclick={async (e: Event) => {
                  e.stopPropagation();
                  globalChapters.set(favoriteLoad.chapters);
                  const chapter =
                    favoriteLoad.nextChapter ?? favoriteLoad.chapters[0];
                  if (favorite.type === "anime") {
                    toast.promise($downloadManager.getEpisodeContent(chapter), {
                      loading: `Loading episode ${chapter.number}...`,
                      success: `Opening the player...`,
                      duration: 10000,
                    });
                    if ($useMpv) {
                      const episode =
                        await $downloadManager.getEpisodeContent(chapter);
                      await openPlayer(episode, chapter.title);
                      await addReadedBelow(chapter, $globalChapters, favorite);
                      await loadFavoriteChapter(favorite);
                    } else {
                      goto(`/player/${favorite.id}/${chapter.number}`);
                    }
                  } else {
                    toast.promise($downloadManager.getChapterImages(chapter), {
                      loading: `Requesting chapter images...`,
                      duration: 10000,
                    });
                    globalChapters.set(favoriteLoad.chapters);
                    goto(
                      `/reader/${favorite.id}/${$globalChapters.indexOf(
                        favoriteLoad.nextChapter ?? favoriteLoad.chapters[0]
                      )}`
                    );
                  }
                }}
                {variant}
              >
                <Icon icon="lucide:chevrons-right" class="w-4 h-4" />
              </Button>
              <Button
                class="rounded-none my-[-1px]"
                size="sm"
                tabindex={-1}
                {variant}
              >
                <Icon
                  icon={favorite.type === "anime"
                    ? "lucide:tv-minimal-play"
                    : "lucide:book-open-text"}
                  class="w-4 h-4"
                />
              </Button>
              <Button
                class="rounded-t-none rounded-b-xl"
                size="sm"
                tabindex={-1}
                onclick={(e: Event) => {
                  e.stopPropagation();
                  isEdit = true;
                }}
                {variant}
              >
                <Icon icon="lucide:square-pen" class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </button>
    </ContextMenu.Trigger>
    <ContextMenu.Content
      class={twMerge(
        "!w-14 m-0 dark:bg-black",
        $theme === "dark" ? "dark" : ""
      )}
    >
      <ContextMenu.Item class="gap-4"
        ><Icon
          icon={favorite.type === "anime"
            ? "lucide:tv-minimal-play"
            : "lucide:book-open-text"}
        />
        <Label>Open</Label>
      </ContextMenu.Item>
      <ContextMenu.Item
        class="gap-4"
        onclick={(e: Event) => {
          e.stopPropagation();
          isEdit = true;
        }}
        ><Icon icon="lucide:square-pen" />
        <Label>Edit</Label>
      </ContextMenu.Item>
      <ContextMenu.Item
        class="gap-4"
        onclick={async (e: Event) => {
          e.stopPropagation();
          favorite.is_ultra_favorite = !isUltraFavorite;
          isUltraFavorite = favorite.is_ultra_favorite;
          await FavoriteRepository.setUltraFavorite(favorite);
          await refreshFavorites();
        }}
        ><Icon
          icon={isUltraFavorite ? "heroicons:star-solid" : "heroicons:star"}
        />
        <Label>{favorite.is_ultra_favorite ? "Remove" : "Favorite"}</Label>
      </ContextMenu.Item>
      <ContextMenu.Separator />
      <ContextMenu.Item
        class="gap-4"
        onclick={(e: Event) => {
          e.stopPropagation();
          isDelete = true;
        }}
        ><Icon icon="lucide:circle-x" />
        <Label>Delete</Label>
      </ContextMenu.Item>
    </ContextMenu.Content>
  </ContextMenu.Root>
{/if}
{#each nextChaptersImages as image}
  <img class="hidden" src={image} alt="Prefetched" data-sveltekit-prefetch />
{/each}
