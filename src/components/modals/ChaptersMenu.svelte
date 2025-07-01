<script lang="ts">
  import {
    loadFavoriteChapters,
    saveSettings,
    stopDiscordPresence,
    setFullscreen,
    addReadedBelow,
    isReaded,
    refreshReadeds,
    copyText,
  } from "@/functions";
  import type { Chapter, Favorite } from "@/types";
  import { Button, Checkbox, Label, Sheet, Switch } from "@/lib/components";
  import {
    openMenuChapters,
    globalChapters,
    lastPage,
    isChaptersDescending,
    readeds,
  } from "@/store";
  import Icon from "@iconify/svelte";
  import { VList } from "virtua/svelte";
  import { cn } from "@/lib/utils";
  import { Tooltip } from "svelte-ux";
  import { limitStr } from "@/utils";

  interface Props {
    favorite?: Favorite;
    currentlyChapter?: Chapter;
    goHome: VoidFunction;
    gotoPage: (page: string) => void;
    handleGoChapter: (way: "next" | "prev") => void;
  }

  let { favorite, currentlyChapter, goHome, gotoPage, handleGoChapter }: Props =
    $props();
  let searchTerm = $state("");
  let displayedChapters: Chapter[] = $state([]);
</script>

<Sheet.Root bind:open={$openMenuChapters}>
  <Sheet.Content
    class="mb-6 flex flex-col justify-between"
    overlayClass="bg-black/30"
    closeButton={false}
  >
    <Sheet.Header class="mb-2">
      <Sheet.Title
        class="group !bg-transparent w-full flex justify-center items-center dark:text-white select-none"
        onclick={() => {
          copyText(favorite?.name ?? "");
        }}
      >
        <Icon
          class="!size-0 mr-2  group-hover:!size-7 transition-all duration-300"
          icon="ic:baseline-content-copy"
        />
        {limitStr(favorite?.name ?? "", 80)}
      </Sheet.Title>
      <div class="flex gap-2">
        <Button
          variant="outline"
          onclick={() => {
            openMenuChapters.set(false);
            handleGoChapter("prev");
          }}
        >
          <Icon icon="lucide:arrow-left" />
        </Button>
        <Button
          variant="outline"
          onclick={() => {
            openMenuChapters.set(false);
            handleGoChapter("next");
          }}
        >
          <Icon icon="lucide:arrow-right" />
        </Button>
        <Button
          class="w-12 mr-12"
          variant="outline"
          onclick={() => {
            isChaptersDescending.set(!$isChaptersDescending);
            saveSettings();
          }}
        >
          <Icon
            class={cn(
              "!size-6 duration-300 transition-all",
              $isChaptersDescending ? "rotate-0" : "rotate-180"
            )}
            icon="typcn:arrow-sorted-down"
          />
        </Button>
        <Button variant="outline" onclick={goHome}>
          <Icon icon="lucide:home" />
        </Button>
        <Button
          variant="outline"
          onclick={() => {
            openMenuChapters.set(false);
          }}
        >
          <Icon icon="lucide:menu" />
        </Button>
      </div>
    </Sheet.Header>
    <!-- data={$isChaptersDescending || searchTerm !== ""
        ? displayedChapters
        : displayedChapters.toReversed()} -->
    <VList
      class="scrollbar-chapters overflow-x-hidden scroll-smooth !h-[70rem] bottom-0"
      itemSize={25}
      data={$isChaptersDescending
        ? $globalChapters
        : $globalChapters.toReversed()}
      getKey={(_, i) => i}
      tabindex={-1}
    >
      {#snippet children(chapter, i)}
        {@const isReadedHere = isReaded(chapter, $readeds) !== undefined}
        <Button
          class={cn(
            "chapter-button my-[1px] w-full flex justify-between items-center rounded-xl group transition-all duration-500 hover:bg-gray-200 hover:opacity-100 dark:hover:bg-background/70",
            isReadedHere && "opacity-60",
            currentlyChapter?.chapter_id === chapter.chapter_id &&
              "bg-accent border  border-black dark:border-white"
          )}
          variant="secondary"
          size="sm"
          onclick={() => {
            openMenuChapters.set(false);
            gotoPage(`/reader/${favorite?.id}/${i}`);
          }}
        >
          <div class="flex items-center gap-2">
            <span
              class="group-hover:underline group-hover:underline-offset-4 truncate w-24 text-start"
            >
              {chapter.number}
            </span>
            <span
              class="group-hover:underline group-hover:underline-offset-4 truncate w-42 text-start"
            >
              {chapter?.title ?? "No title provided."}
            </span>
          </div>
          <Tooltip title={isReadedHere ? "Remove readed" : "Mark as read"}>
            <Button
              class="h-7 w-7 "
              variant="ghost"
              size="sm"
              tabindex={-1}
              onclick={async (e) => {
                e.stopPropagation();
                if (favorite) {
                  await addReadedBelow(
                    chapter,
                    $globalChapters,
                    favorite,
                    $readeds
                  );
                  await refreshReadeds(favorite);
                }
              }}
            >
              <Icon
                icon={isReadedHere ? "lucide:check" : "lucide:minus"}
                class="size-5"
              />
            </Button>
          </Tooltip>
        </Button>
        <!-- <ChapterButton
          {chapter}
          isDownloaded
          isReaded={isReadedHere}
          isDownloading={false}
          noDownload
          onclick={() => {
            const originalIndex = $globalChapters.findIndex(
              (c) => c.chapter_id === chapter.chapter_id
            );
            openMenuChapters.set(false);
            gotoPage(`/reader/${favorite?.id}/${originalIndex}`);
          }}
          onreadclick={async (e) => {
            e.stopPropagation();
            if (favorite) {
              await addReadedBelow(
                chapter,
                $globalChapters,
                favorite,
                $readeds
              );
              await refreshReadeds(favorite);
            }
          }}
        /> -->
      {/snippet}
    </VList>
    <!-- <div
      class="w-full overflow-y-auto mb-5 pb-1 flex flex-col rounded-md border"
    >
      {#each $globalChapters as chapter, i}
        <Button
          class="w-full flex justify-between {currentlyChapter?.chapter_id ===
          chapter.chapter_id
            ? 'bg-slate-800'
            : ''}"
          variant="ghost"
          onclick={() => {
            if (closeOnChange) openMenuChapters.set(false);
            gotoPage(`/reader/${favorite?.id}/${i}`);
          }}
        >
          <span class="pl-5">
            {chapter.number}
          </span>
          <span class="text-sm text-gray-500 truncate">
            {chapter?.title ?? "No title given"}
          </span>
        </Button>
      {/each}
    </div> -->
  </Sheet.Content>
</Sheet.Root>
