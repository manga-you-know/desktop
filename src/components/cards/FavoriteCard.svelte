<script lang="ts">
  import { onMount } from "svelte";
  import { Tilt, ScrollingValue } from "svelte-ux";
  import { toast } from "svelte-sonner";
  import { Button, Badge, Label, ContextMenu } from "@/lib/components";
  import {
    ReadFavorite,
    EditFavorite,
    AskDelete,
    Tooltip,
    WatchFavorite,
    PickTags,
    Image,
  } from "@/components";
  import {
    downloadManager,
    globalChapters,
    favoritesLoaded,
    preferableLanguage,
    useMpv,
    theme,
    coversLoaded,
  } from "@/store";
  import { FavoriteDB, MarkFavoriteDB, ReadedDB } from "@/repositories";
  import {
    refreshFavorites,
    isReaded,
    openPlayer,
    addReadedBelow,
    loadFavoriteChapters,
    refreshLibrary,
    copyText,
  } from "@/functions";
  import type { Favorite, Chapter, Readed } from "@/types";
  import { goto } from "$app/navigation";
  import { strNotEmpty } from "@/utils";
  import { cn } from "@/lib/utils";
  import type { MarkFavorites } from "@/types";
  import Icon from "@iconify/svelte";
  import { IS_MOBILE } from "@/constants";

  const { favorite }: { favorite: Favorite } = $props();
  let isOpen = $state(false);
  let isEdit = $state(false);
  let isDelete = $state(false);
  let isContext = $state(false);
  let isPicking = $state(false);
  let isUltraFavorite = $state(favorite.is_ultra_favorite);
  let markeds: MarkFavorites[] = $state([]);
  let nextChaptersImages: string[] = $state([]);
  let favoriteLoad = $derived($favoritesLoaded[strNotEmpty(favorite.id)]);
  let variant: "destructive" | "secondary" | "default" | "outline" | undefined =
    $derived(favoriteLoad.toReadCount > 0 ? "destructive" : "secondary");

  async function updateReaded() {
    favoriteLoad.readeds = await ReadedDB.getReadeds(favorite);
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
        startLoading: () => loadFavoriteChapters(favorite),
        nextChapter: null,
        nextImages: [],
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

  async function gotoNext(e?: Event) {
    e?.stopPropagation();
    globalChapters.set(favoriteLoad.chapters);
    const chapter = favoriteLoad.nextChapter ?? favoriteLoad.chapters[0];
    if (favorite.type === "anime") {
      toast.promise($downloadManager.getEpisodeContent(chapter), {
        loading: `Loading episode ${chapter.number}...`,
        success: `Opening the player...`,
        duration: 10000,
      });
      if ($useMpv) {
        const episode = await $downloadManager.getEpisodeContent(chapter);
        await openPlayer(episode, chapter.title);
        await addReadedBelow(
          chapter,
          $globalChapters.map((c) => {
            c.chapter_id = c.chapter_id.split("<token>")[0];
            return c;
          }),
          favorite
        );
        await loadFavoriteChapters(favorite);
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
  }
  // onMount(async () => {
  //   await getToRead();
  // });
</script>

{#if favorite.type === "anime"}
  <WatchFavorite {favorite} bind:open={isOpen} />
{:else}
  <ReadFavorite {favorite} bind:open={isOpen} />
{/if}
<EditFavorite {favorite} bind:open={isEdit} />
<AskDelete {favorite} bind:open={isDelete} />
<PickTags {favorite} bind:open={isPicking} bind:markeds />
<ContextMenu.Root
  bind:open={isContext}
  onOpenChange={async () => {
    isUltraFavorite = await FavoriteDB.isUltraFavorite(favorite.id);
  }}
>
  <ContextMenu.Trigger>
    <button
      class={cn(
        "group relative rounded-2xl h-[234px] max-h-[234px] w-[158px] max-w-[158px] border-transparent flex flex-col p-1 items-center transition-* duration-200 ease-in-out outline-none bg-gray-400 hover:bg-gray-300 dark:bg-secondary dark:hover:bg-secondary/50 dark:hover:shadow-lg transform focus:bg-slate-400 dark:focus:bg-gray-800 focus:shadow-lg hover:opacity-100 hover:bg-transparent hover:border-1 dark:hover:border-gray-500 no-blurry",
        favoriteLoad.toReadCount > 0 ? "opacity-100" : "opacity-60",
        IS_MOBILE ? "" : "hover:scale-[1.08]",
        isContext && "!scale-[1.15] !border-1 !border-white opacity-100"
      )}
      onclick={() => {
        if (favoriteLoad.nextChapter === null) {
          isOpen = true;
        } else {
          gotoNext();
        }
      }}
      tabindex={favoriteLoad?.toReadCount > 0 ? 0 : -1}
    >
      <Image
        src={$coversLoaded[favorite.cover] ?? favorite.cover}
        alt={favorite.name}
        class="w-[155px] h-[225px] min-w-[155px] max-w-[155px] min-h-[225px] max-h-[225px] object-contain rounded-b-2xl !bg-transparent"
        id={strNotEmpty(favorite.id)}
      />
      <div
        class="w-full h-full fixed rounded-t-[80%] flex flex-col justify-between items-center -m-[5.5px]"
      >
        <!-- <Badge
            class=" w-40 max-w-40 flex justify-center rounded-xl bg-"
            {variant}
          > -->
        <div
          class="h-52 w-[168px] max-w-[168px] flex justify-center from-background bg-gradient-to-b to-50% to-transparent"
        >
          <Label
            class="max-w-[150px] mt-[7px] text-sm truncate opacity-100 text-gray-600 dark:text-white"
          >
            {favorite.name}
          </Label>
        </div>
        <!-- </Badge> -->

        <div
          class={cn(
            "w-full h-full px-[5px] fixed transform transition-all duration-300 ease-in-out group-hover:translate-x-0 flex flex-col justify-end items-start",
            favoriteLoad.toReadCount > 0
              ? "opacity-100 translate-x-0"
              : IS_MOBILE
                ? ""
                : "opacity-0 -translate-x-[15%] group-hover:opacity-100"
          )}
        >
          <Tooltip
            text="{favoriteLoad.chapters.length -
              favoriteLoad.toReadCount}/{favoriteLoad.chapters.length}"
          >
            <Badge
              class={cn(
                "min-w-10 max-w-12 h-10 mb-1 flex justify-center rounded-xl text-center cursor-default",
                favoriteLoad.toReadCount > 0
                  ? "group-hover:ring-2 group-hover:scale-[0.9] ring-white  transition-all duration-500"
                  : ""
              )}
              {variant}
              tabindex={-1}
            >
              {#if favoriteLoad.isLoading}
                <Icon icon="line-md:loading-alt-loop" class="w-5 h-5" />
              {:else if favoriteLoad.toReadCount > 0}
                <Label tabindex={-1}>
                  <ScrollingValue axis="y">
                    +{favoriteLoad.toReadCount ?? 0}
                  </ScrollingValue>
                </Label>
              {:else}
                <Icon icon="mingcute:check-2-fill" class="w-5 h-5" />
              {/if}
            </Badge>
          </Tooltip>
        </div>
        <div
          class={cn(
            "w-full h-full flex fixed items-end justify-center transform transition-all ease-in-out duration-300",
            IS_MOBILE
              ? " "
              : "translate-y-[15%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
          )}
        >
          <Badge
            {variant}
            class="w-14 mb-1 flex justify-center text-xs -px-[0.2px]"
          >
            {`${
              favoriteLoad.chapters.length - favoriteLoad.toReadCount
            }/${favoriteLoad.chapters.length}`}
          </Badge>
        </div>
        <div
          class={cn(
            "w-full h-22 flex flex-col justify-end items-end p-1 transform  transition-all duration-300 ease-in-out",
            IS_MOBILE
              ? ""
              : "translate-x-[10%] opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
          )}
        >
          <div
            class="flex flex-col mr-0.5 justify-end rounded-xl shadow-sm"
            role="group"
          >
            <Button
              class="rounded-b-none rounded-t-2xl"
              size="sm"
              tabindex={-1}
              disabled={favoriteLoad.nextChapter === null}
              onclick={gotoNext}
              {variant}
            >
              <Icon icon="lucide:chevrons-right" class="!size-4" />
            </Button>
            <Button
              class="rounded-none -my-[1px]"
              size="sm"
              tabindex={-1}
              {variant}
              onclick={(e) => {
                e.stopPropagation();
                isOpen = true;
              }}
            >
              <Icon
                icon={favorite.type === "anime"
                  ? "lucide:tv-minimal-play"
                  : "lucide:book-open-text"}
                class="!size-4"
              />
            </Button>
            <Button
              class="rounded-t-none rounded-b-2xl"
              size="sm"
              tabindex={-1}
              onclick={(e: Event) => {
                e.stopPropagation();
                isEdit = true;
              }}
              {variant}
            >
              <Icon icon="lucide:square-pen" class="-mt-[7px] !size-4" />
            </Button>
          </div>
        </div>
      </div>
    </button>
  </ContextMenu.Trigger>
  <ContextMenu.Content>
    <ContextMenu.Item
      class="flex justify-between"
      onclick={async (e: Event) => {
        e.stopPropagation();
        favorite.is_ultra_favorite = !isUltraFavorite;
        isUltraFavorite = favorite.is_ultra_favorite;
        await FavoriteDB.toggleUltraFavorite(favorite);
        await refreshFavorites();
      }}
    >
      <Label>{favorite.is_ultra_favorite ? "Remove" : "Favorite"}</Label>
      <Icon
        class="!size-5 -mr-[2px]"
        icon={isUltraFavorite ? "heroicons:star-solid" : "heroicons:star"}
      />
    </ContextMenu.Item>
    <ContextMenu.Item
      class="flex justify-between"
      onclick={(e: Event) => {
        e.stopPropagation();
        isOpen = true;
      }}
    >
      <Label>Open</Label>
      <Icon
        class="!size-4 !h-5"
        icon={favorite.type === "anime"
          ? "lucide:tv-minimal-play"
          : "lucide:book-open-text"}
      />
    </ContextMenu.Item>
    <ContextMenu.Item
      class="flex justify-between"
      onclick={async (e: Event) => {
        markeds = await MarkFavoriteDB.getMarkFavorites(favorite);
        isPicking = true;
      }}
    >
      <Label>Tags</Label>
      <Icon class="!size-5 -mr-[2px]" icon="lucide:bookmark" />
    </ContextMenu.Item>
    <ContextMenu.Item
      class="flex justify-between"
      onclick={(e: Event) => {
        e.stopPropagation();
        isEdit = true;
      }}
    >
      <Label>Edit</Label>
      <Icon class="!size-4 !h-5" icon="lucide:square-pen" />
    </ContextMenu.Item>
    <ContextMenu.Sub>
      <ContextMenu.SubTrigger class="flex justify-between">
        <Label>Copy</Label>
      </ContextMenu.SubTrigger>
      <ContextMenu.SubContent>
        <ContextMenu.Item
          class="flex justify-between hover:bg-accent"
          onclick={(e) => {
            copyText(favorite.name, "title")
          }}
        >
          <Label>Title</Label>
          <Icon class="!size-4" icon="tabler:text-size"/>
        </ContextMenu.Item>
        <ContextMenu.Item
          class="flex justify-between hover:bg-accent"
          onclick={async (e) => {
            await copyText(favorite.cover, "cover")
          }}
        >
          <Label>
            Cover {favorite.cover.startsWith("http") ? "URL" : "path"}
          </Label>
          <Icon class="!size-4"  icon="tabler:photo"/>
        </ContextMenu.Item>
      </ContextMenu.SubContent>
    </ContextMenu.Sub>
    <ContextMenu.Separator />
    <ContextMenu.Item
      class="flex justify-between hover:!bg-destructive transition-colors duration-300"
      onclick={(e: Event) => {
        e.stopPropagation();
        isDelete = true;
      }}
    >
      <Label>Delete</Label>
      <Icon class="!size-4 !h-5" icon="lucide:trash" />
    </ContextMenu.Item>
  </ContextMenu.Content>
</ContextMenu.Root>
{#each nextChaptersImages as image}
  <img class="hidden" src={image} alt="Prefetched" data-sveltekit-prefetch />
{/each}
