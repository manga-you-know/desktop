<script lang="ts">
  import { animate } from "animejs";
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
  import { goto, onNavigate, pushState } from "$app/navigation";
  import { fade } from "svelte/transition";
  import { getBool } from "@/utils";
  import { db, favorites } from "@/db";
  import { eq } from "drizzle-orm";
  import { deleteFavorite } from "@/repositories/favorite";

  interface Props {
    favorite: Favorite;
  }

  interface Event {
    stopPropagation: () => void;
  }
  let { favorite }: Props = $props();
  let isOpen = $state(false);
  let isEdit = $state(false);
  let isBack = $state(false);
  let isContext = $state(false);
  let isPicking = $state(false);
  let animatingView = $state(false);
  let isUltraFavorite = $state(getBool(favorite.is_ultra_favorite));
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

  let animating = false;

  const turnDelete = () => {
    animating = true;
    animate(`#library-${favorite.id}`, {
      rotateY: "180",
      duration: 1000,
    }).then(() => {
      animating = false;
      if (isBack) {
        turnBack();
      } else {
        isBack = true;
      }
    });
  };

  const turnBack = async () => {
    if (isBack && !animating) {
      animate(`#library-${favorite.id}`, {
        rotateY: "0",
        duration: 1000,
        delay: 500,
      });
      isBack = false;
    } else {
      isBack = true;
    }
  };
</script>

{#if favorite.type === "anime"}
  <WatchFavorite {favorite} bind:open={isOpen} />
{:else}
  <ReadFavorite {favorite} bind:open={isOpen} />
{/if}

<EditFavorite {favorite} bind:open={isEdit} />
<!-- <AskDelete {favorite} bind:open={isDelete} /> -->
<PickTags {favorite} bind:open={isPicking} bind:markeds />
<FavoriteContext
  {favorite}
  bind:isUltraFavorite
  bind:markeds
  bind:open={isContext}
  bind:openRead={isOpen}
  bind:openTags={isPicking}
  bind:openEdit={isEdit}
  bind:openDelete={isBack}
  onmouseleave={turnBack}
>
  <button
    id="library-{favorite.id}"
    class="relative h-[264px] max-h-[264px] w-[158px] max-w-[158px] transform-3d"
    onclick={async () => {
      if (!document.startViewTransition) isOpen = true;
      animatingView = true;
      const transition = document.startViewTransition(() => {
        isOpen = true;
      });
      await transition.finished;
      animatingView = false;
      console.log("yes");
    }}
  >
    <div
      class="bg-secondary/70 absolute h-[264px] max-h-[264px] w-[158px] max-w-[158px] rotate-y-180 rounded-2xl backface-hidden"
    ></div>
    <div
      class={cn(
        "group dark:bg-secondary/30 dark:hover:bg-secondary/50 over:border-white no-blurry relative flex h-[264px] max-h-[264px] w-[158px] max-w-[158px] transform flex-col items-center rounded-2xl border border-transparent bg-gray-400 p-1 transition-all duration-300 ease-in-out outline-none backface-hidden hover:cursor-pointer  hover:border hover:bg-gray-300 hover:shadow-lg focus:shadow-lg",
        !IS_MOBILE && "hover:scale-[1.08]",
        isContext && "scale-[1.15]!",
      )}
    >
      <div class="mt-[30px] flex h-[224px] items-center justify-center">
        <Image
          class="max-h-[224px] w-[146px] max-w-[146px] min-w-[146px] rounded-xl object-contain backface-visible"
          style="view-transition-name: {!isOpen && animatingView
            ? 'saved-cover'
            : null}"
          src={$coversLoaded[favorite.cover] ?? favorite.cover}
          alt={favorite.name}
          id={favorite.id?.toString() || ""}
        />
      </div>
      <div
        class="fixed flex h-full w-full flex-col items-center justify-between"
      >
        <Badge
          class="flex w-[150px] max-w-[148px] justify-center rounded-xl"
          variant="secondary"
        >
          <Label class="truncate text-sm">
            {favorite.name}
          </Label>
        </Badge>
        <div
          class={cn(
            "mb-2 flex h-8 w-full transform justify-center p-1  transition-all duration-300 ease-in-out ",
            !IS_MOBILE &&
              "translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
          )}
        >
          <div class="inline-flex rounded-md shadow-sm" role="group">
            <Button
              class="rounded-l-2xl rounded-r-none"
              variant="secondary"
              size="sm"
              tabindex={-1}
              onclick={(e) => {
                e.stopPropagation();
                if (e.shiftKey) {
                  deleteFavorite(favorite);
                } else {
                  isBack = true;
                  turnDelete();
                }
              }}
            >
              <Icon icon="lucide:trash" class="h-4 w-4" />
            </Button>
            <Button
              class="-mx-px! rounded-none"
              variant="secondary"
              size="sm"
              tabindex={-1}
              onclick={(e: Event) => {
                e.stopPropagation();
                isEdit = true;
              }}
            >
              <Icon icon="lucide:square-pen" class="h-4 w-4" />
            </Button>
            <Button
              class="rounded-l-none rounded-r-2xl"
              variant="secondary"
              size="sm"
              tabindex={-1}
              onclick={async (e: Event) => {
                e.stopPropagation();
                markeds = await MarkFavoriteDB.getMarkFavorites(favorite);
                isPicking = true;
              }}
            >
              <Icon icon="lucide:bookmark" class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </button>
</FavoriteContext>
