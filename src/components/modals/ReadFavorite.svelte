<script lang="ts">
  import { goto } from "$app/navigation";
  import { openPath, openUrl } from "@tauri-apps/plugin-opener";
  import { downloadDir, join } from "@tauri-apps/api/path";
  import { VList } from "virtua/svelte";
  import {
    exists,
    readDir,
    BaseDirectory,
    type DirEntry,
  } from "@tauri-apps/plugin-fs";
  import Icon from "@iconify/svelte";
  import { Badge as BadgeCount, ScrollingValue } from "svelte-ux";
  import { Dialog, Button, Input, Badge, Label } from "@/lib/components";
  import {
    ChapterButton,
    Image,
    Tooltip,
    Language,
    Select,
    PickReaded,
  } from "@/components";
  import {
    readeds,
    openSearch,
    downloadings,
    globalChapters,
    downloadManager,
    preferableLanguage,
    isChaptersDescending,
    downloadPath,
    customTitlebar,
    sidebarBehavior,
    isChaptersUniqueNumber,
    sidebarSide,
    rawFavorites,
  } from "@/store";
  import { FavoriteDB, ReadedDB } from "@/repositories";
  import {
    addReadedBelow,
    isReaded,
    loadFavoriteChapters,
    refreshReadeds,
    stopDiscordPresence,
    setDiscordActivity,
    refreshFavorites,
    refreshLibrary,
    saveSettings,
    removeFavorite,
    copyText,
    refreshRawFavorites,
  } from "@/functions";
  import type { Favorite, Chapter, Language as LanguageType } from "@/types";
  import {
    IS_MOBILE,
    LANGUAGE_LABELS,
    READSOURCES_LANGUAGE,
  } from "@/constants";
  import { getBool, imageFail, limitStr } from "@/utils";
  import { cn } from "@/lib/utils";
  import { load, Store } from "@tauri-apps/plugin-store";
  import { IsMobile } from "@/lib/hooks";

  let { favorite, open = $bindable(false) }: Props = $props();

  let isMulti = $state(false);
  let localSelectedLanguage = $state($preferableLanguage);
  let languageOptions: LanguageType[] = $state([]);
  let downloaded: DirEntry[] = $state([]);
  let searchTerm = $state("");
  let isUltraFavorite = $state(Boolean(favorite.is_ultra_favorite));
  let chaptersMode: "web" | "local" = $state("web");
  let jsonChapters: { [key: string]: Chapter } = $state({});
  let favoritePath = $derived(
    $downloadPath === "Mangas/"
      ? `Mangas/${favorite.folder_name}`
      : `${$downloadPath}/${favorite.folder_name}`,
  );
  let scans: string[] = $derived(
    Array.from(
      new Set(
        $globalChapters.map((c) => c?.scan ?? "").filter((v) => v !== ""),
      ),
    ),
  );
  let selectedScan = $state("");
  let chaptersDl = $derived(
    downloaded
      .filter((d) => jsonChapters[d.name])
      .map((d) => ({
        ...jsonChapters[d.name],
        path: `${favoritePath}/${d.name}`,
      }))
      .toReversed(),
  );
  let displayedChapters: Chapter[] = $derived.by(() => {
    if (!$isChaptersUniqueNumber || selectedScan !== "") {
      return $globalChapters.filter(
        (chapter) =>
          (chapter.number?.toString().includes(searchTerm) ||
            chapter.title?.toLowerCase().includes(searchTerm) ||
            (chapter.number === null && chapter.title === null)) &&
          (selectedScan === "" || chapter?.scan === selectedScan),
      );
    }
    const seenNumbers = new Set();
    return $globalChapters.filter((chapter) => {
      if (
        (chapter.number?.toString().includes(searchTerm) ||
          chapter.title?.toLowerCase().includes(searchTerm) ||
          (chapter.number === null && chapter.title === null)) &&
        !seenNumbers.has(chapter.number)
      ) {
        seenNumbers.add(chapter.number);
        return true;
      }
      return false;
    });
  });
  let displayedLocalChapters: Chapter[] = $derived(
    chaptersDl
      .filter(
        (chapter) => chapter.number?.toString()?.includes(searchTerm) ?? false,
      )
      .toReversed(),
  );
  let chaptersToPick: Chapter[] = $derived(
    chaptersMode === "web" ? displayedChapters : displayedLocalChapters,
  );
  let nextChapter: Chapter | undefined = $derived(
    chaptersMode === "web"
      ? displayedChapters
          .toReversed()
          .find((chapter) => !isReaded(chapter, $readeds))
      : chaptersDl.toReversed().find((chapter) => !isReaded(chapter, $readeds)),
  );
  let isNextDownloaded = $derived(
    downloaded.map((d) => d.name).includes(nextChapter?.number ?? ""),
  );
  let store: Store = $state(null!);
  let chaptersLength = $derived(
    chaptersMode === "web" ? $globalChapters.length : chaptersDl.length,
  );
  let loaded = $state("");
  let isFetching = $state(false);

  interface Props {
    favorite: Favorite;
    open: boolean;
  }

  interface Event {
    stopPropagation: () => void;
  }

  function isDownloading(chapter: Chapter) {
    if ($downloadings[favorite.id] === undefined) return false;
    return (
      $downloadings[favorite.id].downloading.find(
        (dl) => dl.chapter_id === chapter.chapter_id,
      ) !== undefined
    );
  }

  function initDownloadings() {
    if ($downloadings[favorite.id] === undefined) {
      downloadings.update((d) => ({
        ...d,
        [favorite.id]: {
          chapters: $globalChapters,
          fav: favorite,
          isDownloadingAll: false,
          downloadQueue: [],
          downloading: [],
        },
      }));
    }
  }

  function pushDownloading(chapter: Chapter) {
    initDownloadings();
    downloadings.update((d) => ({
      ...d,
      [favorite.id]: {
        ...d[favorite.id],
        downloading: [...d[favorite.id].downloading, chapter],
      },
    }));
  }

  function removeDownloading(chapter: Chapter) {
    initDownloadings();
    downloadings.update((d) => ({
      ...d,
      [favorite.id]: {
        ...d[favorite.id],
        downloading: d[favorite.id].downloading.filter(
          (c) => c.chapter_id !== chapter.chapter_id,
        ),
      },
    }));
  }

  async function refreshDownloadeds() {
    if ($downloadPath === "Mangas/") {
      if (await exists(favoritePath, { baseDir: BaseDirectory.Download })) {
        downloaded = (
          await readDir(favoritePath, {
            baseDir: BaseDirectory.Download,
          })
        ).sort((a, b) => Number(a.name) - Number(b.name));
      }
    } else {
      if (await exists(favoritePath)) {
        downloaded = (await readDir(favoritePath)).sort(
          (a, b) => Number(a.name) - Number(b.name),
        );
      }
    }
  }
  async function refreshJsonChapters() {
    jsonChapters = Object.fromEntries(await store.entries()) as {
      [key: string]: Chapter;
    };
    // displayedLocalChapters = chaptersDl;
    // search();
  }

  async function downloadAll() {
    await saveResult(favorite);
    const maxCurrently = 5;
    let downloadingNow = 0;
    const reversedChapters = $globalChapters.slice().reverse();
    let chaptersToDownload: Chapter[] = [];
    reversedChapters.forEach((chapter) => {
      if (!downloaded.find((d) => d.name === chapter.number)) {
        chaptersToDownload.push(chapter);
      }
    });
    if (chaptersToDownload.length === 0) return;
    initDownloadings();
    $downloadings[favorite.id].isDownloadingAll = true;
    $downloadings[favorite.id].downloadQueue = chaptersToDownload;

    const processQueue = async () => {
      const downloadPromises = new Set<Promise<void>>();
      while (
        $downloadings[favorite.id].downloadQueue.length > 0 ||
        downloadPromises.size > 0
      ) {
        while (
          downloadPromises.size < maxCurrently &&
          $downloadings[favorite.id].downloadQueue.length > 0
        ) {
          const chapter = $downloadings[favorite.id].downloadQueue.shift();
          if (!chapter) continue;

          downloadingNow += 1;
          pushDownloading(chapter);

          const downloadPromise = (async () => {
            try {
              await $downloadManager.downloadChapter(chapter, favorite, store);
              await refreshDownloadeds();
              refreshJsonChapters();
            } catch (error) {
              console.error(
                `Failed to download chapter ${chapter.number}:`,
                error,
              );
            } finally {
              removeDownloading(chapter);
              downloadingNow -= 1;
            }
          })();

          downloadPromises.add(downloadPromise);
          downloadPromise.finally(() =>
            downloadPromises.delete(downloadPromise),
          );
        }
        await new Promise((resolve) => setTimeout(resolve, 70));
      }
      $downloadings[favorite.id].isDownloadingAll = false;
    };

    processQueue();
  }

  // function search() {
  //   if (searchTerm === "") {
  //     displayedLocalChapters = chaptersDl;
  //     displayedChapters = $globalChapters;
  //     return;
  //   }
  //   displayedChapters = $globalChapters
  //     .filter((chapter) => chapter.number?.toString().includes(searchTerm))
  //     .toReversed();
  //   displayedLocalChapters = chaptersDl
  //     .filter(
  //       (chapter) => chapter.number?.toString()?.includes(searchTerm) ?? false,
  //     )
  //     .toReversed();
  // }

  const loadUltraFavorite = async () => {
    isUltraFavorite = getBool(favorite.is_ultra_favorite);
  };

  async function onOpened() {
    loadUltraFavorite();
    isFetching = true;
    setDiscordActivity("Selecting a chapter:", `[${favorite.name}]`);
    globalChapters.set([]);
    store = await load(`Mangas/${favorite.folder_name}/chapters.json`);
    await refreshDownloadeds();
    refreshJsonChapters();
    isMulti = $downloadManager.isMultiLanguage(favorite.source);
    if (isMulti) {
      const lastReaded = await ReadedDB.getLastReaded(favorite);
      let chapters: Chapter[] = [];
      if (lastReaded?.language) {
        localSelectedLanguage.id = lastReaded.language;
        localSelectedLanguage.label = LANGUAGE_LABELS[lastReaded.language];
        [chapters, languageOptions] = await Promise.all([
          $downloadManager.getChapters(favorite, lastReaded.language),
          $downloadManager.getFavoriteLanguages(favorite),
        ]);
      } else {
        localSelectedLanguage = $preferableLanguage;
        [chapters, languageOptions] = await Promise.all([
          $downloadManager.getChapters(favorite, $preferableLanguage.id),
          $downloadManager.getFavoriteLanguages(favorite),
        ]);
        if (
          !languageOptions.find((lang) => lang.id === localSelectedLanguage.id)
        ) {
          if (languageOptions.length === 0) {
            return;
          } else {
            localSelectedLanguage = languageOptions[0];
          }
          chapters = await $downloadManager.getChapters(
            favorite,
            languageOptions[0].id,
          );
        }
      }
      globalChapters.set(chapters);
    } else {
      languageOptions = [
        { id: "", label: READSOURCES_LANGUAGE[favorite.source] },
      ];
      localSelectedLanguage.label = READSOURCES_LANGUAGE[favorite.source];
      const result = await $downloadManager.getChapters(favorite);
      await new Promise((resolve) => setTimeout(resolve, 10));
      globalChapters.set(result);
    }
    // displayedChapters = $globalChapters;
    await refreshReadeds(favorite);
    isFetching = false;
    loaded = favorite.source + favorite.source_id;
  }
  const isMobileInstance = new IsMobile();
  const isMobile = $derived(isMobileInstance.current);
  function isFavorite(favorite: Favorite) {
    return $rawFavorites.find(
      (f) => f.source_id === favorite.source_id && f.source === favorite.source,
    );
  }

  async function saveResult(result: Favorite) {
    if (!isFavorite(result)) {
      favorite = await FavoriteDB.createFavorite(result);
      refreshRawFavorites();
      refreshLibrary();
    }
  }

  $effect(() => {
    if (open && loaded !== favorite.source + favorite.source_id) {
      onOpened();
    } else {
      selectedScan = "";
    }
  });
</script>

{#snippet chapterControls()}
  <div
    class={cn(
      "flex w-[40vw] items-center justify-between gap-1",
      isMobile && "flex-col",
    )}
  >
    <div class="flex w-[40%]">
      <div
        class="w-full flex items-center px-2 rounded-2xl border border-secondary bg-background/30 hover:bg-secondary"
      >
        <Button
          class={cn(
            "!size-6 px-0 -top-0.5 right-0 transition-all duration-400 pointer-events-none",
            searchTerm !== "" && "pointer-events-auto",
          )}
          variant="ghost"
          onclick={() => {
            searchTerm = "";
          }}
        >
          <Icon icon={searchTerm === "" ? "lucide:search" : "lucide:x"} />
        </Button>
        <Input
          class="w-full max-w-full"
          divClass="w-full"
          placeholder="Search..."
          floatingLabel
          variant="link"
          bind:value={searchTerm}
          tabindex={IS_MOBILE ? -1 : 1}
        />
      </div>
    </div>

    <div class="flex gap-0.5 sm:gap-2 items-center">
      <Select
        class="max-w-[11vw]"
        classRoot="hidden md:flex"
        bind:selected={selectedScan}
        items={scans}
        wheelControls
        disabled={chaptersMode === "local"}
        label="Select scan"
      />
      <Tooltip
        text={$isChaptersUniqueNumber
          ? "Show repeated chapters"
          : "Hide repeated chapters"}
      >
        <Button
          class="hidden md:flex size-11"
          variant="secondary"
          disabled={chaptersMode === "local" || selectedScan !== ""}
          onclick={() => {
            isChaptersUniqueNumber.set(!$isChaptersUniqueNumber);
            saveSettings();
          }}
        >
          <Icon
            class="!size-6"
            icon={$isChaptersUniqueNumber
              ? "line-md:text-box"
              : "line-md:text-box-multiple"}
          />
        </Button>
      </Tooltip>
      <Button
        class="hidden md:flex size-11"
        variant="secondary"
        onclick={() => {
          isChaptersDescending.set(!$isChaptersDescending);
          saveSettings();
        }}
      >
        <Icon
          class={cn(
            "!size-6 duration-300 transition-all",
            $isChaptersDescending ? "rotate-0" : "rotate-180",
          )}
          icon="typcn:arrow-sorted-down"
        />
      </Button>
      <Tooltip text="Web / downloaded chapters">
        <div
          class="relative flex items-center justify-center mr-1 p-1 gap-1 bg-secondary rounded-2xl z-10"
        >
          <div class="z-[1] absolute w-full h-9">
            <div
              class={cn(
                "size-9 bg-white mx-1 rounded-xl transition-all duration-300 translate-x-0",
                chaptersMode === "local" && "translate-x-10",
              )}
            ></div>
          </div>
          <Button
            class={cn(
              "z-[2] rounded-xl bg-transparent w-9 h-9 transition-colors duration-300 hover:bg-secondary/30",
              chaptersMode === "web" && "!text-black",
            )}
            size="sm"
            onclick={() => (chaptersMode = "web")}
            variant="secondary"
          >
            <Icon class="!size-5" icon="tabler:world" />
          </Button>
          <Button
            class={cn(
              "z-[2] rounded-xl bg-transparent w-9 h-9 transition-colors duration-300 hover:bg-secondary/30",
              chaptersMode === "local" && "!text-black",
            )}
            size="sm"
            onclick={() => (chaptersMode = "local")}
            variant="secondary"
          >
            <Icon class="!size-5" icon="tabler:file-download" />
          </Button>
        </div>
      </Tooltip>
      {#if isMobile}
        <PickReaded {favorite} readeds={$readeds} chapters={chaptersToPick} />
      {/if}
    </div>
  </div>
  <div class="flex w-[40vw] items-center justify-between">
    <Select
      class="w-32"
      classRoot="flex md:hidden"
      bind:selected={selectedScan}
      items={scans}
      wheelControls
      disabled={chaptersMode === "local"}
      label="Select scan"
    />
    <div class="flex gap-2">
      <Tooltip
        text={$isChaptersUniqueNumber
          ? "Show repeated chapters"
          : "Hide repeated chapters"}
      >
        <Button
          class="flex md:hidden size-11"
          variant="secondary"
          disabled={chaptersMode === "local" || selectedScan !== ""}
          onclick={() => {
            isChaptersUniqueNumber.set(!$isChaptersUniqueNumber);
            saveSettings();
          }}
        >
          <Icon
            class="!size-6"
            icon={$isChaptersUniqueNumber
              ? "line-md:text-box"
              : "line-md:text-box-multiple"}
          />
        </Button>
      </Tooltip>
      <Button
        class="flex md:hidden size-11"
        variant="secondary"
        onclick={() => {
          isChaptersDescending.set(!$isChaptersDescending);
          saveSettings();
        }}
      >
        <Icon
          class={cn(
            "!size-6 duration-300 transition-all",
            $isChaptersDescending ? "rotate-0" : "rotate-180",
          )}
          icon="typcn:arrow-sorted-down"
        />
      </Button>
    </div>
  </div>
  <div class="flex w-[40vw] justify-start gap-1">
    <div class="w-[calc(40vw-5rem)] flex rounded-xl bg-secondary">
      <Button
        class={cn(
          "chapter-button w-full flex justify-between items-center rounded-xl group transition-all duration-500 hover:bg-gray-200 hover:opacity-100 dark:hover:bg-background/70",
          nextChapter === undefined ? "cursor-default" : "",
        )}
        variant="secondary"
        size="sm"
        onclick={async () => {
          await saveResult(favorite);
          if (nextChapter) {
            const originalIndex =
              chaptersMode === "web"
                ? $globalChapters.findIndex(
                    (c) => c.chapter_id === nextChapter.chapter_id,
                  )
                : chaptersDl.findIndex(
                    (c) => c.chapter_id === nextChapter.chapter_id,
                  );
            goto(`/reader/${favorite.id}/${originalIndex}`);
            open = false;
            openSearch.set(false);
          }
        }}
      >
        <div class="flex items-center gap-2 w-full">
          <div class="flex items-center justify-between w-full gap-2">
            <div class="flex justify-start items-center gap-2">
              <Tooltip
                text={nextChapter !== undefined
                  ? isDownloading(nextChapter)
                    ? "Downloading..."
                    : isNextDownloaded
                      ? "Open folder"
                      : "Download"
                  : "No chapter"}
              >
                <Button
                  class="h-7 w-7"
                  variant="ghost"
                  size="sm"
                  tabindex={-1}
                  disabled={nextChapter
                    ? isDownloading(nextChapter) && !isNextDownloaded
                    : true}
                  onclick={async (e) => {
                    e.stopPropagation();
                    await saveResult(favorite);
                    if (nextChapter === undefined) return;
                    if (!isNextDownloaded) {
                      pushDownloading(nextChapter);
                      await $downloadManager.downloadChapter(
                        nextChapter,
                        favorite,
                        store,
                      );
                      await refreshDownloadeds();
                      removeDownloading(nextChapter);
                      refreshJsonChapters();
                    } else {
                      if ($downloadPath === "Mangas/") {
                        const path = await join(
                          await downloadDir(),
                          "Mangas",
                          favorite.folder_name,
                          nextChapter.number,
                        );
                        openPath(path);
                      } else {
                        const path = await join(
                          $downloadPath,
                          favorite.folder_name,
                          nextChapter.number,
                        );
                        openPath(path);
                      }
                    }
                  }}
                  ><Icon
                    icon={nextChapter
                      ? isDownloading(nextChapter) &&
                        !downloaded
                          .map((d) => d.name)
                          .includes(nextChapter?.number ?? "")
                        ? "line-md:loading-alt-loop"
                        : isNextDownloaded
                          ? "lucide:folder-check"
                          : "lucide:download"
                      : ""}
                    class="w-5 h-5"
                  />
                </Button>
              </Tooltip>
              <span
                class="group-hover:underline group-hover:underline-offset-4 truncate w-9 text-start"
              >
                {nextChapter !== undefined ? nextChapter.number : ""}
              </span>
            </div>
            <Tooltip text={nextChapter?.title}>
              <span
                class="group-hover:underline group-hover:underline-offset-4 truncate w-[60%] text-start"
              >
                {nextChapter !== undefined
                  ? nextChapter.title
                  : chaptersLength === 0
                    ? "No chapters..."
                    : "All clear!"}
              </span>
            </Tooltip>
            <Tooltip text={nextChapter ? "Mark as read" : ""}>
              <Button
                class="h-7 w-7"
                variant="ghost"
                size="sm"
                disabled={nextChapter
                  ? isDownloading(nextChapter) && !isNextDownloaded
                  : true}
                tabindex={-1}
                onclick={async (e) => {
                  e.stopPropagation();
                  await saveResult(favorite);
                  if (nextChapter) {
                    await addReadedBelow(
                      nextChapter,
                      $globalChapters,
                      favorite,
                    );
                    await refreshReadeds(favorite);
                  }
                }}
              >
                <Icon
                  icon={nextChapter ? "ic:round-keyboard-arrow-right" : ""}
                  class="!size-7"
                />
              </Button>
            </Tooltip>
          </div>
        </div>
      </Button>
    </div>
    {#if !isMobile}
      <PickReaded {favorite} readeds={$readeds} chapters={chaptersToPick} />
    {/if}
  </div>
{/snippet}

<Dialog.Root
  bind:open
  onOpenChange={() => {
    loaded = "";
    if (isUltraFavorite) loadFavoriteChapters(favorite);
    refreshFavorites();
    refreshLibrary();
    stopDiscordPresence();
  }}
>
  <Dialog.Content
    class={cn(
      "data-[state=open]:!zoom-in-100 data-[state=closed]:!zoom-out-100 data-[state=open]:slide-in-from-right-full data-[state=closed]:slide-out-to-right-full data-[state=open]:duration-500 data-[state=close]:duration-500",
      "h-[100vh] max-w-[100vw] py-4 px-6 duration-400",
      $sidebarBehavior === "expand"
        ? $sidebarSide === "left"
          ? "w-[calc(100vw-11rem)] lg:w-[calc(80vw-11rem)] ml-[3.2rem] !mr-[2rem]"
          : "w-[calc(100vw-11rem)] lg:w-[calc(80vw-11rem)] mr-[6rem] !ml-[0rem]"
        : $sidebarSide === "left"
          ? "w-[calc(100vw-6rem)] lg:w-[calc(80vw-6rem)] ml-[1rem] !mr-[2rem]"
          : "w-[calc(100vw-6rem)] lg:w-[calc(80vw-6rem)] mr-[4rem] !ml-[0rem]",
      $customTitlebar && "h-[calc(100vh-3.5rem)] mt-[1.2rem]",
      isMobile && "flex flex-col items-center h-[90vh]",
    )}
    closeButton={false}
    overlayClass="bg-black/50 !transition-colors duration-400"
  >
    <!-- <Dialog.Header> -->
    <!--   <Dialog.Title -->
    <!--     class="group !bg-transparent w-full flex justify-center items-center dark:text-white select-none hover:cursor-text" -->
    <!--     onclick={() => { -->
    <!--       copyText(favorite.name, "title"); -->
    <!--     }} -->
    <!--   > -->
    <!--     {limitStr(favorite.name, 40)} -->
    <!--     <Icon -->
    <!--       class="!size-0 ml-2  group-hover:!size-4 transition-all duration-300" -->
    <!--       icon="ic:baseline-content-copy" -->
    <!--     /> -->
    <!--   </Dialog.Title> -->
    <!--   <!-- <Dialog.Description -->
    <!--     >Change your favorites attributes and save it.</Dialog.Description -->
    <!--   > -->
    <!-- </Dialog.Header> -->
    <div class="w-full h-full relative">
      <div
        class="absolute flex w-full h-full justify-end pointer-events-none px-8 sm:px-4 md:px-0"
      >
        <Button
          class="bg-background/60 border-0.5 pointer-events-auto"
          variant="outline"
          onclick={() => (open = false)}
        >
          Back
          <Icon class="rotate-180" icon="ion:caret-back" />
        </Button>
      </div>
      <div
        class={cn(
          "flex w-full h-full items-center",
          isMobile ? "flex-row-reverse justify-start gap-2" : "justify-center",
        )}
      >
        <div
          class={cn(
            "flex flex-col h-full items-end gap-2 w-2/5",
            isMobile ? "w-full justify-center " : "justify-center pr-10",
          )}
        >
          <div
            class="w-full max-w-80 h-full max-h-[30rem] ssmh:max-w-52 sssmh:max-w-32 flex justify-center items-center overflow-hidden transition-all"
          >
            <Image
              draggable={false}
              src={favorite.cover}
              alt={favorite.name}
              class="w-full h-full object-contain select-none"
            />
          </div>
          <div
            class={cn(
              "flex flex-col w-full max-w-80 items-center gap-2",
              isMobile && "justify-end p-2 h-full",
            )}
          >
            <div class="w-full relative">
              <Language
                class="min-w-full max-w-full w-full mt-1"
                bind:selectedLanguage={localSelectedLanguage}
                {languageOptions}
                onChange={async () => {
                  isFetching = true;
                  selectedScan = "";
                  const result = await $downloadManager.getChapters(
                    favorite,
                    localSelectedLanguage.id,
                  );
                  await refreshReadeds(favorite);
                  await new Promise((resolve) => setTimeout(resolve, 10));
                  // displayedChapters = result;
                  globalChapters.set(result);
                  isFetching = false;
                }}
                wheelControls
                disabled={!isMulti || isFetching || languageOptions.length < 2}
              />
              <div
                class="absolute top-0 size-5 text-sm font-semibold bg-primary/70 text-background flex justify-center items-center rounded-full"
              >
                {languageOptions.length}
              </div>
            </div>
            <Button
              class="w-full"
              variant="outline"
              effect="hoverUnderline"
              onclick={() => openUrl(favorite.link)}
            >
              <span class="truncate">
                {favorite.source ?? "Open"}
              </span>
            </Button>
            <div class="flex gap-2 w-full">
              <Tooltip
                text={isUltraFavorite ? "Remove favorite" : "Add to favorites"}
              >
                <Button
                  class="flex gap-2 w-12 relative"
                  variant="outline"
                  onclick={async (e: Event) => {
                    e.stopPropagation();
                    await saveResult(favorite);
                    isUltraFavorite = !isUltraFavorite;
                    favorite.is_ultra_favorite = isUltraFavorite;
                    isUltraFavorite = await FavoriteDB.toggleUltraFavorite(
                      favorite,
                      false,
                    );
                  }}
                >
                  <Icon
                    class={cn(
                      "absolute !size-5 transition-all duration-500",
                      isUltraFavorite && "opacity-0 rotate-180 scale-0",
                    )}
                    icon="heroicons:star"
                  />
                  <Icon
                    class={cn(
                      "absolute !size-5 transition-all duration-500",
                      !isUltraFavorite && "opacity-0 -rotate-180 scale-0",
                    )}
                    icon="heroicons:star-solid"
                  />
                </Button>
              </Tooltip>
              <Button
                class="w-full"
                effect="ringHover"
                onclick={downloadAll}
                disabled={$downloadings[favorite.id]?.isDownloadingAll ?? false}
              >
                <Icon
                  icon={($downloadings[favorite.id]?.isDownloadingAll ?? false)
                    ? "line-md:loading-twotone-loop"
                    : "lucide:download"}
                />
                Download all
              </Button>
            </div>
            {#if isMobile}
              {@render chapterControls()}
            {/if}
          </div>
        </div>
        <div class={cn(isMobile ? "flex justify-start w-1/2" : "w-3/5")}>
          <div class="w-[40vw] flex flex-col gap-3">
            <Label
              class="group text-3xl !bg-transparent w-full flex justify-center items-center dark:text-white select-none hover:cursor-text"
              onclick={() => {
                copyText(favorite.name, "title");
              }}
            >
              <Icon
                class="!size-0 mr-2 group-hover:!size-5 transition-all duration-300"
                icon="ic:baseline-content-copy"
              />
              {limitStr(favorite.name, 60)}
            </Label>
            {#if !isMobile}
              {@render chapterControls()}
            {/if}
            <div
              class={cn(
                "bg-secondary rounded-xl relative overflow-hidden",
                isMobile ? "!h-[75vh] w-[15rem]" : "!h-[50vh] w-[40vw]",
              )}
            >
              <div
                class={cn(
                  "flex justify-center items-center absolute transition-all duration-300 ease-in-out",
                  chaptersMode === "web"
                    ? "translate-x-0"
                    : "-translate-x-full",
                  isMobile ? "!h-[75vh] w-[15rem]" : "!h-[50vh] w-[40vw]",
                )}
              >
                {#if isFetching}
                  <div
                    class={cn(
                      "h-full flex flex-col justify-start items-start",
                      isMobile ? "w-[15rem] " : "w-[40vw] p-0.5",
                    )}
                  >
                    <div
                      class={cn(
                        "flex items-center gap-1 p-2 h-9 rounded-xl bg-gray-300 dark:bg-background animate-pulse",
                        isMobile ? "w-[350px]" : "w-full",
                      )}
                    >
                      <div
                        class="!w-9 !h-7 animate-pulse rounded-xl bg-gray-100 dark:bg-secondary"
                      ></div>
                      <div class="w-full gap-0.5 flex flex-col">
                        <div
                          class="w-[80%] h-2 animate-pulse rounded-xl bg-gray-100 dark:bg-secondary"
                        ></div>
                        <div
                          class="w-[60%] h-1 animate-pulse rounded-xl bg-gray-100 dark:bg-secondary"
                        ></div>
                      </div>
                    </div>
                    <div
                      class={cn(
                        "flex items-center gap-1 p-2 h-9 rounded-xl bg-gray-300 dark:bg-background animate-pulse",
                        isMobile ? "w-[350px]" : "w-full",
                      )}
                    >
                      <div
                        class="!w-9 !h-7 animate-pulse rounded-xl bg-gray-100 dark:bg-secondary"
                      ></div>
                      <div class="w-full gap-0.5 flex flex-col">
                        <div
                          class="w-[65%] h-2 animate-pulse rounded-xl bg-gray-100 dark:bg-secondary"
                        ></div>
                        <div
                          class="w-[75%] h-1 animate-pulse rounded-xl bg-gray-100 dark:bg-secondary"
                        ></div>
                      </div>
                    </div>
                    <div
                      class={cn(
                        "flex items-center gap-1 p-2 h-9 rounded-xl bg-gray-300 dark:bg-background animate-pulse",
                        isMobile ? "w-[350px]" : "w-full",
                      )}
                    >
                      <div
                        class="!w-9 !h-7 animate-pulse rounded-xl bg-gray-100 dark:bg-secondary"
                      ></div>
                      <div class="w-full gap-0.5 flex flex-col">
                        <div
                          class="w-[70%] h-2 animate-pulse rounded-xl bg-gray-100 dark:bg-secondary"
                        ></div>
                        <div
                          class="w-[50%] h-1 animate-pulse rounded-xl bg-gray-100 dark:bg-secondary"
                        ></div>
                      </div>
                    </div>
                    <div
                      class={cn(
                        "flex items-center gap-1 p-2 h-9 rounded-xl bg-gray-300 dark:bg-background animate-pulse",
                        isMobile ? "w-[350px]" : "w-full",
                      )}
                    >
                      <div
                        class="!w-9 !h-7 animate-pulse rounded-xl bg-gray-100 dark:bg-secondary"
                      ></div>
                      <div class="w-full gap-0.5 flex flex-col">
                        <div
                          class="w-[55%] h-2 animate-pulse rounded-xl bg-gray-100 dark:bg-secondary"
                        ></div>
                        <div
                          class="w-[70%] h-1 animate-pulse rounded-xl bg-gray-100 dark:bg-secondary"
                        ></div>
                      </div>
                    </div>
                  </div>
                  <Icon
                    class="!w-16 !h-16 fixed text-gray-600 dark:text-white"
                    icon="line-md:loading-loop"
                  />
                {:else if displayedChapters.length === 0}
                  <Badge
                    class="w-32 h-16  m-5  flex justify-center text-center"
                    variant="destructive"
                  >
                    {searchTerm === ""
                      ? "No chapters found in this language!"
                      : `No chapters found with '${searchTerm}'`}
                  </Badge>
                {:else}
                  <VList
                    class="scrollbar-chapters overflow-x-hidden scroll-smooth"
                    data={!$isChaptersDescending || searchTerm !== ""
                      ? displayedChapters.toReversed()
                      : displayedChapters}
                    getKey={(_, i) => i}
                    overscan={20}
                    tabindex={-1}
                  >
                    {#snippet children(chapter, _)}
                      {@const isDownloaded = downloaded
                        .map((d) => d.name)
                        .includes(chapter.number)}
                      {@const isReadedHere =
                        isReaded(chapter, $readeds) !== undefined}
                      {@const isDownloadingHere = isDownloading(chapter)}
                      <ChapterButton
                        {chapter}
                        {isDownloaded}
                        isReaded={isReadedHere}
                        isDownloading={isDownloadingHere}
                        onclick={async () => {
                          await saveResult(favorite);
                          const originalIndex = $globalChapters.findIndex(
                            (c) => c.chapter_id === chapter.chapter_id,
                          );
                          goto(`/reader/${favorite.id}/${originalIndex}`);
                          open = false;
                          openSearch.set(false);
                        }}
                        ondownloadclick={async (e: Event) => {
                          e.stopPropagation();
                          await saveResult(favorite);
                          if (!isDownloaded) {
                            pushDownloading(chapter);
                            await $downloadManager.downloadChapter(
                              chapter,
                              favorite,
                              store,
                            );
                            removeDownloading(chapter);
                            await refreshDownloadeds();
                            refreshJsonChapters();
                          } else {
                            if ($downloadPath === "Mangas/") {
                              const path = await join(
                                await downloadDir(),
                                "Mangas",
                                favorite.folder_name,
                                chapter.number,
                              );
                              openPath(path);
                            } else {
                              const path = await join(
                                $downloadPath,
                                favorite.folder_name,
                                chapter.number,
                              );
                              openPath(path);
                            }
                          }
                        }}
                        onreadclick={async (e: Event) => {
                          e.stopPropagation();
                          await saveResult(favorite);
                          await addReadedBelow(
                            chapter,
                            $globalChapters,
                            favorite,
                            $readeds,
                          );
                          await refreshReadeds(favorite);
                        }}
                      />
                    {/snippet}
                  </VList>
                {/if}
              </div>
              <div
                class={cn(
                  "flex justify-center  absolute left-0 top-0 transition-all duration-300 ease-in-out",
                  chaptersMode === "local"
                    ? "translate-x-0"
                    : "translate-x-full",
                  isMobile ? "!h-[75vh] w-[15rem]" : "!h-[50vh] w-[40vw]",
                )}
              >
                {#if displayedLocalChapters.length === 0}
                  <Badge
                    class="w-32 h-16  m-5  flex justify-center text-center"
                    variant="destructive"
                  >
                    {searchTerm === ""
                      ? "No chapters downloaded found in this language!"
                      : `No chapters found with '${searchTerm}'`}
                  </Badge>
                {:else}
                  <VList
                    class="scrollbar-chapters overflow-x-hidden scroll-smooth"
                    data={$isChaptersDescending || searchTerm !== ""
                      ? displayedLocalChapters
                      : displayedLocalChapters.toReversed()}
                    getKey={(_, i) => i}
                    overscan={20}
                    tabindex={-1}
                  >
                    {#snippet children(chapter, i)}
                      {@const isReadedHere =
                        isReaded(chapter, $readeds) !== undefined}
                      <ChapterButton
                        {chapter}
                        isDownloaded
                        isReaded={isReadedHere}
                        isDownloading={false}
                        onclick={async () => {
                          await saveResult(favorite);
                          $globalChapters = chaptersDl;
                          const originalIndex = $globalChapters.findIndex(
                            (c) => c.chapter_id === chapter.chapter_id,
                          );
                          goto(`/reader/${favorite.id}/${originalIndex}?local`);
                          open = false;
                          openSearch.set(false);
                        }}
                        ondownloadclick={async (e: Event) => {
                          e.stopPropagation();
                          await saveResult(favorite);
                          if ($downloadPath === "Mangas/") {
                            const path = await join(
                              await downloadDir(),
                              "Mangas",
                              favorite.folder_name,
                              chapter.number,
                            );
                            openPath(path);
                          } else {
                            const path = await join(
                              $downloadPath,
                              favorite.folder_name,
                              chapter.number,
                            );
                            openPath(path);
                          }
                        }}
                        onreadclick={async (e: Event) => {
                          e.stopPropagation();
                          await saveResult(favorite);
                          await addReadedBelow(chapter, chaptersDl, favorite);
                          await refreshReadeds(favorite);
                        }}
                      />
                    {/snippet}
                  </VList>
                {/if}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>
