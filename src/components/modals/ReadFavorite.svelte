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
  import type {
    Favorite,
    Chapter,
    Language as LanguageType,
  } from "@/interfaces";
  import { LANGUAGE_LABELS, READSOURCES_LANGUAGE } from "@/constants";
  import { limitStr } from "@/utils";
  import { cn } from "@/lib/utils";
  import { load, Store } from "@tauri-apps/plugin-store";

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
  let store: Store = $state(null!);
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
  interface Props {
    favorite: Favorite;
    open: boolean;
  }

  interface Event {
    stopPropagation: () => void;
  }

  let isFetching = $state(false);
  let isDownloading: { [key: string]: boolean } = $state({});
  let isDownloadingAll = $state(false);
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
    isDownloadingAll = true;
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
    const downloadChapter = async (chapter: Chapter) => {
      downloadingNow += 1;
      isDownloading[chapter.chapter_id] = true;
      try {
        await $downloadManager.downloadChapter(chapter, favorite, store);
      } catch (e) {
        console.log(e);
      }
      await refreshDownloadeds();
      refreshJsonChapters();
      isDownloading[chapter.chapter_id] = false;
      downloadingNow -= 1;
    };
    const downloadQueue = chaptersToDownload.map((chapter) => {
      return async () => downloadChapter(chapter);
    });
    while (true) {
      if (downloadingNow < maxCurrently) {
        const toRun = downloadQueue.shift();
        if (!toRun) continue;
        if (downloadQueue.length === 0) {
          await toRun();
          break;
        }
        toRun();
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    isDownloadingAll = false;
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
      <div class="w-1/2 flex flex-col justify-center gap-2">
        <img
          src={favorite.cover}
          alt={favorite.name}
          class="!w-40 !h-70 object-contain rounded-xl !bg-gray-950"
        />
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
        <div class="flex gap-3">
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
            class="px-[10px]"
            onclick={downloadAll}
            disabled={isDownloadingAll}
          >
            <Icon
              icon={isDownloadingAll
                ? "line-md:loading-twotone-loop"
                : "lucide:download"}
            />
            Download
          </Button>
        </div>
      </div>
      <div class="w-1/2">
        <div class="w-52 flex flex-col gap-1">
          <div class="flex gap-1 items-center">
            <Input
              class="w-20"
              placeholder="Chapter..."
              oninput={search}
              floatingLabel
              variant="link"
              bind:value={searchTerm}
            />
            <Button
              class="w-10 h-10"
              variant="secondary"
              onclick={() => {
                isChaptersDescending.set(!$isChaptersDescending);
                saveSettings();
              }}
            >
              <Icon
                class="!w-5 !h-5"
                icon={$isChaptersDescending
                  ? "typcn:arrow-sorted-down"
                  : "typcn:arrow-sorted-up"}
              />
            </Button>
            <div
              class="flex items-center justify-center p-1 gap-1 bg-gray-900 rounded-xl z-10"
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
                class="w-9 h-9  transition-colors duration-500"
                size="sm"
                onclick={() => (chaptersMode = "local")}
                variant={chaptersMode === "local" ? "secondary" : "link"}
              >
                <Icon class="!w-5 !h-5" icon="tabler:file-download" />
              </Button>
            </div>
          </div>
          <Separator />

          <div
            class="bg-secondary mt-[-4px] rounded-b-xl relative w-[13.25rem] h-[22rem] overflow-hidden"
          >
            <div
              class={cn(
                "flex justify-center items-center !h-[22rem] w-[13.25rem] absolute transition-all duration-300 ease-in-out",
                chaptersMode === "web" ? "translate-x-0" : "translate-x-full"
              )}
            >
              {#if isFetching}
                <Icon
                  icon="line-md:loading-alt-loop"
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
                    <ChapterButton
                      {chapter}
                      {isDownloaded}
                      isReaded={isReadedHere}
                      bind:isDownloading
                      onclick={() => {
                        const originalIndex = $globalChapters.findIndex(
                          (c) => c.chapter_id === chapter.chapter_id
                        );
                        goto(`/reader/${favorite.id}/${originalIndex}`);
                      }}
                      ondownloadclick={async (e: Event) => {
                        e.stopPropagation();
                        if (!isDownloaded) {
                          isDownloading[chapter.chapter_id] = true;
                          await $downloadManager.downloadChapter(
                            chapter,
                            favorite
                          );
                          await refreshDownloadeds();
                          refreshJsonChapters();
                          isDownloading[chapter.chapter_id] = false;
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
                "flex justify-center !h-[22rem] !w-[13.25rem] absolute left-0 top-0 transition-all duration-300 ease-in-out",
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
                      bind:isDownloading
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
