<script lang="ts">
  import { page } from "$app/state";
  import { register, unregister } from "@tauri-apps/plugin-global-shortcut";
  import { invoke } from "@tauri-apps/api/core";
  import { FavoriteRepository, ReadedRepository } from "@/repositories";
  import {
    addReadedBelow,
    loadFavoriteChapter,
    setFullscreen,
    toggleFullscreen,
  } from "@/functions";
  import type { Favorite, Chapter } from "@/interfaces";
  import { Button, Badge, HoverCard, Tooltip } from "@/lib/components";
  import {
    downloadManager,
    globalChapters,
    readeds,
    autoEnterFullscreen,
    defaultPage,
    isFullscreen,
  } from "@/store";
  import Icon from "@iconify/svelte";
  import { goto, onNavigate, afterNavigate } from "$app/navigation";
  import { onMount } from "svelte";

  let { favoriteId, chapterIndex } = page.params;
  let chapter = $state($globalChapters[Number(chapterIndex)]);
  let favorite: Favorite | null = $state(null);
  let images: string[] = $state([]);
  let currentlyCount = $state(1);
  let totalPage = $state(0);
  let isTheLastChapter = $state(Number(chapterIndex) === 0);
  let isTheFirstChapter = $state(
    Number(chapterIndex) === $globalChapters.length - 1
  );
  let currentlyImage = $state("/myk.png");
  afterNavigate(async () => {
    favoriteId = page.params.favoriteId;
    chapterIndex = page.params.chapterIndex;
    isTheFirstChapter = Number(chapterIndex) === $globalChapters.length - 1;
    isTheLastChapter = Number(chapterIndex) === 0;
    chapter = $globalChapters[Number(chapterIndex)];
    const chaptersImages = await $downloadManager.getChapterImages(chapter);
    images = chaptersImages;
    currentlyImage = chaptersImages[0];
    totalPage = chaptersImages.length;
    favorite = await FavoriteRepository.getFavorite(Number(favoriteId));
    await addReadedBelow(chapter, $globalChapters, favorite, $readeds, true);
    const newReadeds = await ReadedRepository.getReadeds(favorite);
    readeds.set(newReadeds);
  });
  function prevPage() {
    if (currentlyCount === 1) return;
    currentlyCount--;
    currentlyImage = images[currentlyCount - 1];
  }
  function nextPage() {
    if (currentlyCount === totalPage) return;
    currentlyCount++;
    currentlyImage = images[currentlyCount - 1];
  }
  async function handleGoChapter(way: "next" | "prev") {
    currentlyImage = "/myk.png";
    currentlyCount = 1;
    totalPage = 1;
    if (way === "next") {
      await goto(`/reader/${favoriteId}/${Number(chapterIndex) - 1}`);
    } else {
      await goto(`/reader/${favoriteId}/${Number(chapterIndex) + 1}`);
    }
  }
  onMount(async () => {
    if ($autoEnterFullscreen) {
      await setFullscreen(true);
    }
    favorite = await FavoriteRepository.getFavorite(Number(favoriteId));
    const chapterImages = await $downloadManager.getChapterImages(chapter);
    images = chapterImages;
    currentlyImage = images[0];
    totalPage = images.length;
    await addReadedBelow(chapter, $globalChapters, favorite, $readeds, true);
    const newReadeds = await ReadedRepository.getReadeds(favorite);
    readeds.set(newReadeds);
    // await register("ARROWLEFT", async (e) => {
    //   if (e.state === "Pressed") {
    //     prevPage();
    //   }
    // });
    // await register("ARROWRIGHT", async (e) => {
    //   if (e.state === "Pressed") {
    //     nextPage();
    //   }
    // });
    // create a listener for the "keydown" event
  });
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "ArrowLeft") {
      prevPage();
    }
    if (event.key === "ArrowRight") {
      nextPage();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />
<div
  class="fixed w-screen h-screen z-50 pointer-events-none flex justify-end items-center"
>
  {#if currentlyCount === totalPage && !isTheLastChapter}
    <Button class="pointer-events-auto" onclick={() => handleGoChapter("next")}>
      <Icon icon="lucide:arrow-right" /></Button
    >
  {/if}
</div>
<div class="fixed w-screen h-screen flex">
  <button
    aria-label="Previous"
    class="w-[50%] cursor-default outline-none border-none"
    tabindex="-1"
    onclick={prevPage}
  ></button>
  <button
    aria-label="Next"
    class="w-[50%] cursor-default outline-none border-none"
    tabindex="-1"
    onclick={nextPage}
  ></button>
</div>
<div
  class="fixed w-screen gap-1 p-[1%] flex flex-col justify-end items-end pointer-events-none"
>
  <div class="flex gap-1 z-30">
    <Badge class="rounded-md m-1" color="neutral" variant="outline"
      >{currentlyCount} / {totalPage}
    </Badge>
    <Button
      class="pointer-events-auto"
      size="sm"
      color="neutral"
      variant="outline"
      onclick={() => {
        currentlyImage = "/myk.png";
        setFullscreen(false);
        if (favorite) {
          loadFavoriteChapter(favorite);
        }
        goto(`/${$defaultPage}`);
      }}
    >
      <Icon icon="lucide:home" />
    </Button>
    <HoverCard.Root openDelay={50} closeDelay={100}>
      <HoverCard.Trigger>
        <Button
          class="pointer-events-auto"
          size="sm"
          color="neutral"
          variant="outline"
        >
          <Icon icon="nimbus:arrows-horizontal" />
        </Button>
      </HoverCard.Trigger>
      <HoverCard.Content
        class="w-24 h-12 !p-1 flex flex-row gap-0.5"
        sideOffset={-5}
      >
        <Button
          disabled={isTheFirstChapter}
          size="sm"
          variant="outline"
          effect="gooeyLeft"
          onclick={() => handleGoChapter("prev")}
        >
          <Icon icon="lucide:arrow-left" />
        </Button>
        <Button
          disabled={isTheLastChapter}
          size="sm"
          variant="outline"
          effect="gooeyRight"
          onclick={() => handleGoChapter("next")}
          ><Icon icon="lucide:arrow-right" /></Button
        >
      </HoverCard.Content>
    </HoverCard.Root>
  </div>
  <div class="flex gap-2">
    <div class="inline-flex pointer-events-auto z-50">
      <Button disabled class="w-6 rounded-r-none" size="sm" variant="outline"
        ><Icon icon="lucide:minus" /></Button
      >
      <Button
        disabled
        class="w-8 p-0 flex justify-center rounded-none"
        size="sm"
        variant="outline">100%</Button
      >
      <Button disabled class="w-6 rounded-l-none" size="sm" variant="outline"
        ><Icon icon="lucide:plus" /></Button
      >
    </div>
    <Button
      class="pointer-events-auto z-50"
      size="sm"
      variant="outline"
      onclick={async () => await toggleFullscreen()}
    >
      <Icon icon={$isFullscreen ? "lucide:minimize" : "lucide:maximize"} />
    </Button>
  </div>
  <div class="flex gap-1 z-30">
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger>
          <div class="w-[135px] inline-flex pointer-events-auto cursor-default">
            <Badge
              class="w-[100px] text-[11px] rounded-r-none"
              color="neutral"
              variant="outline"
            >
              {favorite?.name
                ? favorite.name.length > 11
                  ? favorite.name.substring(0, 11) + "..."
                  : favorite.name
                : ""}
            </Badge>
            <Badge
              class="w-10 rounded-l-none flex justify-center items-center px-2"
              color="neutral"
              variant="outline"
            >
              {chapter.number.toString()}
            </Badge>
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content side="bottom">
          <p>{`${favorite?.name} / ${chapter.number}`}</p>
        </Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>
  </div>
</div>

<div class="h-full w-full overflow-auto">
  <div class="min-h-full w-full flex items-center justify-center">
    <img
      src={currentlyImage}
      alt="manga"
      class="object-contain h-screen transition-all duration-200"
    />
  </div>
</div>

{#each images as image}
  <img class="hidden" src={image} alt="Prefetched" data-sveltekit-prefetch />
{/each}
