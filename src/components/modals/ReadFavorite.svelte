<script lang="ts">
  import { goto } from "$app/navigation";
  import { open as openPath } from "@tauri-apps/plugin-shell";
  import { downloadDir, join } from "@tauri-apps/api/path";
  import { VList } from "virtua/svelte";
  import {
    exists,
    readDir,
    BaseDirectory,
    type DirEntry,
  } from "@tauri-apps/plugin-fs";
  import Icon from "@iconify/svelte";
  import {
    Dialog,
    ScrollArea,
    Button,
    Input,
    Separator,
    Badge,
  } from "@/lib/components";
  import { ChapterButton, Language } from "@/components";
  import {
    downloadManager,
    globalChapters,
    readeds,
    preferableLanguage,
    isChaptersDescending,
    downloadings,
  } from "@/store";
  import { FavoriteDB, ReadedDB } from "@/repositories";
  import {
    addReadedBelow,
    isReaded,
    loadFavoriteChapter,
    refreshReadeds,
    stopDiscordPresence,
    setDiscordActivity,
    refreshFavorites,
    refreshLibrary,
    saveSettings,
  } from "@/functions";
  import type { Favorite, Chapter, Language as LanguageType } from "@/types";
  import { LANGUAGE_LABELS, READSOURCES_LANGUAGE } from "@/constants";
  import { limitStr } from "@/utils";
  import { cn } from "@/lib/utils";
  import { load, Store } from "@tauri-apps/plugin-store";
  import { Tooltip } from "svelte-ux";

  let { favorite, open = $bindable(false) }: Props = $props();

  let isMulti = $state(false);
  let localSelectedLanguage = $state($preferableLanguage);
  let languageOptions: LanguageType[] = $state([]);
  let downloaded: DirEntry[] = $state([]);
  let searchTerm = $state("");
  let displayedChapters: Chapter[] = $state([]);
  let displayedLocalChapters: Chapter[] = $state([]);
  let isUltraFavorite = $state(favorite.is_ultra_favorite);
  let chaptersMode: "web" | "local" = $state("web");
  let jsonChapters: { [key: string]: Chapter } = $state({});
  let chaptersDl = $derived(
    downloaded
      .filter((d) => jsonChapters[d.name])
      .map((d) => ({
        ...jsonChapters[d.name],
        path: `Mangas/${favorite.folder_name}/${d.name}`,
      }))
      .toReversed()
  );
  let nextChapter: Chapter | undefined = $derived(
    chaptersMode === "web"
      ? $globalChapters
          .toReversed()
          .find((chapter) => isReaded(chapter, $readeds) === undefined)
      : chaptersDl
          .toReversed()
          .find((chapter) => isReaded(chapter, $readeds) === undefined)
  );
  let isNextDownloaded = $derived(
    downloaded.map((d) => d.name).includes(nextChapter?.number ?? "")
  );

  let store: Store = $state(null!);
  let displayedChaptersLength = $derived(
    chaptersMode === "web"
      ? displayedChapters.length
      : displayedLocalChapters.length
  );
  interface Props {
    favorite: Favorite;
    open: boolean;
  }

  interface Event {
    stopPropagation: () => void;
  }

  let isFetching = $state(false);

  function isDownloading(chapter: Chapter) {
    if ($downloadings[favorite.id] === undefined) return false;
    return (
      $downloadings[favorite.id].downloading.find(
        (dl) => dl.chapter_id === chapter.chapter_id
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
          (c) => c.chapter_id !== chapter.chapter_id
        ),
      },
    }));
  }

  async function refreshDownloadeds() {
    const path = `Mangas/${favorite.folder_name}`;
    if (await exists(path, { baseDir: BaseDirectory.Download })) {
      downloaded = (
        await readDir(path, {
          baseDir: BaseDirectory.Download,
        })
      ).sort((a, b) => Number(a.name) - Number(b.name));
    }
  }
  async function refreshJsonChapters() {
    jsonChapters = Object.fromEntries(await store.entries()) as {
      [key: string]: Chapter;
    };
    displayedChapters = chaptersDl;
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
                error
              );
            } finally {
              removeDownloading(chapter);
              downloadingNow -= 1;
            }
          })();

          downloadPromises.add(downloadPromise);
          downloadPromise.finally(() =>
            downloadPromises.delete(downloadPromise)
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
        (chapter) => chapter.number?.toString()?.includes(searchTerm) ?? false
      )
      .toReversed();
  }

  $effect(() => {
    if (open) {
      isFetching = true;
      setDiscordActivity("Selecting a chapter:", `[${favorite.name}]`);
      (async () => {
        store = await load(`Mangas/${favorite.folder_name}/chapters.json`);
        globalChapters.set([]);
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
      })();
    } else {
      stopDiscordPresence();
    }
  });
</script>

<Dialog.Root
  bind:open
  onOpenChange={(open) => {
    globalChapters.set([]);
    if (!open) {
      loadFavoriteChapter(favorite);
      refreshFavorites();
      refreshLibrary();
    }
  }}
>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title class="w-full flex justify-center dark:text-white">
        {limitStr(favorite.name, 40)}
      </Dialog.Title>
      <!-- <Dialog.Description
        >Change your favorites attributes and save it.</Dialog.Description
      > -->
    </Dialog.Header>
    <div class="flex">
      <div class="w-1/2 flex flex-col justify-start items-center pr-10 gap-2">
        <div class="!w-40 !h-70 flex justify-center">
          <img
            src={favorite.cover}
            alt={favorite.name}
            class="!w-40 !h-70 object-contain rounded-xl !bg-gray-950"
          />
        </div>
        <div class="flex flex-col items-center gap-2">
          <Language
            class="mt-3"
            bind:selectedLanguage={localSelectedLanguage}
            {languageOptions}
            onChange={async () => {
              isFetching = true;
              const result = await $downloadManager.getChapters(
                favorite,
                localSelectedLanguage.id
              );
              await refreshReadeds(favorite);
              await new Promise((resolve) => setTimeout(resolve, 10));
              globalChapters.set(result);
              isFetching = false;
            }}
            disabled={!isMulti || isFetching}
          />
          <Button
            class="w-[165px]"
            variant="outline"
            effect="hoverUnderline"
            onclick={() => window.open(favorite.link, "_blank")}
          >
            <span class="truncate">
              {favorite.source ?? "Open"}
            </span>
          </Button>
          <div class="flex gap-2">
            <Button
              class=""
              variant="secondary"
              onclick={async (e: Event) => {
                e.stopPropagation();
                favorite.is_ultra_favorite = !isUltraFavorite;
                isUltraFavorite = favorite.is_ultra_favorite;
                await FavoriteDB.setUltraFavorite(favorite);
              }}
            >
              <Icon
                class="!w-5 !h-5 mx-[-5px]"
                icon={isUltraFavorite
                  ? "fluent:star-emphasis-32-filled"
                  : "fluent:star-emphasis-32-regular"}
              />
            </Button>
            <Button
              class=""
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
        </div>
      </div>
      <div class="w-1/2">
        <div class="w-[13.5rem] flex flex-col gap-1">
          <div class="flex gap-1 items-center justify-between">
            <div class="w-20 max-w-20 flex justify-start ml-[-4px]">
              <Input
                class="w-12 "
                placeholder="Chapter..."
                oninput={search}
                floatingLabel
                variant="link"
                bind:value={searchTerm}
              />
              {#if searchTerm.length > 0}
                <Button
                  variant="link"
                  class="w-2"
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
              class="w-11 h-11"
              variant="secondary"
              onclick={() => {
                isChaptersDescending.set(!$isChaptersDescending);
                saveSettings();
              }}
            >
              <Icon
                class="!w-6 !h-6"
                icon={$isChaptersDescending
                  ? "typcn:arrow-sorted-down"
                  : "typcn:arrow-sorted-up"}
              />
            </Button>
            <div
              class="flex items-center justify-center mr-1 p-1 gap-1 bg-slate-300 dark:bg-gray-900 rounded-xl z-10"
            >
              <Button
                class="w-9 h-9 transition-colors duration-500"
                size="sm"
                onclick={() => (chaptersMode = "web")}
                variant={chaptersMode === "web" ? "secondary" : "link"}
              >
                <Icon class="!w-5 !h-5" icon="tabler:world" />
              </Button>
              <Button
                class="w-9 h-9 transition-colors duration-500"
                size="sm"
                onclick={() => (chaptersMode = "local")}
                variant={chaptersMode === "local" ? "secondary" : "link"}
              >
                <Icon class="!w-5 !h-5" icon="tabler:file-download" />
              </Button>
            </div>
          </div>
          <div class="flex w-full justify-between">
            <Button
              class={cn(
                "chapter-button flex justify-between items-center rounded-xl group transition-colors duration-500 hover:bg-gray-200 dark:hover:bg-gray-900",
                nextChapter === undefined ? "cursor-default" : ""
              )}
              variant="secondary"
              size="sm"
              onclick={() => {
                if (nextChapter) {
                  const originalIndex =
                    chaptersMode === "web"
                      ? $globalChapters.findIndex(
                          (c) => c.chapter_id === nextChapter.chapter_id
                        )
                      : chaptersDl.findIndex(
                          (c) => c.chapter_id === nextChapter.chapter_id
                        );

                  goto(`/reader/${favorite.id}/${originalIndex}`);
                }
              }}
            >
              <div class="flex items-center gap-2">
                <Tooltip
                  title={nextChapter !== undefined
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
                      if (nextChapter === undefined) return;
                      if (!isNextDownloaded) {
                        pushDownloading(nextChapter);
                        await $downloadManager.downloadChapter(
                          nextChapter,
                          favorite
                        );
                        await refreshDownloadeds();
                        removeDownloading(nextChapter);
                        refreshJsonChapters();
                      } else {
                        const path = await join(
                          await downloadDir(),
                          "Mangas",
                          favorite.folder_name,
                          nextChapter.number
                        );
                        openPath(path);
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
                  class="group-hover:underline group-hover:underline-offset-4 truncate w-[4rem] text-start"
                >
                  {nextChapter?.number ?? "All clear!"}
                </span>
              </div>
              <Button
                class="h-7 w-7 "
                variant="ghost"
                size="sm"
                tabindex={-1}
                disabled={nextChapter === undefined}
                onclick={async (e) => {
                  e.stopPropagation();
                  if (nextChapter) {
                    await addReadedBelow(
                      nextChapter,
                      $globalChapters,
                      favorite
                    );
                    await refreshReadeds(favorite);
                  }
                }}
              >
                <Icon
                  icon={nextChapter ? "ic:round-keyboard-arrow-right" : ""}
                  class="!w-7 !h-7"
                />
              </Button>
            </Button>
            <Badge
              variant="secondary"
              class="w-12 mr-1 flex justify-center select-none"
              >{displayedChaptersLength}
            </Badge>
          </div>
          <div
            class="bg-secondary rounded-xl relative w-[13.25rem] h-[19rem] overflow-hidden"
          >
            <div
              class={cn(
                "flex justify-center items-center !h-[19rem] w-[13.25rem] absolute transition-all duration-300 ease-in-out",
                chaptersMode === "web" ? "translate-x-0" : "translate-x-full"
              )}
            >
              {#if isFetching}
                <Icon
                  icon="line-md:loading-loop"
                  color="white"
                  class="!w-16 !h-16"
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
                  class="scrollbar overflow-x-hidden scroll-smooth"
                  data={$isChaptersDescending || searchTerm !== ""
                    ? displayedChapters
                    : displayedChapters.toReversed()}
                  itemSize={40}
                  getKey={(_, i) => i}
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
                          (c) => c.chapter_id === chapter.chapter_id
                        );
                        goto(`/reader/${favorite.id}/${originalIndex}`);
                      }}
                      ondownloadclick={async (e: Event) => {
                        e.stopPropagation();
                        if (!isDownloaded) {
                          pushDownloading(chapter);
                          await $downloadManager.downloadChapter(
                            chapter,
                            favorite
                          );
                          removeDownloading(chapter);
                          await refreshDownloadeds();
                          refreshJsonChapters();
                        } else {
                          const path = await join(
                            await downloadDir(),
                            "Mangas",
                            favorite.folder_name,
                            chapter.number
                          );
                          openPath(path);
                        }
                      }}
                      onreadclick={async (e: Event) => {
                        e.stopPropagation();
                        await addReadedBelow(
                          chapter,
                          $globalChapters,
                          favorite
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
                "flex justify-center !h-[19rem] !w-[13.25rem] absolute left-0 top-0 transition-all duration-300 ease-in-out",
                chaptersMode === "local" ? "translate-x-0" : "translate-x-full"
              )}
            >
              {#if displayedLocalChapters.length === 0}
                <Badge
                  class="w-33 h-16  m-5  flex justify-center text-center"
                  variant="destructive"
                >
                  {searchTerm === ""
                    ? "No chapters downloaded found in this language!"
                    : `No chapters found with '${searchTerm}'`}
                </Badge>
              {:else}
                <VList
                  class="scrollbar overflow-x-hidden scroll-smooth"
                  data={$isChaptersDescending || searchTerm !== ""
                    ? displayedLocalChapters
                    : displayedLocalChapters.toReversed()}
                  itemSize={40}
                  getKey={(_, i) => i}
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
                          (c) => c.chapter_id === chapter.chapter_id
                        );
                        goto(`/reader/${favorite.id}/${originalIndex}?local`);
                      }}
                      ondownloadclick={async (e: Event) => {
                        e.stopPropagation();
                        const path = await join(
                          await downloadDir(),
                          "Mangas",
                          favorite.folder_name,
                          chapter.number
                        );
                        openPath(path);
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
    <!-- <Dialog.Footer>
      <Button
        effect="ringHover"
        onclick={() => {
          open = false;
        }}
      >
        <Icon icon="lucide:check" />Confirm
      </Button>
    </Dialog.Footer> -->
  </Dialog.Content>
</Dialog.Root>
