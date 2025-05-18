<script lang="ts">
  import { page } from "$app/state";
  import { swipe, type SwipeCustomEvent } from "svelte-gestures";
  import { toast } from "svelte-sonner";
  import { FavoriteDB, ReadedDB } from "@/repositories";
  import {
    addReadedBelow,
    loadFavoriteChapter,
    preloadNextChapter,
    stopDiscordPresence,
    setDiscordActivity,
    setFullscreen,
    toggleFullscreen,
    saveSettings,
    copyImageBase64,
  } from "@/functions";
  import type { Favorite } from "@/types";
  import { Button, Badge, HoverCard, Tooltip } from "@/lib/components";
  import {
    downloadManager,
    globalChapters,
    readeds,
    autoEnterFullscreen,
    isFullscreen,
    openMenuChapters,
    zoomLevel,
    fitMode,
    viewMode,
    lastPage,
    isMobile,
    openReadMenu,
    openSearch,
  } from "@/store";
  import Icon from "@iconify/svelte";
  import {
    exists,
    readDir,
    remove,
    BaseDirectory,
    type DirEntry,
    copyFile,
    mkdir,
  } from "@tauri-apps/plugin-fs";
  import { open as openPath } from "@tauri-apps/plugin-shell";
  import { goto, afterNavigate } from "$app/navigation";
  import { onMount } from "svelte";
  import { floor } from "lodash";
  import { ChaptersMenu } from "@/components";
  import { join, documentDir, downloadDir } from "@tauri-apps/api/path";
  import { cn } from "@/lib/utils";
  import { convertFileSrc } from "@tauri-apps/api/core";

  let { favoriteId, chapterIndex } = page.params;
  let isLocal = page.url.searchParams.has("local");
  let chapter = $state($globalChapters[Number(chapterIndex)]);
  let favorite: Favorite = $state({
    id: 0,
    name: "",
    link: "",
    cover: "",
    source: "",
    source_id: "",
    folder_name: "",
  });
  let images: string[] = $state([]);
  let backupImages: string[] = [];
  let currentlyCount = $state(1);
  let totalPage = $state(0);
  let isTheLastChapter = $state(Number(chapterIndex) === 0);
  let isTheFirstChapter = $state(
    Number(chapterIndex) === $globalChapters.length - 1
  );
  let currentlyImage = $state("/myk.png");
  let currentlyImagePath = $derived(
    `${favorite.id}~${favorite.folder_name}~${chapter.number}~${currentlyCount}.png`
  );
  let downloadedImages: DirEntry[] = $state([]);
  // svelte-ignore non_reactive_update
  let pagesDiv: HTMLDivElement;
  function scrollToTop() {
    pagesDiv?.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function refreshDownloadeds() {
    const path = "favorite-panels";
    if (await exists(path, { baseDir: BaseDirectory.Document })) {
      downloadedImages = await readDir(path, {
        baseDir: BaseDirectory.Document,
      });
    }
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
      `${favorite.type === "manga" ? "Chapter " : "Issue"} ${chapter.number}: [${$globalChapters.length - Number(chapterIndex)}/${$globalChapters.length}] - ${percentageText}%`
    );
  }
  function prevPage() {
    if (currentlyCount === 1) return;
    currentlyCount--;
    currentlyImage = images[currentlyCount - 1];
    if ($viewMode === "single" || $fitMode === "") scrollToTop();
  }

  function nextPage() {
    if (currentlyCount === totalPage) return;
    currentlyCount++;
    currentlyImage = images[currentlyCount - 1];
    if ($viewMode === "single" || $fitMode === "") scrollToTop();
  }

  function goHome() {
    currentlyImage = "/myk.png";
    setFullscreen(false);
    if (favorite) {
      loadFavoriteChapter(favorite);
    }
    goto($lastPage);
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

  async function favoriteImage() {
    const path = await join("favorite-panels", currentlyImagePath);
    if (downloadedImages.map((img) => img.name).includes(currentlyImagePath)) {
      await remove(path, { baseDir: BaseDirectory.Document });
      refreshDownloadeds();
      toast.warning("Page removed!", { duration: 800 });
    } else {
      if (isLocal) {
        await mkdir("favorite-panels", {
          baseDir: BaseDirectory.Document,
          recursive: true,
        });
        await copyFile(
          `Mangas/${favorite.folder_name}/${chapter.number}/${(
            currentlyCount - 1
          )
            .toString()
            .padStart(3, "0")}.png`,
          path,
          {
            fromPathBaseDir: BaseDirectory.Download,
            toPathBaseDir: BaseDirectory.Document,
          }
        );
      } else {
        await $downloadManager.writePageBase64(
          currentlyImage,
          currentlyImagePath
        );
      }
      toast.success("Page favorited!", { duration: 800 });
      refreshDownloadeds();
    }
  }

  function resetImages() {
    images = [...backupImages];
    currentlyCount = 1;
    currentlyImage = images[currentlyCount - 1];
    totalPage = images.length;
  }

  async function joinCurrentlyImageToNext() {
    if (currentlyCount === totalPage) return;
    let newImage = "";
    if (isLocal) {
      const [currentlyB64, nextB64] = await Promise.all([
        $downloadManager.pathToBase64(images[currentlyCount - 1]),
        $downloadManager.pathToBase64(images[currentlyCount]),
      ]);
      newImage = await $downloadManager.joinBase64Images(currentlyB64, nextB64);
    } else {
      newImage = await $downloadManager.joinBase64Images(
        images[currentlyCount - 1],
        images[currentlyCount]
      );
    }
    currentlyImage = newImage;
    images[currentlyCount - 1] = newImage;
    images.splice(currentlyCount, 1);
    totalPage = images.length;
    toast.success("Images joined!", { duration: 800 });
  }

  function gotoPage(page: string) {
    currentlyCount = 1;
    totalPage = 1;
    currentlyImage = "/myk.png";
    images = ["/myk.png"];
    scrollToTop();
    goto(page);
  }

  async function getLocalChapterImages(): Promise<string[]> {
    if (!chapter.path) {
      goHome();
      return [];
    }
    if (await exists(chapter.path, { baseDir: BaseDirectory.Download })) {
      let images = [];
      const dlDir = await downloadDir();
      downloadedImages = await readDir(chapter.path, {
        baseDir: BaseDirectory.Download,
      });
      for (const image of downloadedImages) {
        const path = await join(dlDir, chapter.path, image.name);
        images.push(convertFileSrc(path));
      }
      return images;
    }
    goHome();
    return [];
  }

  afterNavigate(async () => {
    favoriteId = page.params.favoriteId;
    chapterIndex = page.params.chapterIndex;
    isTheFirstChapter = Number(chapterIndex) === $globalChapters.length - 1;
    isTheLastChapter = Number(chapterIndex) === 0;
    favorite = await FavoriteDB.getFavorite(Number(favoriteId));
    chapter = $globalChapters[Number(chapterIndex)];
    if (!isLocal) {
      toast.loading(
        `Loading ${favorite.type === "manga" ? "chapter" : "issue"} ${chapter.number}`
      );
      images = await $downloadManager.getChapterImages(chapter);
    } else {
      images = await getLocalChapterImages();
    }
    backupImages = [...images];
    currentlyImage = images[0];
    totalPage = images.length;
    setChapterActivity(favorite.name);
    await addReadedBelow(chapter, $globalChapters, favorite, $readeds, true);
    const newReadeds = await ReadedDB.getReadeds(favorite);
    readeds.set(newReadeds);
    if (favorite) {
      loadFavoriteChapter(favorite);
    }
    if (!isLocal) {
      images = await $downloadManager.getBase64Images(
        images,
        $downloadManager.getBaseUrl(favorite.source)
      );
      backupImages = [...images];
      currentlyImage = images[currentlyCount - 1];
      preloadNextChapter(Number(chapterIndex), $globalChapters);
    }
  });

  onMount(async () => {
    if ($autoEnterFullscreen) {
      await setFullscreen(true);
    }
    favorite = await FavoriteDB.getFavorite(Number(favoriteId));
    setChapterActivity(favorite.name);
    if (!isLocal) {
      images = await $downloadManager.getChapterImages(chapter);
    } else {
      images = await getLocalChapterImages();
    }
    backupImages = [...images];
    currentlyImage = images[0];
    totalPage = images.length;
    setChapterActivity(favorite.name);
    await addReadedBelow(chapter, $globalChapters, favorite, $readeds, true);
    const newReadeds = await ReadedDB.getReadeds(favorite);
    readeds.set(newReadeds);
    if (favorite) {
      loadFavoriteChapter(favorite);
    }
    if (!isLocal) {
      images = await $downloadManager.getBase64Images(
        images,
        $downloadManager.getBaseUrl(favorite.source)
      );
      backupImages = [...images];
      currentlyImage = images[currentlyCount - 1];
      preloadNextChapter(Number(chapterIndex), $globalChapters);
    }
  });

  function handleKeydown(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    const ctrl = event.metaKey || event.ctrlKey;
    if (!$openSearch) {
      if ($viewMode === "single") {
        if (key === "arrowleft") {
          prevPage();
        }
        if (key === "arrowright") {
          nextPage();
        }
        if (key === " ") {
          nextPage();
        }
        if (key === "enter") {
          if (currentlyCount === totalPage && !isTheLastChapter) {
            handleGoChapter("next");
          }
          nextPage();
        }
      }
      if (key === "backspace") {
        prevPage();
      }
      if (key === "c" && ctrl) {
        copyImageBase64(images[currentlyCount - 1]);
      }
      if (key === "s" && ctrl) {
        favoriteImage();
      }
      if (key === "q" && ctrl) {
        joinCurrentlyImageToNext();
      }
      if (key === "w" && ctrl) {
        resetImages();
      }
      if (key === "+" || (event.ctrlKey && key === "=")) {
        $zoomLevel = Math.min(200, $zoomLevel + 10);
      }
      if (key === "-" || (event.ctrlKey && key === "-")) {
        $zoomLevel = Math.max(50, $zoomLevel - 10);
      }
      if (key === ">") {
        handleGoChapter("next");
      }
      if (key === "<") {
        handleGoChapter("prev");
      }

      if (key === "v") {
        $viewMode = $viewMode === "single" ? "scroll" : "single";
        saveSettings();
      }

      if (key === "f") {
        fitMode.set($fitMode === "" ? "width" : "");
        saveSettings();
      }
      if (key === "a") {
        openReadMenu.set(!$openReadMenu);
        saveSettings();
      }
      if (key === "m") {
        openMenuChapters.set(!$openMenuChapters);
      }
    }
    if (key === "f4") {
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
  function handleMouse(
    e: MouseEvent & {
      currentTarget: EventTarget & Window;
    }
  ) {
    if (e.button === 3) {
      e.preventDefault();
      e.stopPropagation();
      prevPage();
    }
    if (e.button === 4) {
      e.preventDefault();
      e.stopPropagation();
      nextPage();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} onmousedown={handleMouse} />
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
    {#if currentlyCount === totalPage}
      <Button
        class="h-24 pointer-events-auto"
        disabled={isTheLastChapter}
        variant={isTheLastChapter ? "outline" : "default"}
        onclick={() => handleGoChapter("next")}
      >
        <Icon
          icon={isTheLastChapter ? "lucide:circle-x" : "lucide:arrow-right"}
        />
      </Button>
    {/if}
  </div>
  <div
    class={cn(
      "fixed w-screen flex justify-end items-center z-50 pointer-events-none transition-all duration-500",
      $openReadMenu ? "translate-x-0" : "translate-x-[14rem]"
    )}
  >
    <Button
      class="w-3 rounded-l-full rounded-r-none pointer-events-auto"
      variant="ghost"
      onclick={(_) => {
        openReadMenu.set(!$openReadMenu);
        saveSettings();
      }}
    >
      <Icon
        class={cn(
          "!w-5 !h-5 transition-all duration-700",
          $openReadMenu ? "rotate-180" : "rotate-0 opacity-30"
        )}
        icon="typcn:chevron-left"
      />
    </Button>
    <div class="flex flex-col items-end justify-end gap-1 p-1">
      <div class="flex gap-1">
        <Badge class="w-10 h-9 place-content-center" variant="secondary">
          {isNaN(Math.round((currentlyCount / totalPage) * 100)) ||
          !isFinite(Math.round((currentlyCount / totalPage) * 100))
            ? 0
            : currentlyCount === 1 && totalPage === 1
              ? 100
              : Math.round((currentlyCount / totalPage) * 100)}%
        </Badge>
        <Badge class="w-12 h-9  place-content-center" variant="secondary">
          {isNaN(currentlyCount) ? 0 : currentlyCount}/{totalPage}
        </Badge>
        <Button
          class="pointer-events-auto z-50"
          size="sm"
          variant="secondary"
          onclick={async () => await toggleFullscreen()}
        >
          <Icon icon={$isFullscreen ? "lucide:minimize" : "lucide:maximize"} />
        </Button>

        <Button
          class="pointer-events-auto"
          size="sm"
          variant="secondary"
          onclick={() => ($openMenuChapters = true)}
        >
          <Icon icon="lucide:menu" />
        </Button>
        <Button
          class="w-11 pointer-events-auto"
          size="sm"
          variant="secondary"
          onclick={goHome}
        >
          <Icon icon="lucide:home" />
        </Button>
      </div>
      <div class="flex gap-1 z-30">
        <Button
          class="h-9 pointer-events-auto"
          size="sm"
          variant="secondary"
          disabled={$viewMode === "scroll"}
          onclick={() => {
            if ($fitMode === "") {
              $fitMode = "width";
            } else {
              $fitMode = "";
            }
            saveSettings();
          }}
        >
          <Icon
            icon={$fitMode === "width"
              ? "tabler:arrow-autofit-content-filled"
              : "tabler:arrow-autofit-content"}
          />
        </Button>
        <Button
          class="h-9 pointer-events-auto"
          size="sm"
          color="neutral"
          variant="secondary"
          onclick={() => {
            $viewMode = $viewMode === "scroll" ? "single" : "scroll";
            saveSettings();
          }}
        >
          <Icon
            icon={$viewMode === "scroll" ? "lucide:scroll" : "lucide:book-open"}
          />
        </Button>
        <Button
          class="h-9 pointer-events-auto"
          size="sm"
          color="neutral"
          variant="secondary"
          onclick={joinCurrentlyImageToNext}
        >
          <Icon icon="fluent:image-split-24-filled" />
        </Button>
        {#if !$isMobile}
          <div class="inline-flex pointer-events-auto z-50">
            <Button
              class="w-7 rounded-r-none"
              size="sm"
              variant="secondary"
              disabled={$fitMode !== "" && $viewMode !== "scroll"}
              onclick={() => {
                $zoomLevel = Math.max(50, $zoomLevel - 10);
                saveSettings();
              }}
            >
              <Icon icon="lucide:minus" />
            </Button>
            <Button
              class="w-[40px] p-0 flex justify-center rounded-none"
              size="sm"
              variant="secondary"
              disabled={$fitMode !== "" && $viewMode !== "scroll"}
              onclick={() => {
                $zoomLevel = 100;
                saveSettings();
              }}
            >
              {$zoomLevel}%
            </Button>
            <Button
              class="w-7 rounded-l-none"
              size="sm"
              variant="secondary"
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
      <div class="flex gap-1 justify-end pointer-events-auto cursor-default">
        <div class="inline-flex">
          <Badge
            class="w-[133px]  flex justify-center rounded-r-none"
            variant="secondary"
          >
            {favorite?.name
              ? favorite.name.length > 17
                ? favorite.name.substring(0, 17) + "..."
                : favorite.name
              : ""}
          </Badge>
          <Badge
            class="w-12 rounded-l-none flex justify-center items-center ml-0.5 px-2"
            variant="secondary"
          >
            {chapter.number.toString()}
          </Badge>
        </div>
        <Button
          class="w-10 pointer-events-auto"
          size="sm"
          color="neutral"
          variant="secondary"
          onclick={favoriteImage}
        >
          <Icon
            icon={downloadedImages
              .map((img) => img.name)
              .includes(currentlyImagePath)
              ? "tabler:photo-filled"
              : "tabler:photo"}
            class="!w-5 !h-5"
          />
        </Button>
      </div>
    </div>
  </div>

  {#if $viewMode === "scroll"}
    <div
      class="w-full overflow-y-auto"
      bind:this={pagesDiv}
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
    <button
      class="fixed inset-0 flex cursor-default"
      style="z-index: 40;"
      use:swipe={() => ({ timeframe: 300, minSwipeDistance: 30 })}
      onfocus={(e) => {
        e.currentTarget.blur();
      }}
      tabindex={-1}
      onswipe={handleSwipe}
      onclick={(e) => {
        nextPage();
        e.currentTarget.blur();
      }}
      oncontextmenu={(e) => {
        e.preventDefault();
        prevPage();
      }}
      onwheel={(e) => {
        if ($fitMode !== "") {
          if (e.deltaY > 0) {
            nextPage();
          } else {
            prevPage();
          }
        }
      }}
    >
      <!-- <button
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
      ></button> -->
    </button>
    {#if $fitMode === "width"}
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
        class=" pointer-events-auto"
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
