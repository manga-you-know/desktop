<script lang="ts">
  import { onMount } from "svelte";
  import Icon from "@iconify/svelte";
  import { Button, Badge, Label } from "@/lib/components";
  import {
    FavoriteModal,
    EditFavorite,
    AskDelete,
    Tooltip,
  } from "@/components";
  import { downloadManager, globalChapters, preferableLanguage } from "@/store";
  import { FavoriteRepository, ReadedRepository } from "@/repositories";
  import { ContextMenu } from "@/lib/components";
  import { refreshFavorites, isReaded } from "@/functions";
  import type { Favorite, Chapter } from "@/interfaces";
  import type { Readed } from "@/models";
  import { goto } from "$app/navigation";

  const { favorite }: { favorite: Favorite } = $props();
  let isOpen = $state(false);
  let isEdit = $state(false);
  let isDelete = $state(false);
  let isUltraFavorite = $state(favorite.is_ultra_favorite);
  let isLoading = $state(false);
  let chapters: Chapter[] = $state([]);
  let readeds: Readed[] = $state([]);
  let chaptersToRead: Chapter[] = $state([]);
  let toReadCount = $derived(chaptersToRead.length);
  let nextChapter: Chapter | null = $state(null);
  let variant: "destructive" | "secondary" | "default" | "outline" | undefined =
    $derived(toReadCount > 0 ? "destructive" : "secondary");

  async function getToRead() {
    isLoading = true;
    readeds = await ReadedRepository.getReadeds(favorite);
    const isMulti = $downloadManager.isMultiLanguage(favorite.source);
    if (isMulti) {
      const lastReaded = await ReadedRepository.getLastReaded(favorite);
      if (lastReaded) {
        chapters = await $downloadManager.getChapters(
          favorite,
          lastReaded.language
        );
      } else {
        chapters = await $downloadManager.getChapters(
          favorite,
          $preferableLanguage.id
        );
      }
    } else {
      chapters = await $downloadManager.getChapters(favorite);
    }
    chaptersToRead = [];
    for (const chapter of chapters) {
      if (isReaded(chapter, readeds)) {
        break;
      }
      chaptersToRead.push(chapter);
    }
    if (chaptersToRead.length > 0) {
      chaptersToRead.reverse();
      nextChapter = chaptersToRead[0];
      chaptersToRead.reverse();
    }
    isLoading = false;
  }

  onMount(async () => {
    await getToRead();
  });
</script>

<FavoriteModal {favorite} bind:open={isOpen} />
<EditFavorite {favorite} bind:open={isEdit} />
<AskDelete {favorite} bind:open={isDelete} />
<ContextMenu.Root
  onOpenChange={() => {
    isUltraFavorite = favorite.is_ultra_favorite;
  }}
>
  <ContextMenu.Trigger>
    <button
      class={`group relative rounded-xl h-[264px] max-h-[264] w-[168px] max-w-[168px] flex flex-col p-1 items-center transition-transform duration-300 ease-in-out border border-transparent outline-none bg-gray-900 hover:bg-gray-800  hover:shadow-lg hover:z-30 transform hover:scale-[1.08] hover:border-white hover:border-1 focus:bg-gray-800 focus:shadow-lg focus:border-white focus:border-1 hover:opacity-100 ${nextChapter === null ? "opacity-60 " : "hover:!border-red-500"}`}
      onclick={() => (isOpen = true)}
    >
      <img
        src={favorite.cover}
        alt={favorite.name}
        class="w-[155px] h-[235px] min-w-[155px] max-w-[155px] min-h-[235px] max-h-[235px] mt-[17px] object-contain rounded-b-md !bg-gray-600"
        id={favorite.id?.toString() || ""}
        onerror={() => {
          const coverElement = document.getElementById(
            favorite.id?.toString() || ""
          );
          if (coverElement instanceof HTMLImageElement) {
            coverElement.src = "/myk.png";
          }
        }}
      />
      <div
        class="w-full h-full fixed flex flex-col justify-between items-center"
      >
        <Badge class="w-40 max-w-40 flex justify-center rounded-xl" {variant}>
          <Label class="text-sm truncate">
            {favorite.name}
          </Label>
        </Badge>

        <div
          class="w-full h-full p-2 fixed flex flex-col justify-end items-start"
        >
          <Tooltip text={`${chapters.length - toReadCount}/${chapters.length}`}>
            <Badge
              class="min-w-10 h-10 mb-1 rounded-full text-center"
              {variant}
            >
              {#if isLoading}
                <Icon icon="line-md:loading-twotone-loop" class="w-5 h-5" />
              {:else if toReadCount > 0}
                <Label>+{toReadCount}</Label>
              {:else}
                <Icon icon="mingcute:check-2-fill" class="w-5 h-5" />
              {/if}
            </Badge>
          </Tooltip>
        </div>
        <div
          class="w-full h-22 flex flex-col justify-end items-end mb-2 p-1 transform translate-y-full opacity-0 transition-all duration-300 ease-in-out group-hover:translate-y-0 group-hover:opacity-100"
        >
          <div
            class="flex flex-col mr-0.5 justify-end rounded-xl shadow-sm"
            role="group"
          >
            <Button
              class={`rounded-b-none rounded-t-xl `}
              size="sm"
              tabindex={-1}
              disabled={nextChapter === null}
              onclick={(e: Event) => {
                e.stopPropagation();
                globalChapters.set(chapters);
                goto(
                  `/reader/${favorite.id}/${chapters.indexOf(nextChapter ?? chapters[0])}`
                );
              }}
              {variant}
            >
              <Icon icon="lucide:chevrons-right" class="w-4 h-4" />
            </Button>
            <Button
              class="rounded-none my-[-0.8px]"
              size="sm"
              tabindex={-1}
              {variant}
            >
              <Icon icon="lucide:book-open-text" class="w-4 h-4" />
            </Button>
            <Button
              class="rounded-t-none rounded-b-xl"
              size="sm"
              tabindex={-1}
              onclick={(e: Event) => {
                e.stopPropagation();
                isDelete = true;
              }}
              {variant}
            >
              <Icon icon="lucide:circle-x" class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </button>
  </ContextMenu.Trigger>
  <ContextMenu.Content class="!w-14 m-0">
    <ContextMenu.Item class="gap-4"
      ><Icon icon="lucide:book-open-text" />
      <Label>Open</Label>
    </ContextMenu.Item>
    <ContextMenu.Item
      class="gap-4"
      onclick={(e: Event) => {
        e.stopPropagation();
        isEdit = true;
      }}
      ><Icon icon="lucide:square-pen" />
      <Label>Edit</Label>
    </ContextMenu.Item>
    <ContextMenu.Item
      class="gap-4"
      onclick={async (e: Event) => {
        e.stopPropagation();
        favorite.is_ultra_favorite = !isUltraFavorite;
        isUltraFavorite = favorite.is_ultra_favorite;
        await FavoriteRepository.setUltraFavorite(favorite);
        await refreshFavorites();
      }}
      ><Icon
        icon={isUltraFavorite ? "heroicons:star-solid" : "heroicons:star"}
      />
      <Label>{favorite.is_ultra_favorite ? "Remove" : "Favorite"}</Label>
    </ContextMenu.Item>
    <ContextMenu.Separator />
    <ContextMenu.Item
      class="gap-4"
      onclick={(e: Event) => {
        e.stopPropagation();
        isDelete = true;
      }}
      ><Icon icon="lucide:circle-x" />
      <Label>Delete</Label>
    </ContextMenu.Item>
  </ContextMenu.Content>
</ContextMenu.Root>
