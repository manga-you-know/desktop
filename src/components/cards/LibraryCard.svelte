<script lang="ts">
  import { Button, Badge, Tooltip, Label } from "@/lib/components";
  import Icon from "@iconify/svelte";
  import {
    ReadFavorite,
    WatchFavorite,
    EditFavorite,
    AskDelete,
    PickCollection,
  } from "@/components";
  import type { Chapter, Favorite, Readed } from "@/interfaces";
  import { FavoriteDB, ReadedDB, MarkFavoriteDB } from "@/repositories";
  import { ContextMenu } from "@/lib/components";
  import { refreshFavorites } from "@/functions";
  import { downloadManager, theme } from "@/store";
  import { twMerge } from "tailwind-merge";
  import type { MarkFavorites } from "@/types";

  interface Props {
    favorite: Favorite;
  }

  interface Event {
    stopPropagation: () => void;
  }
  let { favorite }: Props = $props();
  let isOpen = $state(false);
  let isEdit = $state(false);
  let isDelete = $state(false);
  let isPicking = $state(false);
  let isUltraFavorite = $state(favorite.is_ultra_favorite);
  let readeds: Readed[] = $state([]);
  let chapters: Chapter[] = $state([]);
  let markeds: MarkFavorites[] = $state([]);

  async function onHover(e: Event) {
    e.stopPropagation();
    const data = await ReadedDB.getReadeds(favorite);
    readeds = data;
    chapters =
      favorite.type === "manga"
        ? await $downloadManager.getChapters(favorite)
        : await $downloadManager.getEpisodes(favorite);
  }
</script>

{#if favorite.type === "anime"}
  <WatchFavorite {favorite} bind:open={isOpen} />
{:else}
  <ReadFavorite {favorite} bind:open={isOpen} />
{/if}
<EditFavorite {favorite} bind:open={isEdit} />
<AskDelete {favorite} bind:open={isDelete} />
<PickCollection {favorite} bind:open={isPicking} bind:markeds />
<ContextMenu.Root
  onOpenChange={() => {
    isUltraFavorite = favorite.is_ultra_favorite;
  }}
>
  <ContextMenu.Trigger>
    <button
      class="group relative rounded-lg h-[271px] max-h-[264] w-[168px] max-w-[168px] flex flex-col p-1 items-center transition-transform duration-300 ease-in-out border border-transparent outline-none bg-gray-400 hover:bg-gray-300 dark:bg-gray-900 dark:hover:bg-gray-800 hover:cursor-pointer hover:shadow-lg hover:z-30 transform hover:scale-[1.08] hover:border-white hover:border-1 dark:focus:bg-gray-800 focus:shadow-lg focus:border-white focus:border-1 no-blurry"
      onclick={() => (isOpen = true)}
    >
      <img
        class="w-[155px] h-[235px] min-w-[155px] max-w-[155px] min-h-[235px] max-h-[235px] mt-[26px] object-contain rounded-b-md dark:!bg-gray-600"
        src={favorite.cover}
        alt={favorite.name}
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
        <Badge
          class="w-40 max-w-40 flex justify-center rounded-sm"
          variant="secondary"
        >
          <Label class="text-sm truncate">
            {favorite.name}
          </Label>
        </Badge>
        <div
          class="w-full h-8 flex justify-center mb-2 p-1 transform translate-y-full opacity-0 transition-all duration-300 ease-in-out group-hover:translate-y-0 group-hover:opacity-100"
        >
          <div class="inline-flex rounded-md shadow-sm" role="group">
            <Button
              class="rounded-r-none rounded-l-xl"
              variant="secondary"
              size="sm"
              tabindex={-1}
              onclick={async (e: Event) => {
                e.stopPropagation();
                markeds = await MarkFavoriteDB.getMarkFavorites(favorite);
                isPicking = true;
              }}
            >
              <Icon icon="lucide:bookmark" class="w-4 h-4" />
            </Button>
            <Button
              class="rounded-none !mx-[-1px]"
              variant="secondary"
              size="sm"
              tabindex={-1}
              onclick={(e: Event) => {
                e.stopPropagation();
                isEdit = true;
              }}
            >
              <Icon icon="lucide:square-pen" class="w-4 h-4" />
            </Button>
            <Button
              class="rounded-l-none rounded-r-xl"
              variant="secondary"
              size="sm"
              tabindex={-1}
              onclick={(e: Event) => {
                e.stopPropagation();
                isDelete = true;
              }}
            >
              <Icon icon="lucide:trash" class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </button>
  </ContextMenu.Trigger>
  <ContextMenu.Content
    class={twMerge("!w-14 m-0 dark:bg-black", $theme === "dark" ? "dark" : "")}
  >
    <ContextMenu.Item
      class="gap-4"
      onclick={(e: Event) => {
        e.stopPropagation();
        isOpen = true;
      }}
      ><Icon
        icon={favorite.type === "anime"
          ? "lucide:tv-minimal-play"
          : "lucide:book-open-text"}
      />
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
        await FavoriteDB.setUltraFavorite(favorite);
        await refreshFavorites();
      }}
      ><Icon
        icon={isUltraFavorite ? "heroicons:star-solid" : "heroicons:star"}
      />
      <Label>{favorite.is_ultra_favorite ? "Remove" : "Favorite"}</Label>
    </ContextMenu.Item>
    <ContextMenu.Item
      class="gap-4"
      onclick={async (e: Event) => {
        markeds = await MarkFavoriteDB.getMarkFavorites(favorite);
        isPicking = true;
      }}
    >
      <Icon icon="lucide:bookmark" />
      <Label>Collections</Label>
    </ContextMenu.Item>
    <ContextMenu.Separator />
    <ContextMenu.Item
      class="gap-4"
      onclick={(e: Event) => {
        e.stopPropagation();
        isDelete = true;
      }}
      ><Icon icon="lucide:trash" />
      <Label>Delete</Label>
    </ContextMenu.Item>
  </ContextMenu.Content>
</ContextMenu.Root>
