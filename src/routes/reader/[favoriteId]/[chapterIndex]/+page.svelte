<script lang="ts">
  import { page } from "$app/state";
  import { swipe, type SwipeCustomEvent } from "svelte-gestures";
  import { FavoriteRepository, ReadedRepository } from "@/repositories";
  import {
    addReadedBelow,
    loadFavoriteChapter,
    preloadNextChapter,
    stopDiscordPresence,
    setDiscordActivity,
    setFullscreen,
    toggleFullscreen,
  } from "@/functions";
  import type { Favorite } from "@/interfaces";
  import { Button, Badge, HoverCard, Tooltip } from "@/lib/components";
  import {
    downloadManager,
    globalChapters,
    readeds,
    autoEnterFullscreen,
    defaultPage,
    isFullscreen,
    isMobile,
    openMenuChapters,
  } from "@/store";
  import Icon from "@iconify/svelte";
  import { goto, afterNavigate } from "$app/navigation";
  import { onMount } from "svelte";
  import { floor } from "lodash";
  import { ChaptersMenu } from "@/components";

  let openHoverChapter = $state(false);
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
  let viewMode = $state('scroll');
  let zoomLevel = $state(100);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleScroll(event: Event) {
    const container = event.target as HTMLElement;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    
    if (viewMode === 'scroll') {
      const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
      const estimatedPage = Math.ceil((scrollPercentage / 100) * totalPage);
      currentlyCount = Math.max(1, Math.min(estimatedPage, totalPage));
    }
  }

  function setChapterActivity(name: string) {
    const percentageReaded: number =
      (($globalChapters.length - Number(chapterIndex)) /
        $globalChapters.length) *
      100;
    let percentageText = percentageReaded.toFixed(2);
    if (floor(percentageReaded) === 100) {
      percentageText = "100";
    } else if (isTheFirstChapter) {
      percentageText = "0";
    }

    setDiscordActivity(
      `Reading [${name}]`,
      `Chapter ${chapter.number}: [${$globalChapters.length - Number(chapterIndex)}/${$globalChapters.length}] - ${percentageText}%`
    );
  }

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
    setChapterActivity(favorite.name);
    await addReadedBelow(chapter, $globalChapters, favorite, $readeds, true);
    const newReadeds = await ReadedRepository.getReadeds(favorite);
    readeds.set(newReadeds);
    if (favorite) {
      loadFavoriteChapter(favorite);
    }
    preloadNextChapter(Number(chapterIndex), $globalChapters);
  });

  function prevPage() {
    if (currentlyCount === 1) return;
    currentlyCount--;
    currentlyImage = images[currentlyCount - 1];
    if (viewMode === 'single') scrollToTop();
  }

  function nextPage() {
    if (currentlyCount === totalPage) return;
    currentlyCount++;
    currentlyImage = images[currentlyCount - 1];
    if (viewMode === 'single') scrollToTop();
  }

  function goHome() {
    currentlyImage = "/myk.png";
    setFullscreen(false);
    if (favorite) {
      loadFavoriteChapter(favorite);
    }
    goto(`/${$defaultPage}`);
    stopDiscordPresence();
  }

  async function handleGoChapter(way: "next" | "prev") {
    currentlyImage = "/myk.png";
    currentlyCount = 1;
    totalPage = 1;
    await goto(
      `/reader/${favoriteId}/${Number(chapterIndex) + (way === "next" ? -1 : 1)}`
    );
  }

  onMount(async () => {
    if ($autoEnterFullscreen) {
      await setFullscreen(true);
    }
    favorite = await FavoriteRepository.getFavorite(Number(favoriteId));
    setChapterActivity(favorite.name);
    const chapterImages = await $downloadManager.getChapterImages(chapter);
    images = chapterImages;
    currentlyImage = images[0];
    totalPage = images.length;
    await addReadedBelow(chapter, $globalChapters, favorite, $readeds, true);
    const newReadeds = await ReadedRepository.getReadeds(favorite);
    readeds.set(newReadeds);
    if (favorite) {
      loadFavoriteChapter(favorite);
    }
    preloadNextChapter(Number(chapterIndex), $globalChapters);
  });

  function handleKeydown(event: KeyboardEvent) {
    if (viewMode === 'single') {
      if (event.key === "ArrowLeft") {
        prevPage();
      }
      if (event.key === "ArrowRight") {
        nextPage();
      }
      if (event.key === " ") {
        nextPage();
      }
      if (event.key === "Enter") {
        nextPage();
      }
      if (event.key === "Backspace") {
        prevPage();
      }
    }

    if (event.key === "+" || (event.ctrlKey && event.key === "=")) {
      zoomLevel = Math.min(200, zoomLevel + 10);
    }
    if (event.key === "-" || (event.ctrlKey && event.key === "-")) {
      zoomLevel = Math.max(50, zoomLevel - 10);
    }

    if (event.key === "v") {
      viewMode = viewMode === 'scroll' ? 'single' : 'scroll';
    }

    if (event.key === "F4") {
      goHome();
    }
  }

  function handleSwipe(e: SwipeCustomEvent) {
    if (e.detail.direction === "right") {
      prevPage();
    }
    if (e.detail.direction === "left") {
      nextPage();
    }
  }

  function gotoPage(page: string) {
    currentlyCount = 1;
    totalPage = 1;
    currentlyImage = "/myk.png";
    goto(page);
  }
</script>

<svelte:window onkeydown={handleKeydown} />
<ChaptersMenu
  favorite={favorite ?? undefined}
  {goHome}
  {gotoPage}
  {handleGoChapter}
/>
<div class="dark:bg-black min-h-screen">
  <div class="fixed bottom-0 left-0 w-full h-2 bg-zinc-800 z-50">
    <div
      class="h-full transition-all duration-200 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 dark:from-pink-500 dark:via-red-500 dark:to-yellow-500"
      style="width: {(currentlyCount / totalPage) * 100}%"
    ></div>
  </div>

  <div class="fixed w-screen gap-1 p-[1%] flex flex-col justify-end items-end z-50 mb-3">
    <div class="flex gap-1 z-30">
      <Button
        class="pointer-events-auto"
        size="sm"
        color="neutral"
        variant="outline"
        onclick={() => viewMode = viewMode === 'scroll' ? 'single' : 'scroll'}
      >
        <Icon icon={viewMode === 'scroll' ? "lucide:scroll" : "lucide:book-open"} />
      </Button>
      <Button
        class="pointer-events-auto"
        size="sm"
        color="neutral"
        variant="outline"
        onclick={goHome}
      >
        <Icon icon="lucide:home" />
      </Button>
      <Button
        class="pointer-events-auto"
        size="sm"
        color="neutral"
        variant="outline"
        onclick={() => ($openMenuChapters = true)}
      >
        <Icon icon="lucide:menu" />
      </Button>
      {#if !$isMobile}
        <div class="inline-flex pointer-events-auto z-50">
          <Button
            class="w-6 rounded-r-none"
            size="sm"
            variant="outline"
            onclick={() => zoomLevel = Math.max(50, zoomLevel - 10)}
          >
            <Icon icon="lucide:minus" />
          </Button>
          <Button
            class="w-16 p-0 flex justify-center rounded-none"
            size="sm"
            variant="outline"
          >
            {zoomLevel}%
          </Button>
          <Button
            class="w-6 rounded-l-none"
            size="sm"
            variant="outline"
            onclick={() => zoomLevel = Math.min(200, zoomLevel + 10)}
          >
            <Icon icon="lucide:plus" />
          </Button>
        </div>
      {/if}
    </div>

    <div class="flex gap-1">
      <div class="flex items-center gap-2">
        <Badge class="rounded-md" color="neutral" variant="outline">
          {currentlyCount} de {totalPage}
        </Badge>
        <Badge class="rounded-md" color={Math.round((currentlyCount / totalPage) * 100) === 100 ? "success" : "neutral"} variant="outline">
          {Math.round((currentlyCount / totalPage) * 100)}%
        </Badge>
      </div>
    </div>
  </div>

  {#if viewMode === 'scroll'}
    <div 
      class="w-full overflow-y-auto" 
      style="height: calc(100vh - 2rem);"
      onscroll={handleScroll}
    >
      <div class="flex flex-col items-center">
        {#each images as image, index}
          <img
            src={image}
            alt="Page {index + 1}"
            class="w-full max-w-full"
            style="width: {zoomLevel}%; margin: 0 auto;"
          />
        {/each}
      </div>
    </div>
  {:else}
    <div class="fixed inset-0 flex" style="z-index: 40;" use:swipe={() => ({ timeframe: 300, minSwipeDistance: 30 })} onswipe={handleSwipe}>
      <button
        aria-label="Anterior"
        class="w-[50%] cursor-default outline-none border-none bg-transparent"
        tabindex="-1"
        onclick={(e) => {
          prevPage();
          e.currentTarget.blur();
        }}
      ></button>
      <button
        aria-label="Próximo"
        class="w-[50%] cursor-default outline-none border-none bg-transparent"
        tabindex="-1"
        onclick={(e) => {
          nextPage();
          e.currentTarget.blur();
        }}
      ></button>
    </div>

    <div class="h-full w-full overflow-auto">
      <div class="min-h-full w-full flex items-center justify-center">
        <img
          src={currentlyImage}
          alt="manga"
          class="object-contain transition-all duration-200"
          style="width: {zoomLevel}%;"
        />
      </div>
    </div>
  {/if}

  <div class="fixed w-screen h-screen z-50 pointer-events-none flex justify-end items-center">
    {#if currentlyCount === totalPage && !isTheLastChapter}
      <Button
        class="pointer-events-auto"
        onclick={() => handleGoChapter("next")}
      >
        <Icon icon="lucide:arrow-right" />
      </Button>
    {/if}
  </div>
</div>

{#each images as image}
  <img class="hidden" src={image} alt="Prefetched" data-sveltekit-prefetch />
{/each}
