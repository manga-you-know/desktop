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
  import { ScrollingValue } from "svelte-ux";
  import {
    Dialog,
    ScrollArea,
    Button,
    Input,
    Separator,
    Badge,
    Skeleton,
  } from "@/lib/components";
  import { ChapterButton, Image, Tooltip, Language } from "@/components";
  import {
    readeds,
    openSearch,
    downloadings,
    globalChapters,
    downloadManager,
    preferableLanguage,
    isChaptersDescending,
    downloadPath,
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
  } from "@/functions";
  import type { Favorite, Chapter, Language as LanguageType } from "@/types";
  import {
    IS_MOBILE,
    LANGUAGE_LABELS,
    READSOURCES_LANGUAGE,
  } from "@/constants";
  import { imageFail, limitStr } from "@/utils";
  import { cn } from "@/lib/utils";
  import { load, Store } from "@tauri-apps/plugin-store";
  import { IsMobile } from "@/lib/hooks";

  let { favorite, open = $bindable(false) }: Props = $props();

  let isMulti = $state(false);
  let localSelectedLanguage = $state($preferableLanguage);
  let languageOptions: LanguageType[] = $state([]);
  let downloaded: DirEntry[] = $state([]);
  let searchTerm = $state("");
  let displayedChapters: Chapter[] = $state([]);
  let displayedLocalChapters: Chapter[] = $state([]);
  let isUltraFavorite = $state(Boolean(favorite.is_ultra_favorite));
  let chaptersMode: "web" | "local" = $state("web");
  let jsonChapters: { [key: string]: Chapter } = $state({});
  let favoritePath = $derived(
    $downloadPath === "Mangas/"
      ? `Mangas/${favorite.folder_name}`
      : `${$downloadPath}/${favorite.folder_name}`,
  );
  let chaptersDl = $derived(
    downloaded
      .filter((d) => jsonChapters[d.name])
      .map((d) => ({
        ...jsonChapters[d.name],
        path: `${favoritePath}/${d.name}`,
      }))
      .toReversed(),
  );
  let readedLenghtDisplayed: number = $derived(
    chaptersMode === "web"
      ? displayedChapters.filter((c) => isReaded(c, $readeds)).length
      : displayedLocalChapters.filter((c) => isReaded(c, $readeds)).length,
  );
  let nextChapter: Chapter | undefined = $derived(
    chaptersMode === "web"
      ? $globalChapters
          .toReversed()
          .find((chapter) => isReaded(chapter, $readeds) === undefined)
      : chaptersDl
          .toReversed()
          .find((chapter) => isReaded(chapter, $readeds) === undefined),
  );
  let isNextDownloaded = $derived(
    downloaded.map((d) => d.name).includes(nextChapter?.number ?? ""),
  );
  let store: Store = $state(null!);
  let chaptersLength = $derived(
    chaptersMode === "web" ? $globalChapters.length : chaptersDl.length,
  );
  let displayedChaptersLength = $derived(
    chaptersMode === "web"
      ? displayedChapters.length
      : displayedLocalChapters.length,
  );
  let isLoaded = $state(false);
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
    displayedLocalChapters = chaptersDl;
    search();
  }

  async function downloadAll() {
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

  function search() {
    if (searchTerm === "") {
      displayedLocalChapters = chaptersDl;
      displayedChapters = $globalChapters;
      return;
    }
    displayedChapters = $globalChapters
      .filter((chapter) => chapter.number?.toString().includes(searchTerm))
      .toReversed();
    displayedLocalChapters = chaptersDl
      .filter(
        (chapter) => chapter.number?.toString()?.includes(searchTerm) ?? false,
      )
      .toReversed();
  }

  const loadUltraFavorite = async () => {
    isUltraFavorite = await FavoriteDB.isUltraFavorite(favorite.id);
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
          localSelectedLanguage = languageOptions[0];
          chapters = await $downloadManager.getChapters(
            favorite,
            languageOptions[0].id,
          );
        }
      }
      globalChapters.set(chapters);
    } else {
      localSelectedLanguage.label = READSOURCES_LANGUAGE[favorite.source];
      const result = await $downloadManager.getChapters(favorite);
      await new Promise((resolve) => setTimeout(resolve, 10));
      globalChapters.set(result);
    }
    displayedChapters = $globalChapters;
    await refreshReadeds(favorite);
    isFetching = false;
    isLoaded = true;
  }
  const isMobileInstance = new IsMobile();
  const isMobile = $derived(isMobileInstance.current);
  $effect(() => {
    if (open && !isLoaded) {
      onOpened();
    } else {
    }
  });
</script>

{#snippet chapterControls()}
  <div
    class={cn("flex items-center justify-start gap-1", isMobile && "flex-col")}
  >
    <div class="flex">
      <div class="w-24 flex justify-start -ml-[6px]">
        <Input
          class="w-20"
          placeholder="Chapter..."
          oninput={search}
          floatingLabel
          variant="link"
          bind:value={searchTerm}
          tabindex={IS_MOBILE ? -1 : 1}
        />
        {#if searchTerm.length > 0}
          <Button
            variant="link"
            class="w-2 -ml-[12px]"
            onclick={() => {
              searchTerm = "";
              search();
            }}
          >
            <Icon icon="lucide:x" />
          </Button>
        {/if}
      </div>
      <Button
        class="w-11 h-11 mr-1"
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
    <div class="flex">
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
      {#if isMobile}
        <Badge
          variant="secondary"
          class="w-20 p-1 mr-1 flex justify-center select-none"
        >
          <ScrollingValue value={readedLenghtDisplayed} axis="y" />
          /
          <ScrollingValue value={displayedChaptersLength} axis="y" />
        </Badge>
      {/if}
    </div>
  </div>
  <div class="flex w-full justify-start gap-1">
    <div class="w-full flex rounded-xl bg-secondary">
      <Button
        class={cn(
          "chapter-button w-full flex justify-between items-center rounded-xl group transition-colors duration-500 hover:bg-background/60",
          nextChapter === undefined ? "cursor-default" : "",
        )}
        variant="secondary"
        size="sm"
        onclick={() => {
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
        <div class="flex items-center gap-2">
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
              class={cn("h-7 w-7", chaptersLength === 0 ? "hidden" : "")}
              variant="ghost"
              size="sm"
              tabindex={-1}
              disabled={nextChapter
                ? isDownloading(nextChapter) && !isNextDownloaded
                : true}
              onclick={async (e) => {
                e.stopPropagation();
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
            class={cn(
              "flex group-hover:underline group-hover:underline-offset-4 truncate",
              chaptersLength === 0
                ? "w-[100px] justify-end"
                : "w-16 text-start",
            )}
          >
            {nextChapter !== undefined
              ? nextChapter.number
              : chaptersLength === 0
                ? "No chapters..."
                : "All clear!"}
          </span>
        </div>
        <Tooltip text={nextChapter !== undefined ? "Mark readed" : ""}>
          <Button
            class="h-7 w-7 "
            variant="ghost"
            size="sm"
            tabindex={-1}
            disabled={nextChapter === undefined}
            onclick={async (e) => {
              e.stopPropagation();
              if (nextChapter) {
                await addReadedBelow(nextChapter, $globalChapters, favorite);
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
      </Button>
    </div>
    {#if !isMobile}
      <Badge
        variant="secondary"
        class="w-20 p-1 mr-1 flex justify-center rounded-xl select-none"
      >
        <ScrollingValue value={readedLenghtDisplayed} axis="y" />
        /
        <ScrollingValue value={displayedChaptersLength} axis="y" />
      </Badge>
    {/if}
  </div>
{/snippet}

<Dialog.Root
  bind:open
  onOpenChange={() => {
    isLoaded = false;
    if (isUltraFavorite) loadFavoriteChapters(favorite);
    refreshFavorites();
    refreshLibrary();
    stopDiscordPresence();
  }}
>
  <Dialog.Content class={cn(isMobile && "flex flex-col items-center h-[90vh]")}>
    <Dialog.Header>
      <Dialog.Title
        class="group !bg-transparent w-full flex justify-center items-center dark:text-white select-none hover:cursor-text"
        onclick={() => {
          copyText(favorite.name, "title");
        }}
      >
        {limitStr(favorite.name, 40)}
        <Icon
          class="!size-0 ml-2  group-hover:!size-4 transition-all duration-300"
          icon="ic:baseline-content-copy"
        />
      </Dialog.Title>
      <!-- <Dialog.Description
        >Change your favorites attributes and save it.</Dialog.Description
      > -->
    </Dialog.Header>
    <div
      class={cn(
        "flex w-full items-center",
        isMobile ? "flex-row-reverse justify-start gap-2" : "justify-center",
      )}
    >
      <div
        class={cn(
          " flex flex-col items-center gap-2 w-1/2",
          isMobile ? "w-full justify-center " : "justify-start pr-10",
        )}
      >
        <div class="w-40 h-70 flex justify-center">
          <Image
            draggable={false}
            src={favorite.cover}
            alt={favorite.name}
            class="w-40 h-70 object-contain rounded-xl bg-gray-950"
          />
        </div>
        <div
          class={cn(
            "flex flex-col items-center gap-2",
            isMobile && "justify-end p-2 h-full",
          )}
        >
          <Language
            class="mt-1"
            bind:selectedLanguage={localSelectedLanguage}
            {languageOptions}
            onChange={async () => {
              isFetching = true;
              const result = await $downloadManager.getChapters(
                favorite,
                localSelectedLanguage.id,
              );
              await refreshReadeds(favorite);
              await new Promise((resolve) => setTimeout(resolve, 10));
              displayedChapters = result;
              globalChapters.set(result);
              isFetching = false;
            }}
            wheelControls
            disabled={!isMulti || isFetching || languageOptions.length < 2}
          />
          <Button
            class="w-[165px]"
            variant="outline"
            effect="hoverUnderline"
            onclick={() => openUrl(favorite.link)}
          >
            <span class="truncate">
              {favorite.source ?? "Open"}
            </span>
          </Button>
          <div class="flex gap-2">
            <Button
              variant="outline"
              effect="ringHoverSecondary"
              onclick={async (e: Event) => {
                e.stopPropagation();
                isUltraFavorite = !isUltraFavorite;
                favorite.is_ultra_favorite = isUltraFavorite;
                isUltraFavorite = await FavoriteDB.toggleUltraFavorite(
                  favorite,
                  false,
                );
              }}
            >
              <Icon
                class="!size-5 -mx-[5px]"
                icon={isUltraFavorite
                  ? "fluent:star-emphasis-32-filled"
                  : "fluent:star-emphasis-32-regular"}
              />
            </Button>
            <Button
              effect="ringHover"
              onclick={downloadAll}
              disabled={$downloadings[favorite.id]?.isDownloadingAll ?? false}
            >
              <Icon
                icon={($downloadings[favorite.id]?.isDownloadingAll ?? false)
                  ? "line-md:loading-twotone-loop"
                  : "lucide:download"}
              />
              Download
            </Button>
          </div>
          {#if isMobile}
            {@render chapterControls()}
          {/if}
        </div>
      </div>
      <div class={isMobile ? "flex justify-center w-1/2" : "w-1/2"}>
        <div class="w-54 flex flex-col gap-1">
          {#if !isMobile}
            {@render chapterControls()}
          {/if}
          <div
            class={cn(
              "bg-secondary rounded-xl relative overflow-hidden",
              isMobile ? "!h-[75vh] w-[15rem]" : "!h-[19rem] w-[14.2rem] ",
            )}
          >
            <div
              class={cn(
                "flex justify-center items-center absolute transition-all duration-300 ease-in-out",
                chaptersMode === "web" ? "translate-x-0" : "-translate-x-full",
                isMobile ? "!h-[75vh] w-[15rem]" : "!h-[19rem] w-[14.2rem] ",
              )}
            >
              {#if isFetching}
                <div
                  class={cn(
                    "h-full flex flex-col justify-start items-start",
                    isMobile ? "w-[15rem] " : "w-[14.2rem] ",
                  )}
                >
                  <div
                    class={cn(
                      "flex items-center gap-1 p-2 h-9 rounded-xl bg-gray-300 dark:bg-background animate-pulse",
                      isMobile ? "w-[350px]" : "w-[220px]",
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
                      isMobile ? "w-[350px]" : "w-[220px]",
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
                      isMobile ? "w-[350px]" : "w-[220px]",
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
                      isMobile ? "w-[350px]" : "w-[220px]",
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
                  data={$isChaptersDescending || searchTerm !== ""
                    ? displayedChapters
                    : displayedChapters.toReversed()}
                  itemSize={25}
                  getKey={(_, i) => i}
                  tabindex={-1}
                >
                  {#snippet children(chapter, i)}
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
                      onclick={() => {
                        const originalIndex = $globalChapters.findIndex(
                          (c) => c.chapter_id === chapter.chapter_id,
                        );
                        goto(`/reader/${favorite.id}/${originalIndex}`);
                        open = false;
                        openSearch.set(false);
                      }}
                      ondownloadclick={async (e: Event) => {
                        e.stopPropagation();
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
                chaptersMode === "local" ? "translate-x-0" : "translate-x-full",
                isMobile ? "!h-[75vh] w-[15rem]" : "!h-[19rem] w-[14.2rem]",
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
                  itemSize={25}
                  getKey={(_, i) => i}
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
                      onclick={() => {
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
  </Dialog.Content>
</Dialog.Root>
