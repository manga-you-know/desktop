<script lang="ts">
  import { goto, onNavigate } from "$app/navigation";
  import { page } from "$app/state";
  import { Image } from "@/components";
  import { Button, Label } from "@/lib/components";
  import { suwaManager } from "@/lib/helpers";
  import { cn } from "@/lib/utils";
  import {
    currentMangaTab,
    lastPage,
    openedManga,
    openedMangas,
    themeMode,
  } from "@/states";
  import Icon from "@iconify/svelte";

  // let { currentMangaKey.value }: { key: string } = $props();

  // $inspect(page.url);
  // let count = 0;

  openedManga.onvaluechange = () => {
    showDesc = false;
    if ("s" in manga && openedManga.value !== "") {
      suwaManager.getMangaScreen(manga.s.id).then((m) => {
        openedMangas.value[openedManga.value] = { s: m };
        if (!m.initialized) {
          suwaManager.fetchManga(m.id).then((mf) => {
            openedMangas.value[openedManga.value] = { s: mf };
          });
        }
      });
    }
  };

  let showDesc = $state(false);
  let manga = $derived(openedMangas.value[openedManga.value]);
  let mangaJ = $derived(
    manga
      ? "s" in manga
        ? {
            name: manga.s.title,
            cover: manga.s.thumbnailUrl,
            description: manga.s.description,
          }
        : {
            name: manga.db.name,
            cover: manga.db.currentCover,
            description: manga.db.description,
          }
      : undefined,
  );
</script>

<div
  class={cn(
    "flex h-full w-full flex-col items-center gap-4 rounded-lg p-3 backdrop-blur-sm",
    themeMode.value === "dark" ? "bg-accent/95" : "bg-accent/70",
  )}
>
  {#if mangaJ}
    <div class="flex w-full justify-between">
      <div class="flex w-[calc(100%-19rem)] items-center gap-3">
        <Button
          variant="outline"
          onclick={() => {
            openedManga.close();
          }}
        >
          <Icon class="size-5!" icon="lucide:arrow-left" />
        </Button>
        <Label class="truncate pr-5 text-2xl text-nowrap">{mangaJ.name}</Label>
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
    <div class="flex w-full gap-3">
      <div class="flex flex-col gap-2">
        <Image class="h-110 w-70 rounded-lg object-cover" src={mangaJ.cover} />
        <div class="relative flex flex-col items-center">
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
