<script lang="ts">
  import Icon from "@iconify/svelte";
  import { open as openPath } from "@tauri-apps/plugin-shell";
  import {
    Accordion,
    AlertDialog,
    Badge,
    Button,
    ScrollArea,
  } from "@/lib/components";
  import { downloadings, openDownloads } from "@/store";
  import type { Downloading } from "@/types";
  import { limitStr } from "@/utils";
  import { downloadDir, join } from "@tauri-apps/api/path";
  let isUpdating = $state(false);
  let downloadingCount = $derived(
    Object.values<Downloading>($downloadings).reduce(
      (a1, a2) => a1 + a2.downloading.length,
      0
    )
  );
</script>

<AlertDialog.Root bind:open={$openDownloads}>
  <AlertDialog.Content class="flex flex-col items-center justify-center">
    <AlertDialog.Title>Downloads</AlertDialog.Title>
    {#if downloadingCount === 0}
      <Badge class="h-20 w-44 flex justify-center"
        >There's nothing downloading...</Badge
      >
    {:else}
      <ScrollArea class="h-80 p-0 pr-5 rounded-xl">
        <Accordion.Root
          class="flex flex-col gap-1 justify-center"
          type="multiple"
        >
          {#each Object.values($downloadings).filter((dl) => dl.downloading.length > 0) as favDownloading, i (i)}
            <Accordion.Item class="dark:text-white" value={`item-${i}`}>
              <Accordion.Trigger
                endText="({favDownloading.downloadQueue.length +
                  favDownloading.downloading.length}...)"
                class="w-96 flex justify-between"
                >{limitStr(favDownloading.fav.name, 40)}
              </Accordion.Trigger>
              <Accordion.Content class="flex flex-col gap-0.5">
                <ScrollArea class="h-44 p-0 rounded-xl pr-5">
                  {#each favDownloading.downloading as chapter, i (i)}
                    <Button
                      class="flex justify-start w-full mr-5"
                      variant="outline"
                      onclick={async () => {
                        const path = await join(
                          await downloadDir(),
                          "Mangas",
                          favDownloading.fav.folder_name,
                          chapter.number
                        );
                        openPath(path);
                      }}
                    >
                      {chapter.number}
                      <span>
                        {chapter.title}
                      </span>
                    </Button>
                  {/each}
                </ScrollArea>
              </Accordion.Content>
            </Accordion.Item>
          {/each}
        </Accordion.Root>
      </ScrollArea>
    {/if}
  </AlertDialog.Content>
</AlertDialog.Root>
