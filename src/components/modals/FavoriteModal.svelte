<script lang="ts">
  import { goto } from "$app/navigation";
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

  $effect(() => {
    if (open) {
      (async () => {
        chapters.set([]);
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
        <Button
          class="w-20"
          variant="outline"
          effect="hoverUnderline"
          onclick={() => window.open(favorite.link, "_blank")}>Open site</Button
        >
      </div>
      <div class="w-1/2">
        <div class="w-48 flex flex-col gap-1">
          <Input placeholder="Chapter..." bind:value={searchTerm} />
          <Separator />
          <ScrollArea class="h-72 w-48 p-1 rounded-md border">
            {#each displayedChapters as chapter, i}
              <ChapterButton
                {chapter}
                isDownloaded={false}
                isReaded={$readeds.find(
                  (r) =>
                    r.chapter_id === chapter.chapter_id &&
                    r.language === chapter.language
                ) !== undefined}
                onclick={() => {
                  goto(`/reader/${favorite.id}/${i}`);
                }}
                ondownloadclick={(e: Event) => {
                  e.stopPropagation();
                  console.log(chapter.number);
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

<!-- <Modal
  class="!bg-black overflow-y-hidden"
  size="xs"
  classHeader="!max-h-10 !bg-black"
  title={favorite.name.length > 16
    ? favorite.name.substring(0, 16) + "..."
    : favorite.name}
  bind:open
  outsideclose
>
  <div class="flex">
    <div class="w-1/2 bg-purple-500">
      <img
        src={favorite.cover}
        alt={favorite.name}
        class="w-40 h-70 object-contain rounded-xl !bg-gray-950"
      />
    </div>
    <div class="w-1/2 overflow-y-visible">
      <div
        class="h-72 w-48 bg-gray-800 rounded-xl m-1 p-1 flex flex-col overflow-y-scroll"
      >
        {#each chapters as chapter}
          <p class="text-white">
            {chapter.number}
          </p>
        {/each}
      </div>
    </div>
  </div>
</Modal> -->
