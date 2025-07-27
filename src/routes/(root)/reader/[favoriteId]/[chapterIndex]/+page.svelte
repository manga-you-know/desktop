<script lang="ts">
  import { page } from "$app/state";
  import { swipe, type SwipeCustomEvent } from "svelte-gestures";
  import { toast } from "svelte-sonner";
  import { draggable } from "@neodrag/svelte";
  import { FavoriteDB, ReadedDB } from "@/repositories";
  import {
    addReadedBelow,
    loadFavoriteChapters,
    stopDiscordPresence,
    setDiscordActivity,
    setFullscreen,
    toggleFullscreen,
    saveSettings,
    copyImageBase64,
    refreshRawFavorites,
  } from "@/functions";
  import type { Favorite } from "@/types";
  import {
    Button,
    Badge,
    HoverCard,
    Tooltip,
    Switch,
    Label,
  } from "@/lib/components";
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
    openReadMenu,
    openSearch,
    extraTitle,
    customTitlebar,
    favoritesLoaded,
    chapterPagesCounter,
    chapterPercentage,
    showCurrentChapter,
    readerClock,
    rawFavorites,
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
  import { goto, afterNavigate, replaceState } from "$app/navigation";
  import { onMount } from "svelte";
  import { floor } from "lodash";
  import { ChaptersMenu, Image } from "@/components";
  import { join, documentDir, downloadDir } from "@tauri-apps/api/path";
  import { cn } from "@/lib/utils";
  import { delay } from "@/utils";
  import { convertFileSrc } from "@tauri-apps/api/core";
  import { IS_MOBILE } from "@/constants";
  import { ScrollingValue, SpringValue } from "svelte-ux";
  import { fly } from "svelte/transition";
  import { flip } from "svelte/animate";

  let { favoriteIdEx, chapterIndexEx } = page.params;
  let favoriteId = $state(favoriteIdEx);
  let chapterIndex = $state(chapterIndexEx);
  let isLocal = page.url.searchParams.has("local");
  let chapter = $derived($globalChapters[Number(chapterIndex)]);
  let favorite: Favorite = $derived(
    $rawFavorites.find((fv) => fv.id === Number(favoriteId)) ?? {
      id: 0,
      name: "",
      link: "",
      cover: "",
      source: "",
      source_id: "",
      folder_name: "",
    },
  );
  let images: string[] = $state([]);
  let backupImages: string[] = [];
  let prevImages: string[] = [];
  let nextImages: string[] = [];
  let currentlyCount = $state(1);
  let totalPage = $state(0);
  let isTheLastChapter = $derived(Number(chapterIndex) === 0);
  let isTheFirstChapter = $derived(
    Number(chapterIndex) === $globalChapters.length - 1,
  );
  let currentlyImage = $state("/myk.png");
  let currentlyImagePath = $derived(
    `${favorite.id}~${favorite.folder_name}~${chapter?.number}~${currentlyCount}.png`,
  );
  let downloadedImages: DirEntry[] = $state([]);
  let pagesDiv: HTMLDivElement = $state(null!);
  let menuFromTop: number = $state(20);
  let time = $state(new Date());

  let hours = $derived(time.getHours());
  let minutes = $derived(time.getMinutes());
  let seconds = $derived(time.getSeconds());
  setInterval(() => {
    time = new Date();
  }, 1000);
  function scrollToTop() {
    pagesDiv?.scrollTo({ top: 0, behavior: "smooth" });
  }

  function scrollToBottom() {
    pagesDiv?.scrollTo({
      top: pagesDiv?.scrollHeight ?? 0,
      behavior: "smooth",
    });
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

  async function preloadNextChapter(): Promise<void> {
    if (Number(chapterIndex) === 0) return;
    const chapterToFetch = $globalChapters[Number(chapterIndex) - 1];
    var images = await $downloadManager.getChapterImages(chapterToFetch);
    nextImages = await $downloadManager.getBase64Images(
      images,
      $downloadManager.getBaseUrl(chapterToFetch.source),
    );
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
      `${favorite.type === "manga" ? "Chapter " : "Issue"} ${chapter?.number}: [${$globalChapters.length - Number(chapterIndex)}/${$globalChapters.length}] - ${percentageText}%`,
    );
  }
  async function prevPage() {
    if (currentlyCount === 1) {
      if (!isTheFirstChapter) handleChapterSeamless("prev");
      return;
    }
    currentlyCount--;
    currentlyImage = images[currentlyCount - 1];
    const id = (currentlyCount - 1).toString();
    if ($viewMode === "single" && $fitMode === "") scrollToTop();
    if ($viewMode === "scroll") {
      await delay(5);
      const prevP = document.getElementById(id);
      pagesDiv?.scrollTo({ top: prevP?.offsetTop, behavior: "smooth" });
    }
  }

  async function nextPage() {
    if (currentlyCount === totalPage) {
      if (!isTheLastChapter) handleChapterSeamless("next");
      return;
    }
    currentlyCount++;
    currentlyImage = images[currentlyCount - 1];
    const id = (currentlyCount - 1).toString();
    if ($viewMode === "single" && $fitMode === "") scrollToTop();
    if ($viewMode === "scroll") {
      await delay(5);
      const nextP = document.getElementById(id);
      pagesDiv?.scrollTo({ top: nextP?.offsetTop, behavior: "smooth" });
    }
  }

  function goHome() {
    currentlyImage = "/myk.png";
    setFullscreen(false);
    if (favorite.is_ultra_favorite) {
      loadFavoriteChapters(favorite);
    }
    goto($lastPage);
    openMenuChapters.set(false);
    stopDiscordPresence();
    extraTitle.set("");
  }
  async function handleChapterSeamless(way: "next" | "prev") {
    if (way === "next" && nextImages.length > 0) {
      currentlyImage = nextImages[0];
      prevImages = backupImages;
      images = nextImages;
      backupImages = images;
      currentlyCount = 1;
      totalPage = nextImages.length;
      scrollToTop();
      chapterIndex = (Number(chapterIndex) - 1).toString();
      nextImages = [];
      preloadNextChapter();
    } else if (prevImages.length > 0) {
      currentlyImage = prevImages.at(-1) ?? prevImages[0];
      nextImages = backupImages;
      images = prevImages;
      backupImages = images;
      currentlyCount = nextImages.length;
      totalPage = nextImages.length;
      scrollToBottom();
      chapterIndex = (Number(chapterIndex) + 1).toString();
      prevImages = [];
    }
    replaceState("", `/reader/${favoriteId}/${Number(chapterIndex)}`);
    extraTitle.set(
      chapter.title !== undefined
        ? `${chapter.number} # ${chapter.title}`
        : `${favorite.name} # ${chapter.number}`,
    );
    await addReadedBelow(chapter, $globalChapters, favorite, $readeds, true);
    const newReadeds = await ReadedDB.getReadeds(favorite);
    readeds.set(newReadeds);
    if (favorite.is_ultra_favorite) {
      loadFavoriteChapters(favorite);
    }
  }

  function handleGoChapter(way: "next" | "prev") {
    if (way === "next" && nextImages.length > 0) {
      handleChapterSeamless("next");
      return;
    }
    if (way === "prev" && prevImages.length > 0) {
      handleChapterSeamless("prev");
      return;
    }
    currentlyImage = "/myk.png";
    images = ["/myk.png"];
    currentlyCount = 1;
    totalPage = 0;
    scrollToTop();
    goto(
      `/reader/${favoriteId}/${Number(chapterIndex) + (way === "next" ? -1 : 1)}`,
    );
  }

  async function favoriteImage() {
    currentlyImage = images[currentlyCount - 1];
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
          `Mangas/${favorite.folder_name}/${chapter?.number}/${(
            currentlyCount - 1
          )
            .toString()
            .padStart(3, "0")}.png`,
          path,
          {
            fromPathBaseDir: BaseDirectory.Download,
            toPathBaseDir: BaseDirectory.Document,
          },
        );
      } else {
        await $downloadManager.writePageBase64(
          currentlyImage,
          currentlyImagePath,
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
      //const [currentlyB64, nextB64] = await Promise.all([
      // $downloadManager.pathToBase64(images[currentlyCount - 1]),
      //$downloadManager.pathToBase64(images[currentlyCount]),
      //]);
      // newImage = await $downloadManager.joinBase64Images(currentlyB64, nextB64);
    } else {
      newImage = await $downloadManager.joinBase64Images(
        images[currentlyCount - 1],
        images[currentlyCount],
      );
    }
    currentlyImage = newImage;
    images[currentlyCount - 1] = newImage;
    images.splice(currentlyCount, 1);
    totalPage = images.length;
    toast.success("Images joined!", { duration: 600 });
  }

  function imgOnError(id: string) {
    const coverElement = document.getElementById(id);
    if (coverElement instanceof HTMLImageElement) {
      coverElement.src = "/myk.png";
    }
  }

  function gotoPage(page: string) {
    currentlyCount = 1;
    totalPage = 0;
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

  async function toggleView() {
    const pageToGo = currentlyCount;
    $viewMode = $viewMode === "single" ? "scroll" : "single";
    currentlyCount = pageToGo;
    currentlyImage = images[currentlyCount - 1];
    if ($viewMode === "scroll") {
      await delay(5);
      const id = (currentlyCount - 1).toString();
      const nextP = document.getElementById(id);
      pagesDiv?.scrollTo({ top: nextP?.offsetTop, behavior: "smooth" });
    }
    saveSettings();
  }

  async function loadB64() {
    images = await $downloadManager.getBase64Images(
      images,
      $downloadManager.getBaseUrl(favorite.source),
    );
    backupImages = [...images];
    currentlyImage = images[currentlyCount - 1];
    preloadNextChapter();
  }

  afterNavigate(async () => {
    favoriteId = page.params.favoriteId;
    chapterIndex = page.params.chapterIndex;
    extraTitle.set(
      chapter.title !== undefined
        ? `${chapter.number} # ${chapter.title}`
        : `${favorite.name} # ${chapter.number}`,
    );
    if (!isLocal) {
      toast.loading(
        `Loading ${favorite.type === "manga" ? "chapter" : "issue"} ${chapter?.number}`,
      );
      images = await $downloadManager.getChapterImages(chapter);
      loadB64();
    } else {
      images = await getLocalChapterImages();
    }
    backupImages = [...images];
    currentlyImage = images[currentlyCount - 1];
    totalPage = images.length;
    setChapterActivity(favorite.name);
    await addReadedBelow(chapter, $globalChapters, favorite, $readeds, true);
    const newReadeds = await ReadedDB.getReadeds(favorite);
    readeds.set(newReadeds);
    if (favorite.is_ultra_favorite) {
      loadFavoriteChapters(favorite);
    }
  });

  onMount(async () => {
    if ($autoEnterFullscreen) {
      await setFullscreen(true);
    }
    await refreshRawFavorites();
    setChapterActivity(favorite?.name);
    extraTitle.set(
      chapter.title !== undefined
        ? `${chapter.number} # ${chapter.title}`
        : `${favorite.name} # ${chapter.number}`,
    );
    if (!isLocal) {
      if (favorite.is_ultra_favorite) {
        if ($favoritesLoaded[favorite.id.toString()]?.nextImages.length > 0) {
          images = $favoritesLoaded[favorite.id.toString()]?.nextImages;
        } else {
          images = await $downloadManager.getChapterImages(chapter);
          loadB64();
        }
      } else {
        images = await $downloadManager.getChapterImages(chapter);
        loadB64();
      }
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
    if (favorite.is_ultra_favorite) {
      loadFavoriteChapters(favorite);
    }
  });

  function handleKeydown(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    const ctrl = event.metaKey || event.ctrlKey;
    if (!$openSearch) {
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
        } else nextPage();
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
      if (key === "w" && !ctrl) {
        fitMode.set($fitMode === "" ? "width" : "");
        saveSettings();
      }
      if (key === "+" || (event.ctrlKey && key === "=")) {
        $zoomLevel = Math.min(200, $zoomLevel + 10);
      }
      if (key === "-" || (event.ctrlKey && key === "-")) {
        $zoomLevel = Math.max(30, $zoomLevel - 10);
      }
      if (key === ">" && !isTheLastChapter) {
        handleGoChapter("next");
      }
      if (key === "<" && !isTheFirstChapter) {
        handleGoChapter("prev");
      }

      if (key === "v") {
        toggleView();
      }

      if (key === "f") {
        toggleFullscreen();
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
    },
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
<div
  class={cn(
    "bg-white dark:bg-background h-screen overflow-hidden",
    !$isFullscreen && $customTitlebar && "h-[calc(100vh-2.5rem)]",
  )}
>
  <div
    class="fixed w-screen h-full z-50 pointer-events-none flex justify-end items-center"
  >
    <Button
      effect="ringHover"
      class={cn(
        "h-24 mr-2 pointer-events-auto transition-all",
        currentlyCount === totalPage ? "translate-x-0" : "translate-x-16",
      )}
      disabled={isTheLastChapter}
      variant={isTheLastChapter ? "outline" : "default"}
      onclick={() => handleGoChapter("next")}
    >
      <Icon
        icon={isTheLastChapter ? "lucide:circle-x" : "lucide:arrow-right"}
      />
    </Button>
  </div>
  <div class="fixed w-screen h-screen p-6 flex justify-end items-start">
    <div
      class={cn(
        "flex gap-2 p-2 transition-all duration-400 rounded-2xl bg-secondary/30 backdrop-blur-sm",
        !$readerClock &&
          !$chapterPagesCounter &&
          !$chapterPercentage &&
          !$showCurrentChapter &&
          "size-0 opacity-0",
      )}
    >
      <Badge
        class={cn(
          "flex items-center justify-center h-9 rounded-xl place-content-center transition-all duration-300",
          !$readerClock && "w-0 m-0 p-0 -mx-[5px] opacity-0",
        )}
        variant="secondary"
      >
        <ScrollingValue
          classes={{
            root: cn("transition-all", !$readerClock && "w-0 m-0 p-0"),
          }}
          axis="y"
          format={(v) => (v < 10 ? `0${v}` : v)}
          value={hours}
        /><span class="text-lg mb-1">:</span><ScrollingValue
          classes={{
            root: cn("transition-all", !$readerClock && "w-0 m-0 p-0"),
          }}
          axis="y"
          format={(v) => (v < 10 ? `0${v}` : v)}
          value={minutes}
        />
      </Badge>
      <Badge
        class={cn(
          "h-9 rounded-xl place-content-center transition-all duration-300",
          !$chapterPercentage && "w-0 m-0 p-0 -mx-[5px] opacity-0",
        )}
        variant="secondary"
      >
        <SpringValue
          format="integer"
          value={isNaN(Math.round((currentlyCount / totalPage) * 100)) ||
          !isFinite(Math.round((currentlyCount / totalPage) * 100))
            ? 0
            : currentlyCount === 1 && totalPage === 1
              ? 100
              : Math.round((currentlyCount / totalPage) * 100)}
        />%
      </Badge>
      <Badge
        class={cn(
          "h-9 rounded-xl place-content-center transition-all duration-300",
          !$chapterPagesCounter && "w-0 m-0 p-0 -mx-[5px] opacity-0",
        )}
        variant="secondary"
      >
        <ScrollingValue
          classes={{
            root: cn("transition-all", !$chapterPagesCounter && "w-0 m-0 p-0"),
          }}
          axis="y"
          value={isNaN(currentlyCount) ? 0 : currentlyCount}
        />
        /
        <ScrollingValue
          classes={{
            root: cn("transition-all", !$chapterPagesCounter && "w-0 m-0 p-0"),
          }}
          axis="y"
          value={totalPage}
        />
      </Badge>
      {#key chapter?.number}
        <div
          class={cn(
            "min-w-9 transition-all duration-300",
            !$showCurrentChapter && "size-0 min-w-0 m-0 p-0 -mx-[4px]",
          )}
          in:fly={{ y: 15, duration: 400 }}
        >
          <Badge
            class={cn(
              "h-9 min-w-9 rounded-xl place-content-center transition-all duration-300",
              !$showCurrentChapter && "w-0 min-w-0 m-0 p-0 -mx-[5px] opacity-0",
            )}
            variant="secondary"
          >
            {chapter?.number}
          </Badge>
        </div>
      {/key}
    </div>
  </div>
  <div
    class={cn(
      "fixed h-screen w-screen p-6 flex justify-end items-start z-50 pointer-events-none transition-all duration-500",
      $openReadMenu ? "translate-x-0" : "translate-x-[14rem]",
    )}
  >
    <div class="flex h-44 items-center absolute mt-36">
      <div class="flex flex-col gap-3 justify-center">
        <Button
          class="w-3 rounded-l-full rounded-r-none pointer-events-auto"
          variant="ghost"
          onclick={(_) => {
            openReadMenu.set(!$openReadMenu);
            saveSettings();
          }}
          onmouseenter={() => {
            openReadMenu.set(!$openReadMenu);
            saveSettings();
          }}
        >
          <Icon
            class={cn(
              "!size-5 transition-all duration-700",
              $openReadMenu ? "rotate-180" : "rotate-0 opacity-50",
            )}
            icon="typcn:chevron-left"
          />
        </Button>
      </div>
      <div
        class="flex flex-col items-end justify-end bg-secondary/30 backdrop-blur-xl rounded-2xl gap-1 p-1"
      >
        <div class="flex gap-1">
          <Button
            class="w-11 pointer-events-auto"
            size="sm"
            variant="secondary"
            onclick={toggleView}
          >
            <Icon
              icon={$viewMode === "scroll"
                ? "lucide:scroll"
                : "lucide:book-open"}
            />
          </Button>

          <Button
            class="w-11 pointer-events-auto z-50"
            size="sm"
            variant="secondary"
            onclick={toggleFullscreen}
          >
            <Icon
              icon={$isFullscreen ? "lucide:minimize" : "lucide:maximize"}
            />
          </Button>

          <Button
            class="w-11 pointer-events-auto"
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
        <div class="flex gap-1">
          <Button
            class="w-[5.75rem] pointer-events-auto"
            size="sm"
            variant="secondary"
            disabled={isTheFirstChapter}
            onclick={() => handleGoChapter("prev")}
          >
            <Icon class="!size-4" icon="lucide:arrow-left" />
            Prev
          </Button>
          <Button
            class="w-[5.75rem] pointer-events-auto"
            size="sm"
            variant="secondary"
            disabled={isTheLastChapter}
            onclick={() => handleGoChapter("next")}
          >
            Next
            <Icon class="!size-4" icon="lucide:arrow-right" />
          </Button>
        </div>
        <div class="flex gap-1 z-30">
          <Button
            class="w-11 pointer-events-auto"
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
              class="!size-5"
              icon={$fitMode === "width"
                ? "tabler:arrow-autofit-content-filled"
                : "tabler:arrow-autofit-content"}
            />
          </Button>
          <Button
            class="w-11 pointer-events-auto"
            size="sm"
            variant="secondary"
            disabled={isLocal || $viewMode === "scroll"}
            onclick={resetImages}
          >
            <Icon class="!size-5" icon="ic:round-refresh" />
          </Button>
          <Button
            class="w-11 pointer-events-auto"
            size="sm"
            variant="secondary"
            disabled={isLocal || $viewMode === "scroll"}
            onclick={joinCurrentlyImageToNext}
          >
            <Icon class="!size-5" icon="fluent:image-split-24-filled" />
          </Button>
          <Button
            class="w-11 pointer-events-auto"
            size="sm"
            variant="secondary"
            onclick={favoriteImage}
          >
            <Icon
              class="!size-5"
              icon={downloadedImages
                .map((img) => img.name)
                .includes(currentlyImagePath)
                ? "tabler:photo-filled"
                : "tabler:photo"}
            />
          </Button>
        </div>
        <div class="flex gap-1">
          <div class="inline-flex gap-1 pointer-events-auto z-50">
            <Button
              class="w-11"
              size="sm"
              variant="secondary"
              disabled={$fitMode !== "" && $viewMode !== "scroll"}
              onclick={() => {
                $zoomLevel = Math.max(30, $zoomLevel - 10);
                saveSettings();
              }}
            >
              <Icon icon="lucide:minus" />
            </Button>
            <Button
              class="w-[5.75rem] flex justify-center"
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
              class="w-11"
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
        </div>
        <div
          class="h-9 flex gap-1 justify-end pointer-events-auto cursor-default"
        >
          <Badge
            class="w-[8.7rem] flex justify-center rounded-xl select-none"
            variant="secondary"
          >
            {favorite?.name
              ? favorite.name.length > 17
                ? favorite.name.substring(0, 17) + "..."
                : favorite.name
              : ""}
          </Badge>
          <Badge
            class="w-11 px-5 flex justify-center items-center rounded-xl select-none"
            variant="secondary"
          >
            {chapter?.number.toString()}
          </Badge>
        </div>
        <div class="w-full flex flex-col items-start gap-2">
          <div
            class="w-full inline-flex gap-3 items-center pointer-events-auto"
          >
            <Switch
              id="chapter-count"
              bind:checked={$chapterPagesCounter}
              onCheckedChange={saveSettings}
            />
            <Label class="cursor-pointer select-none" for="chapter-count"
              >Pages count</Label
            >
          </div>
          <div
            class="w-full inline-flex gap-3 items-center pointer-events-auto"
          >
            <Switch
              id="chapter-percentage"
              bind:checked={$chapterPercentage}
              onCheckedChange={saveSettings}
            />
            <Label class="cursor-pointer select-none" for="chapter-percentage">
              Reading percentage
            </Label>
          </div>
          <div
            class="w-full inline-flex gap-3 items-center pointer-events-auto"
          >
            <Switch
              id="show-current-chapter"
              bind:checked={$showCurrentChapter}
              onCheckedChange={saveSettings}
            />
            <Label
              class="cursor-pointer select-none"
              for="show-current-chapter"
            >
              Chapter number
            </Label>
          </div>
          <div
            class="w-full inline-flex gap-3 items-center pointer-events-auto"
          >
            <Switch
              id="reader-clock"
              bind:checked={$readerClock}
              onCheckedChange={saveSettings}
            />
            <Label class="cursor-pointer select-none" for="reader-clock"
              >Show clock</Label
            >
          </div>
        </div>
      </div>
    </div>
  </div>

  {#if $viewMode === "scroll"}
    <div
      class="w-full overflow-y-auto scrollbar"
      bind:this={pagesDiv}
      style="height: 100vh;"
      onscroll={handleScroll}
    >
      <div class="flex flex-col items-center">
        {#each images as image, index (index)}
          <Image
            id={index.toString()}
            onerror={() => imgOnError(index.toString())}
            src={image}
            alt="Page {index + 1}"
            class="select-none"
            style="width: {$zoomLevel - 20}%; margin: 0 auto;"
          />
        {/each}
      </div>
    </div>
  {:else}
    <!-- svelte-ignore a11y_consider_explicit_label -->
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
        if ($fitMode === "") return;
        if (e.deltaY > 0) {
          nextPage();
        } else {
          prevPage();
        }
      }}
    >
    </button>
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
    {#if $fitMode === "width"}
      <div class="h-full w-full overflow-hidden">
        <div
          class="min-h-full w-full flex items-center justify-center overflow-hidden"
        >
          <Image
            id={currentlyCount.toString()}
            onerror={() => imgOnError(currentlyCount.toString())}
            src={currentlyImage}
            alt="manga"
            class={cn(
              "object-contain transition-all duration-200",
              $isFullscreen || !$customTitlebar
                ? "h-screen"
                : "h-[calc(100vh-2.5rem)]",
            )}
          />
        </div>
      </div>
    {:else}
      <div class="h-full w-full overflow-y-auto scrollbar">
        <div
          class="min-h-full flex items-center content-center place-content-center justify-center"
        >
          <Image
            id={currentlyCount.toString()}
            onerror={() => imgOnError(currentlyCount.toString())}
            src={currentlyImage}
            alt="manga"
            class="select-none transition-all duration-200"
            style="width: {$zoomLevel - 20}%;"
          />
        </div>
      </div>
    {/if}
  {/if}
</div>

{#each images as image, i (i)}
  <img
    id={i.toString()}
    onerror={() => imgOnError(i.toString())}
    class="hidden"
    src={image}
    alt="Prefetched"
    data-sveltekit-prefetch
  />
{/each}
