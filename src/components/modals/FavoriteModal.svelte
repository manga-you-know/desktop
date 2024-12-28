<script lang="ts">
  import { goto } from "$app/navigation";
  import { open as openPath } from "@tauri-apps/plugin-shell";
  import { downloadDir, join } from "@tauri-apps/api/path";
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
  } from "@/lib/components";
  import { ChapterButton } from "@/components";
  import { downloadManager, chapters, readeds } from "@/store";
  import { ReadedRepository } from "@/repositories";
  import type { Favorite, Chapter } from "@/models";
  import Badge from "@/lib/components/ui/badge/badge.svelte";

  let downloaded: DirEntry[] = $state([]);
  let searchTerm = $state("");
  let displayedChapters = $derived(
    $chapters.filter((chapter) =>
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
    const batchSize = 5;
    let index = 0;
    const reversedChapters = $chapters.slice().reverse();
    const downloadBatch = async (): Promise<void> => {
      const batch = reversedChapters.slice(index, index + batchSize);
      index += batchSize;
      await Promise.all(
        batch.map(async (chapter) => {
          isDownloading[chapter.chapter_id] = true;
          await $downloadManager.downloadChapter(chapter, favorite);
          isDownloading[chapter.chapter_id] = false;
          await refreshDownloadeds();
        })
      );
    };
    while (index < reversedChapters.length) {
      await downloadBatch();
    }
    isDownloadingAll = false;
  }

  $effect(() => {
    if (open) {
      (async () => {
        chapters.set([]);
        await refreshDownloadeds();
        const result = await $downloadManager.getChapters(favorite);
        const newReadeds = await ReadedRepository.getReadeds(favorite);
        await new Promise((resolve) => setTimeout(resolve, 10));
        readeds.set(newReadeds);
        //@ts-ignore
        chapters.set(result.chapters || []);
      })();
    }
  });
</script>

<Dialog.Root bind:open onOpenChange={() => chapters.set([])}>
  <Dialog.Content interactOutsideBehavior="close">
    <Dialog.Header>
      <Dialog.Title class="w-full flex justify-center"
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
        <div class="flex gap-2">
          <Button
            class="w-20"
            variant="outline"
            effect="hoverUnderline"
            onclick={() => window.open(favorite.link, "_blank")}
            >Open site</Button
          >
          <Button
            class="w-20"
            effect="hoverUnderline"
            onclick={downloadAll}
            disabled={isDownloadingAll}
          >
            <Icon
              icon={isDownloadingAll
                ? "line-md:loading-twotone-loop"
                : "lucide:download"}
            />
            All
          </Button>
        </div>
      </div>
      <div class="w-1/2">
        <div class="w-48 flex flex-col gap-1">
          <Input placeholder="Chapter..." bind:value={searchTerm} />
          <Separator />
          <ScrollArea class="h-72 w-48 p-1 rounded-md border">
            {#each displayedChapters as chapter, i}
              {@const isDownloaded = downloaded
                .map((d) => d.name)
                .includes(chapter.number)}
              <ChapterButton
                {chapter}
                {isDownloaded}
                bind:isDownloading
                isReaded={$readeds.find(
                  (r) =>
                    r.chapter_id === chapter.chapter_id &&
                    r.language === chapter.language
                ) !== undefined}
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
                onreadclick={(e: Event) => {
                  e.stopPropagation();
                }}
              />
            {/each}
            {#if displayedChapters.length === 0}
              <Badge class="w-full h-6 flex justify-center" variant="outline"
                >No chapters found</Badge
              >
            {/if}
          </ScrollArea>
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
