<script lang="ts">
  import { Image } from "@/components";
  import { Button, Label } from "@/lib/components";
  import { suwaManager } from "@/lib/helpers";
  import { cn } from "@/lib/utils";
  import {
    currentMangaTab,
    openedManga,
    openedMangas,
    themeMode,
  } from "@/states";
  import type { ChapterListItem } from "@/types/server";
  import Icon from "@iconify/svelte";
  import { VList } from "virtua/svelte";

  let chaptersCache: Record<string, ChapterListItem[]> = $state({});

  openedManga.onvaluechange = () => {
    showDesc = false;
    if ("s" in manga && openedManga.value !== "") {
      const key = openedManga.value;
      suwaManager.getMangaScreen(manga.s.id).then((m) => {
        openedMangas.value[openedManga.value] = { s: m };
        if (!m.initialized) {
          suwaManager.fetchManga(m.id).then((mf) => {
            openedMangas.value[key] = { s: mf };
          });
        }
      });
      if (!chaptersCache[key] || chaptersCache[key].length === 0) {
        const mangaId = manga.s.id;
        suwaManager.getChaptersManga(mangaId).then((r) => {
          if (r.totalCount === 0) {
            suwaManager
              .refreshManga(mangaId, {
                fetchManga: false,
                fetchChapters: true,
              })
              .then((r2) => {
                if (r2.chapters?.length) {
                  suwaManager.getChaptersManga(mangaId, true).then((r3) => {
                    console.log(r3);
                    chaptersCache[key] = r3.nodes;
                  });
                }
              });
          } else {
            chaptersCache[key] = r.nodes;
          }
        });
      }
    }
  };

  let showDesc = $state(false);
  let manga = $derived(openedMangas.value[openedManga.value]);
  let mangaJ = $derived(
    manga
      ? "s" in manga
        ? {
            title: manga.s.title,
            cover: manga.s.thumbnailUrl,
            description: manga.s.description,
            realUrl: manga.s.realUrl,
          }
        : {
            title: manga.db.title,
            cover: manga.db.currentCover,
            description: manga.db.description,
            realUrl: manga,
          }
      : undefined,
  );

  let currentChapters = $derived(chaptersCache[openedManga.value] ?? []);
</script>

<div
  class={cn(
    "flex h-full w-full flex-col items-center gap-4 overflow-hidden rounded-lg backdrop-blur-sm",
    themeMode.value === "dark" ? "bg-accent/95" : "bg-accent/70",
  )}
>
  {#if mangaJ}
    <div class="flex w-full justify-between p-3">
      <div class="flex w-[calc(100%-19rem)] items-center gap-3">
        <Button
          variant="outline"
          onclick={() => {
            openedManga.close();
          }}
        >
          <Icon class="size-5!" icon="lucide:arrow-left" />
        </Button>
        <Label class="truncate pr-5 text-2xl text-nowrap">{mangaJ.title}</Label>
      </div>
      <div class="flex w-76 justify-end">
        <div
          class="bg-background/30 parent flex justify-start gap-1 rounded-xl p-1"
        >
          <Button
            class={cn(
              "pointer-events-none absolute h-9 w-24 rounded-lg transition-all duration-200",
              currentMangaTab.value === "edit" && "translate-x-0",
              currentMangaTab.value === "read" && "translate-x-25",
              currentMangaTab.value === "images" && "translate-x-50",
            )}
          ></Button>
          <Button
            class={cn(
              "z-2 h-9 w-24 rounded-lg",
              currentMangaTab.value === "edit"
                ? "text-background hover:bg-secondary/10 hover:text-background/80"
                : "hover:bg-secondary/40 hover:text-primary/80",
            )}
            variant="ghost"
            onclick={() => {
              currentMangaTab.value = "edit";
            }}
          >
            <Icon icon="lucide:pen" /> Edit
          </Button>
          <Button
            class={cn(
              "z-2 h-9 w-24 rounded-lg",
              currentMangaTab.value === "read"
                ? "text-background hover:bg-secondary/10 hover:text-background/80"
                : "hover:bg-secondary/40 hover:text-primary/80",
            )}
            variant="ghost"
            onclick={() => {
              currentMangaTab.value = "read";
            }}
          >
            <Icon icon="lucide:book-open-text" /> Read
          </Button>
          <Button
            class={cn(
              "z-2 h-9 w-24 rounded-lg",
              currentMangaTab.value === "images"
                ? "text-background hover:bg-secondary/10 hover:text-background/80"
                : "hover:bg-secondary/40 hover:text-primary/80",
            )}
            variant="ghost"
            onclick={() => {
              currentMangaTab.value = "images";
            }}
          >
            <Icon icon="lucide:image" /> Images
          </Button>
        </div>
      </div>
    </div>
    <!-- <div class="bg-accent h-px w-full rounded-lg"></div> -->
    <div
      class="flex h-full transition-transform duration-400 ease-in-out"
      style="width: 300%; transform: translateX({currentMangaTab.value ===
      'edit'
        ? '33.3333%'
        : currentMangaTab.value === 'read'
          ? '0%'
          : '-33.3333%'})"
    >
      <!-- <div class="flex h-full w-full justify-between gap-3"> -->
      <div class="flex w-1/3 gap-3">
        <div class="flex w-full flex-col gap-2"></div>
        <div class="flex h-full flex-col justify-center">
          <Button
            class="w-10 rounded-r-none border-r-0"
            variant="outline"
            onclick={() => {
              currentMangaTab.value = "read";
            }}
          >
            <Icon icon="lucide:book-open-text" />
          </Button>
        </div>
      </div>
      <div class="flex w-1/3 gap-3">
        <div class="flex h-full flex-col justify-center">
          <Button
            class="w-10 rounded-l-none border-l-0"
            variant="outline"
            onclick={() => {
              currentMangaTab.value = "edit";
            }}
          >
            <Icon icon="lucide:pen" />
          </Button>
        </div>
        <div class="flex w-full flex-col gap-2">
          <Image
            class="h-110 w-70 rounded-lg object-cover"
            src={mangaJ.cover}
          />
          <div class="relative flex flex-col">
            <span
              class={cn(
                "block w-70 min-w-0 overflow-hidden text-xs text-wrap transition-[max-height] duration-400 select-auto",
                showDesc ? "max-h-200" : "max-h-12",
              )}
            >
              {mangaJ.description}
            </span>
            <Button
              class="size-8"
              variant="ghost"
              onclick={() => {
                showDesc = !showDesc;
              }}
            >
              <Icon
                class={cn(
                  "transition-all duration-400",
                  showDesc && "rotate-180",
                )}
                icon="lucide:chevron-down"
              />
            </Button>
          </div>
        </div>
        <div class="flex h-full w-full flex-col">
          <div class="flex w-full items-center gap-2">
            <Button>{currentChapters.length}</Button>
            <Button>Idk</Button>
          </div>
          <VList data={currentChapters}>
            {#snippet children(chapter, _)}
              <Button
                class="h-16 w-full flex-col items-start justify-start gap-1"
                variant="outline"
                onclick={() => {
                  console.log(chapter);
                }}
              >
                <span class="text-sm">
                  {chapter.name}
                  <!-- .replace(`Chapter ${chapter.chapterNumber} - `, "")
                    .replace(`Chapter ${chapter.chapterNumber}`, "")} -->
                </span>
                <span class="flex text-xs">
                  <!-- {#if chapter.name !== `Chapter ${chapter.chapterNumber}`} -->
                  <!-- {/if} -->
                  {chapter.chapterNumber}
                  {#if chapter.scanlator && chapter.scanlator !== "Unknown"}
                    •
                    {chapter.scanlator}
                  {/if}
                  {#if chapter.uploadDate !== "0"}
                    •
                    {new Date(Number(chapter.uploadDate)).toLocaleDateString()}
                  {/if}
                </span>
              </Button>
            {/snippet}
          </VList>
        </div>
        <div class="flex h-full flex-col justify-center">
          <Button
            class="w-10 rounded-r-none border-r-0"
            variant="outline"
            onclick={() => {
              currentMangaTab.value = "images";
            }}
          >
            <Icon icon="lucide:images" />
          </Button>
        </div>
      </div>
      <div class="flex w-1/3 gap-3">
        <div class="flex h-full flex-col justify-center">
          <Button
            class="w-10 rounded-l-none border-l-0"
            variant="outline"
            onclick={() => {
              currentMangaTab.value = "read";
            }}
          >
            <Icon icon="lucide:book-open-text" />
          </Button>
        </div>
        <div class="flex w-full flex-col gap-2"></div>
      </div>
      <!-- <div class="flex h-full w-full flex-col"></div> -->
    </div>
  {:else}
    <div class="flex h-full w-full flex-col items-center justify-center gap-2">
      <Label class="text-5xl font-bold">(×﹏×)</Label>
      <Label class="text-xl">Unable to load manga</Label>
      <div class="flew-wrap flex items-center justify-center gap-1"></div>
      <div class="flex justify-center gap-2">
        <Button
          class="w-30"
          onclick={() => {
            openedManga.close();
          }}
        >
          <Icon icon="lucide:arrow-big-left" />
          Go back
        </Button>
      </div>
    </div>
  {/if}
</div>
