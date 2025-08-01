<script lang="ts">
  import { Button, Badge, Label } from "@/lib/components";
  import Icon from "@iconify/svelte";
  import {
    FavoriteContext,
    ReadFavorite,
    WatchFavorite,
    EditFavorite,
    AskDelete,
    PickTags,
    Image,
  } from "@/components";
  import type { Chapter, Favorite, Readed } from "@/types";
  import { ReadedDB, MarkFavoriteDB } from "@/repositories";
  import { coversLoaded, downloadManager } from "@/store";
  import { cn } from "@/lib/utils";
  import type { MarkFavorites } from "@/types";
  import { IS_MOBILE } from "@/constants";
  import { onMount } from "svelte";
  import { onNavigate } from "$app/navigation";
  import {} from "@/components/animations";
  import { fade } from "svelte/transition";

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
  let isContext = $state(false);
  let isPicking = $state(false);
  let isUltraFavorite = $state(Boolean(favorite.is_ultra_favorite));
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

  onMount(() => {
    if ($coversLoaded[favorite.cover] === undefined) {
      $coversLoaded[favorite.cover] === favorite.cover;
    }
  });
</script>

{#if favorite.type === "anime"}
  <WatchFavorite {favorite} bind:open={isOpen} />
{:else}
  <ReadFavorite {favorite} bind:open={isOpen} />
{/if}
<EditFavorite {favorite} bind:open={isEdit} />
<AskDelete {favorite} bind:open={isDelete} />
<PickTags {favorite} bind:open={isPicking} bind:markeds />
<FavoriteContext
  {favorite}
  bind:isUltraFavorite
  bind:markeds
  bind:open={isContext}
  bind:openRead={isOpen}
  bind:openTags={isPicking}
  bind:openEdit={isEdit}
  bind:openDelete={isDelete}
>
  <button
    id="library-{favorite.id}"
    class={cn(
      "group relative rounded-2xl h-[264px] max-h-[264px] w-[158px] max-w-[158px] flex flex-col p-1 items-center transition-all duration-300 ease-in-out border border-transparent outline-none bg-gray-400 hover:bg-gray-300 dark:bg-secondary/30 dark:hover:bg-secondary/50 hover:cursor-pointer hover:shadow-lg transform  over:border-white hover:border-1 focus:shadow-lg no-blurry",
      !IS_MOBILE && "hover:scale-[1.08]",
      isContext && "!scale-[1.15]",
    )}
    onclick={() => (isOpen = true)}
  >
    <div class="flex items-center justify-center h-[224px] mt-[30px]">
      {#key $coversLoaded[favorite.cover]}
        <Image
          class="w-[146px] min-w-[146px] max-w-[146px] max-h-[224px] object-contain rounded-xl"
          src={$coversLoaded[favorite.cover] ?? favorite.cover}
          alt={favorite.name}
          id={favorite.id?.toString() || ""}
        />
      {/key}
    </div>
    <div class="w-full h-full fixed flex flex-col justify-between items-center">
      <Badge
        class="w-[150px] max-w-[148px] flex justify-center rounded-xl"
        variant="secondary"
      >
        <Label class="text-sm truncate">
          {favorite.name}
        </Label>
      </Badge>
      <div
        class={cn(
          "w-full h-8 flex justify-center mb-2 p-1 transform  transition-all duration-300 ease-in-out ",
          !IS_MOBILE &&
            "opacity-0 group-hover:opacity-100 translate-y-full group-hover:translate-y-0",
        )}
      >
        <div class="inline-flex rounded-md shadow-sm" role="group">
          <Button
            class="rounded-r-none rounded-l-2xl"
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
            class="rounded-none !-mx-[1px]"
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
            class="rounded-l-none rounded-r-2xl"
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
</FavoriteContext>
