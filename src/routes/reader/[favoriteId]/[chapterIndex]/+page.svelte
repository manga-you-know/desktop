<script lang="ts">
  import { page } from "$app/state";
  import { swipe, type SwipeCustomEvent } from "svelte-gestures";
  import { toast } from "svelte-sonner";
  import { FavoriteRepository, ReadedRepository } from "@/repositories";
  import {
    addReadedBelow,
    loadFavoriteChapter,
    preloadNextChapter,
    stopDiscordPresence,
    setDiscordActivity,
    setFullscreen,
    toggleFullscreen,
    saveSettings,
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
    zoomLevel,
    fitMode,
    viewMode,
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

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleScroll(event: Event) {
    const container = event.target as HTMLElement;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    if ($viewMode === "scroll") {
      const scrollPercentage =
        (scrollTop / (scrollHeight - clientHeight)) * 100;
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
    toast.loading("Loading chapter " + chapter.number);
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
    images = await $downloadManager.getBase64Images(
      images,
      $downloadManager.getBaseUrl(favorite.source)
    );
    currentlyImage = images[currentlyCount - 1];
    preloadNextChapter(Number(chapterIndex), $globalChapters);
  });

  function prevPage() {
    if (currentlyCount === 1) return;
    currentlyCount--;
    currentlyImage = images[currentlyCount - 1];
    if ($viewMode === "single") scrollToTop();
  }

  function nextPage() {
    if (currentlyCount === totalPage) return;
    currentlyCount++;
    currentlyImage = images[currentlyCount - 1];
    if ($viewMode === "single") scrollToTop();
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
    images = ["/myk.png"];
    currentlyCount = 1;
    totalPage = 1;
    scrollToTop();
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
    images = await $downloadManager.getBase64Images(
      images,
      $downloadManager.getBaseUrl(favorite.source)
    );
    currentlyImage = images[currentlyCount - 1];
    preloadNextChapter(Number(chapterIndex), $globalChapters);
  });

  function handleKeydown(event: KeyboardEvent) {
    if ($viewMode === "single") {
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
      $zoomLevel = Math.min(200, $zoomLevel + 10);
    }
    if (event.key === "-" || (event.ctrlKey && event.key === "-")) {
      $zoomLevel = Math.max(50, $zoomLevel - 10);
    }

    if (event.key === "v") {
      $viewMode = $viewMode === "scroll" ? "single" : "scroll";
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
    images = ["/myk.png"];
    scrollToTop();
    goto(page);
  }
</script>

<svelte:window onkeydown={handleKeydown} />
<ChaptersMenu
  favorite={favorite ?? undefined}
  currentlyChapter={chapter}
  {goHome}
  {gotoPage}
  {handleGoChapter}
/>
<div class="dark:bg-black min-h-screen">
  <div
    class="fixed w-screen h-screen z-50 pointer-events-none flex justify-end items-center"
  >
    {#if currentlyCount === totalPage && !isTheLastChapter}
      <Button
        class="pointer-events-auto"
        onclick={() => handleGoChapter("next")}
      >
        <Icon icon="lucide:arrow-right" /></Button
      >
    {/if}
  </div>
  <div
    class="fixed w-screen gap-1 p-[1%] flex flex-col justify-end items-end z-50 pointer-events-none"
  >
    <div class="flex gap-1 z-30">
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
            disabled={$fitMode !== "" && $viewMode !== "scroll"}
            onclick={() => {
              $zoomLevel = Math.max(50, $zoomLevel - 10);
              saveSettings();
            }}
          >
            <Icon icon="lucide:minus" />
          </Button>
          <Button
            class="w-16 p-0 flex justify-center rounded-none"
            size="sm"
            variant="outline"
            disabled={$fitMode !== "" && $viewMode !== "scroll"}
            onclick={() => {
              $zoomLevel = 100;
              saveSettings();
            }}
          >
            {$zoomLevel}%
          </Button>
          <Button
            class="w-6 rounded-l-none"
            size="sm"
            variant="outline"
            disabled={$fitMode !== "" && $viewMode !== "scroll"}
            onclick={() => {
              $zoomLevel = Math.min(200, $zoomLevel + 10);
              saveSettings();
            }}
          >
            <Icon icon="lucide:plus" />
          </Button>
        </div>
      {/if}
    </div>

    <div class="flex gap-1">
      <div class="flex items-center gap-2 pointer-events-none">
        <Badge
          class="w-12 rounded-md bg-slate-700 place-content-center"
          color={Math.round((currentlyCount / totalPage) * 100) === 100
            ? "success"
            : "neutral"}
          variant="outline"
        >
          {isNaN(Math.round((currentlyCount / totalPage) * 100))
            ? 0
            : currentlyCount === 1 && totalPage === 1
              ? 100
              : Math.round((currentlyCount / totalPage) * 100)}%
        </Badge>
        <Badge
          class="w-12 mr-0.5 rounded-md bg-slate-700 place-content-center"
          color="neutral"
          variant="outline"
        >
          {isNaN(currentlyCount) ? 0 : currentlyCount}/{totalPage}
        </Badge>
        <Button
          class="pointer-events-auto"
          size="sm"
          color="neutral"
          variant="outline"
          disabled={$viewMode === "scroll"}
          onclick={() => {
            if ($fitMode === "") {
              $fitMode = "fit-width";
            } else {
              $fitMode = "";
            }
            saveSettings();
          }}
        >
          <Icon
            icon={$fitMode === "fit-width"
              ? "tabler:arrow-autofit-content-filled"
              : "tabler:arrow-autofit-content"}
          />
        </Button>
        <Button
          class="pointer-events-auto"
          size="sm"
          color="neutral"
          variant="outline"
          onclick={() => {
            $viewMode = $viewMode === "scroll" ? "single" : "scroll";
            saveSettings();
          }}
        >
          <Icon
            icon={$viewMode === "scroll" ? "lucide:scroll" : "lucide:book-open"}
          />
        </Button>
      </div>
    </div>
    <div class="flex gap-2 pointer-events-auto cursor-default">
      <div class="inline-flex">
        <Badge
          class="w-[120px]  flex justify-center rounded-xl rounded-r-none"
          color="neutral"
          variant="outline"
        >
          {favorite?.name
            ? favorite.name.length > 17
              ? favorite.name.substring(0, 17) + "..."
              : favorite.name
            : ""}
        </Badge>
        <Badge
          class="w-10 rounded-xl rounded-l-none flex justify-center items-center px-2"
          color="neutral"
          variant="outline"
        >
          {chapter.number.toString()}
        </Badge>
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
  </div>

  {#if $viewMode === "scroll"}
    <div
      class="w-full overflow-y-auto"
      style="height: 100vh ;"
      onscroll={handleScroll}
    >
      <div class="flex flex-col items-center">
        {#each images as image, index}
          <img
            src={image}
            alt="Page {index + 1}"
            class="select-none"
            style="width: {$zoomLevel - 20}%; margin: 0 auto;"
          />
        {/each}
      </div>
    </div>
  {:else}
    <div
      class="fixed inset-0 flex"
      style="z-index: 40;"
      use:swipe={() => ({ timeframe: 300, minSwipeDistance: 30 })}
      onswipe={handleSwipe}
    >
      <button
        aria-label="Forward"
        class="w-[50%] cursor-default outline-none border-none bg-transparent"
        tabindex="-1"
        onclick={(e) => {
          prevPage();
          e.currentTarget.blur();
        }}
      ></button>
      <button
        aria-label="Backward"
        class="w-[50%] cursor-default outline-none border-none bg-transparent"
        tabindex="-1"
        onclick={(e) => {
          nextPage();
          e.currentTarget.blur();
        }}
      ></button>
    </div>
    {#if $fitMode === "fit-width"}
      <div class="h-full w-full overflow-auto">
        <div class="min-h-full w-full flex items-center justify-center">
          <img
            src={currentlyImage}
            alt="manga"
            class="object-contain h-screen transition-all duration-200"
          />
        </div>
      </div>
    {:else}
      <div class="h-full w-full overflow-auto">
        <div
          class="min-h-full w-full flex items-center content-center place-content-center justify-center"
        >
          <img
            src={currentlyImage}
            alt="manga"
            class="select-none transition-all duration-200"
            style="width: {$zoomLevel - 20}%;"
          />
        </div>
      </div>
    {/if}
  {/if}

  <div
    class="fixed w-screen h-screen z-50 pointer-events-none flex justify-end items-center"
  >
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
