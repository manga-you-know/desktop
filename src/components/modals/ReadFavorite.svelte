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
  } from "@/store";
  import { ReadedRepository } from "@/repositories";
  import {
    addReadedBelow,
    isReaded,
    loadFavoriteChapter,
    refreshReadeds,
    stopDiscordPresence,
    setDiscordActivity,
  } from "@/functions";
  import type {
    Favorite,
    Chapter,
    Language as LanguageType,
  } from "@/interfaces";
  import { LANGUAGE_LABELS, MANGASOURCE_LANGUAGE } from "@/constants";

  let isMulti = $state(false);
  let selectedLanguage2 = $state($preferableLanguage);
  let languageOptions: LanguageType[] = $state([]);
  let downloaded: DirEntry[] = $state([]);
  let searchTerm = $state("");
  let displayedChapters = $derived(
    $globalChapters.filter((chapter) =>
      chapter.number.toString().includes(searchTerm)
    )
  );
  interface Props {
    favorite: Favorite;
    open: boolean;
  }

  interface Event {
    stopPropagation: () => void;
  }

  let { favorite, open = $bindable(false) }: Props = $props();
  let isFetching = $state(false);
  let isDownloading: { [key: string]: boolean } = $state({});
  let isDownloadingAll = $state(false);
  async function refreshDownloadeds() {
    const path = `Mangas/${favorite.folder_name}`;
    if (await exists(path, { baseDir: BaseDirectory.Download })) {
      downloaded = await readDir(path, {
        baseDir: BaseDirectory.Download,
      });
    }
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
    const downloadChapter = async (chapter: Chapter) => {
      downloadingNow += 1;
      isDownloading[chapter.chapter_id] = true;
      try {
        await $downloadManager.downloadChapter(chapter, favorite);
      } catch (e) {
        console.log(e);
      }
      await refreshDownloadeds();
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
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    isDownloadingAll = false;
  }

  $effect(() => {
    if (open) {
      isFetching = true;
      setDiscordActivity("Selecting a chapter:", `[${favorite.name}]`);
      (async () => {
        globalChapters.set([]);
        isMulti = $downloadManager.isMultiLanguage(favorite.source);
        await refreshDownloadeds();
        if (isMulti) {
          const lastReaded = await ReadedRepository.getLastReaded(favorite);
          let chapters: Chapter[] = [];
          if (lastReaded?.language) {
            selectedLanguage2.id = lastReaded.language;
            selectedLanguage2.label = LANGUAGE_LABELS[lastReaded.language];
            [chapters, languageOptions] = await Promise.all([
              $downloadManager.getChapters(favorite, lastReaded.language),
              $downloadManager.getFavoriteLanguages(favorite),
            ]);
          } else {
            selectedLanguage2 = $preferableLanguage;
            [chapters, languageOptions] = await Promise.all([
              $downloadManager.getChapters(favorite, $preferableLanguage.id),
              $downloadManager.getFavoriteLanguages(favorite),
            ]);
          }
          globalChapters.set(chapters);
        } else {
          selectedLanguage2.label = MANGASOURCE_LANGUAGE[favorite.source];
          const result = await $downloadManager.getChapters(favorite);
          await new Promise((resolve) => setTimeout(resolve, 10));
          globalChapters.set(result);
        }
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
    }
  }}
>
  <Dialog.Content interactOutsideBehavior="close">
    <Dialog.Header>
      <Dialog.Title class="w-full flex justify-center dark:text-white"
        >{favorite.name.length > 40
          ? favorite.name.substring(0, 40) + "..."
          : favorite.name}</Dialog.Title
      >
      <!-- <Dialog.Description
        >Change your favorites attributes and save it.</Dialog.Description
      > -->
    </Dialog.Header>
    <div class="flex">
      <div class="w-1/2 flex flex-col justify-center gap-2">
        <img
          src={favorite.cover}
          alt={favorite.name}
          class="w-40 h-70 object-contain rounded-xl !bg-gray-950"
        />
        <Language
          bind:selectedLanguage={selectedLanguage2}
          {languageOptions}
          onChange={async () => {
            isFetching = true;
            const result = await $downloadManager.getChapters(
              favorite,
              selectedLanguage2.id
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
        <Button
          class="w-[165px]"
          onclick={downloadAll}
          disabled={isDownloadingAll}
        >
          <Icon
            icon={isDownloadingAll
              ? "line-md:loading-twotone-loop"
              : "lucide:download"}
          />
          Download all
        </Button>
      </div>
      <div class="w-1/2">
        <div class="w-48 flex flex-col gap-1">
          <Input placeholder="Chapter..." bind:value={searchTerm} />
          <Separator />
          {#if isFetching}
            <div class="flex !h-[22rem] w-full justify-center items-center">
              <Icon
                icon="line-md:loading-twotone-loop"
                color="white"
                class="w-10 h-10 "
              />
            </div>
          {:else}
            <VList
              class="scrollbar !h-[22rem] !w-48 overflow-x-hidden scroll-smooth"
              data={displayedChapters}
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
                    goto(`/reader/${favorite.id}/${i}`);
                  }}
                  ondownloadclick={async (e: Event) => {
                    e.stopPropagation();
                    if (!isDownloaded) {
                      isDownloading[chapter.chapter_id] = true;
                      await $downloadManager.downloadChapter(chapter, favorite);
                      await refreshDownloadeds();
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
                    await addReadedBelow(chapter, $globalChapters, favorite);
                    await refreshReadeds(favorite);
                  }}
                />
              {/snippet}
            </VList>
          {/if}{#if displayedChapters.length === 0 && !isFetching}
            <div class="flex !h-[22rem] w-full justify-center items-center">
              <Badge
                class="w-full h-10 flex justify-center text-center"
                variant="destructive">No chapters found in this language!</Badge
              >
            </div>
          {/if}
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
