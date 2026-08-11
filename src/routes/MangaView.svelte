<script lang="ts">
  import { Image } from "@/components";
  import Tooltip from "@/components/common/Tooltip.svelte";
  import { Badge, Button, ContextMenu, Input, Label } from "@/lib/components";
  import { suwaManager } from "@/lib/helpers";
  import {
    cn,
    fromEpochMillis,
    fromEpochSeconds,
    timeAgo,
    titleCase,
  } from "@/lib/utils";
  import {
    crEvent,
    currentMangaTab,
    openedManga,
    openedMangas,
    suwayomi,
    themeMode,
    timeH,
  } from "@/states";
  import type { ChapterListItem } from "@/types/server";
  import Icon from "@iconify/svelte";
  import { ScrollingValue } from "svelte-ux";
  import { VList } from "virtua/svelte";
  import { marked } from "marked";
  import DOMPurify from "dompurify";
  import { copyText } from "@/functions";
  import { fly, slide } from "svelte/transition";
  import { quartIn, quintIn } from "svelte/easing";
  import { delay } from "@/utils";
  import { openUrl } from "@tauri-apps/plugin-opener";

  let chaptersCache: Record<string, ChapterListItem[]> = $state({});

  openedManga.onvaluechange = () => {
    if ("s" in manga && openedManga.value !== "") {
      const key = openedManga.value;
      suwaManager.getMangaScreen(manga.s.id).then((m) => {
        openedMangas.value[openedManga.value] = { s: m };
        if (!m.initialized) {
          crEvent.val[key] = true;
          suwaManager.fetchManga(m.id).then((mf) => {
            openedMangas.value[key] = { s: mf };
            delay(1000).then(() => {
              crEvent.val[key] = false;
            });
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
            genre: manga.s.genre,
            author: manga.s.author,
            artist: manga.s.artist,
            sourceId: manga.s.sourceId,
            status: manga.s.status,
          }
        : {
            title: manga.db.title,
            cover: manga.db.currentCover,
            description: manga.db.description,
            realUrl: "",
            genre: manga.db.genre,
            author: manga.db.author,
            artist: manga.db.artist,
            sourceId: "",
            status: "UNKNOWN",
          }
      : undefined,
  );

  let currentChapters = $derived(chaptersCache[openedManga.value] ?? []);
  let chaptersFilter = $state("");
  let filteredChapters = $derived(
    currentChapters.filter((c) =>
      c.name.toLowerCase().includes(chaptersFilter),
    ),
  );
  let groupedChapters = $derived(
    Object.entries(Object.groupBy(filteredChapters, (c) => c.chapterNumber)),
  );

  let lastFetchedAt = $derived(
    fromEpochSeconds(currentChapters.at(0)?.fetchedAt),
  );

  const renderer = new marked.Renderer();
  renderer.link = ({ href, title, text }) => {
    const titleAttr = title ? ` title="${title}"` : "";
    return `<button type="button" class="px-2 py-0.5 transition-all duration-400 hover:bg-background/60 mr-1 border border-background rounded-lg cursor-pointer" data-type="copy" data-url="${href}">Copy</button> <button type="button" class="manga-link underline cursor-pointer text-blue-500 hover:text-blue-400" data-type="open" data-url="${href}"${titleAttr}>${text}</button>`;
  };

  let mdDesc = $derived(
    mangaJ?.description
      ? DOMPurify.sanitize(
          marked.parse(mangaJ.description, {
            async: false,
            breaks: false,
            renderer,
          }),
          { ADD_TAGS: ["button"], ADD_ATTR: ["data-url", "type"] },
        )
      : "",
  );

  function handleDescClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    const btn = target.closest<HTMLButtonElement>("button[data-url]");
    if (!btn) return;
    if (btn.dataset.type === "open") {
      openUrl(btn.dataset.url!);
    } else {
      copyText(btn.dataset.url!, "URL");
    }
  }

  let sources = $derived(
    mangaJ !== undefined
      ? "s" in manga
        ? [suwayomi.sourcesById[mangaJ.sourceId]]
        : []
      : [],
  );

  // $inspect(sources);
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
          class="h-10 w-13"
          variant="ghost"
          onclick={() => openedManga.close()}
        >
          <Icon class="size-5!" icon="lucide:chevron-left" />
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
            disabled={!("db" in mangaJ)}
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
            disabled={!("db" in mangaJ)}
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
      class="flex h-full max-h-[calc(100%-90px)] transition-transform duration-400 ease-in-out"
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
            class="h-13 w-10 rounded-r-none border-r-0"
            variant="outline"
            onclick={() => {
              currentMangaTab.value = "read";
            }}
          >
            <Icon icon="lucide:book-open-text" />
          </Button>
        </div>
      </div>
      <div class="flex w-1/3 gap-3 pb-4">
        <div class="flex h-full flex-col justify-center">
          <Button
            class="h-13 w-10 rounded-l-none border-l-0"
            variant="outline"
            disabled={!("db" in mangaJ)}
            onclick={() => {
              currentMangaTab.value = "edit";
            }}
          >
            <Icon icon="lucide:pen" />
          </Button>
        </div>
        <div
          class="scrollbar flex h-full w-6/11 flex-col gap-2 overflow-x-hidden overflow-y-auto"
        >
          <div class="flex w-full gap-2">
            <Image
              class="h-105 w-70 shrink-0 rounded-lg object-cover"
              src={mangaJ.cover}
            />
            <div
              class="flex max-h-105 w-[calc(100%-18rem)] flex-col items-center *:justify-between *:rounded-lg *:text-sm *:font-semibold"
            >
              <Badge
                class="group mb-0.5 w-full gap-1"
                variant="background"
                onclick={() => {
                  copyText(mangaJ.title, "Title");
                }}
              >
                <div class="text-base text-wrap">
                  {mangaJ.title}
                </div>
                <div>
                  <Icon
                    class="size-4! opacity-0 transition-opacity duration-400 group-hover:opacity-100"
                    icon="lucide:copy"
                  />
                </div>
              </Badge>
              {#if mangaJ.author}
                <div
                  class="mt-0.5 w-full"
                  in:slide={{
                    duration: crEvent.val[openedManga.value] ? 500 : 0,
                    easing: quintIn,
                  }}
                >
                  <Badge
                    class="group w-full justify-between gap-2 rounded-lg text-sm font-semibold"
                    variant="outline"
                    onclick={() => {
                      copyText(mangaJ.author ?? "", "author");
                    }}
                  >
                    <div class="text-wrap">
                      <span class="mr-1 text-gray-400">Author</span>
                      {mangaJ.author}
                    </div>
                    <div>
                      <Icon
                        class="size-4! shrink-0 opacity-0 transition-opacity duration-400 group-hover:opacity-100"
                        icon="lucide:copy"
                      />
                    </div>
                  </Badge>
                </div>
              {/if}
              {#if mangaJ.artist}
                <div
                  class="mt-0.5 w-full"
                  in:slide={{
                    duration: crEvent.val[openedManga.value] ? 500 : 0,
                    easing: quintIn,
                  }}
                >
                  <Badge
                    class="group w-full justify-between gap-2 rounded-lg text-sm font-semibold"
                    variant="outline"
                    onclick={() => {
                      copyText(mangaJ.artist ?? "", "artist");
                    }}
                  >
                    <div class="text-wrap">
                      <span class="mr-1 text-gray-400">Artist</span>
                      {mangaJ.artist}
                    </div>
                    <div>
                      <Icon
                        class="size-4! opacity-0 transition-opacity duration-400 group-hover:opacity-100"
                        icon="lucide:copy"
                      />
                    </div>
                  </Badge>
                </div>
              {/if}
              {#if mangaJ.status && mangaJ.status !== "UNKNOWN"}
                <div
                  class="mt-0.5 w-full"
                  in:slide={{
                    duration: crEvent.val[openedManga.value] ? 500 : 0,
                    easing: quintIn,
                  }}
                >
                  <Badge
                    class="group w-full justify-between gap-2 rounded-lg text-sm font-semibold"
                    variant="outline"
                    onclick={() => {
                      copyText(mangaJ.status ?? "", "status");
                    }}
                  >
                    <div class="flex">
                      <span class="mr-1 text-gray-400">Status</span>
                      {titleCase(mangaJ.status)}
                    </div>
                    <div>
                      <Icon
                        class="size-4! opacity-0 transition-opacity duration-400 group-hover:opacity-100"
                        icon="lucide:copy"
                      />
                    </div>
                  </Badge>
                </div>
              {/if}
              <div class="mt-2 flex w-full items-center">
                <span class="text-base transition-none!">
                  Source{"db" in manga ? "s" : ""}
                </span>
                <div class="flex gap-1">
                  <Button
                    class="size-8 overflow-hidden rounded-lg"
                    variant="ghost"
                    disabled={"s" in manga}
                  >
                    <Icon class="size-4!" icon="lucide:arrow-down-up" />
                  </Button>
                  <Button
                    class="size-8 overflow-hidden rounded-lg"
                    variant="ghost"
                    disabled={"s" in manga}
                  >
                    <Icon class="size-4!" icon="lucide:plus" />
                  </Button>
                </div>
              </div>
              {#each sources as source, i (i)}
                {let wasOpen = $state(false)}
                <ContextMenu.Root
                  onOpenChange={(v) => {
                    delay(300).then(() => {
                      wasOpen = v;
                    });
                  }}
                >
                  <ContextMenu.Trigger
                    class="w-full"
                    disabled={!openedManga.active}
                  >
                    <Button
                      class="group relative flex w-full overflow-hidden rounded-lg pr-2 pl-1"
                      variant="ghost"
                    >
                      <div class="flex w-full items-center gap-1">
                        <Image
                          class="size-10 shrink-0 object-cover"
                          src={source.iconUrl}
                        />
                        <span class="truncate">
                          {source.displayName}
                        </span>
                      </div>
                      <Button
                        class="absolute top-1 right-1 h-8 w-7 rounded-lg px-2 opacity-0 backdrop-blur-sm transition-opacity duration-400 group-hover:opacity-100"
                        variant="ghost"
                        onclick={(e) => {
                          e.stopPropagation();
                          if (wasOpen) return;
                          const event = new MouseEvent("contextmenu", {
                            bubbles: true,
                            clientX: e.clientX,
                            clientY: e.clientY,
                          });
                          e.currentTarget.parentElement?.dispatchEvent(event);
                        }}
                      >
                        <Icon icon="lucide:ellipsis-vertical" />
                      </Button>
                    </Button>
                  </ContextMenu.Trigger>
                  <ContextMenu.Content>
                    <ContextMenu.Item
                      onclick={() => {
                        openUrl(mangaJ.realUrl ?? "");
                      }}
                    >
                      <Icon icon="lucide:external-link" />Open in browser
                    </ContextMenu.Item>
                    <ContextMenu.Separator />
                    <ContextMenu.Item>
                      <Icon icon="lucide:search" />
                      Search with source
                    </ContextMenu.Item>
                    <ContextMenu.Item>
                      <Icon icon="lucide:info" />See extension
                    </ContextMenu.Item>
                  </ContextMenu.Content>
                </ContextMenu.Root>
              {/each}
              <!-- <Icon icon="lucide:square-arrow-out-up-right" /> -->
            </div>
          </div>
          <div class="flex w-full flex-col items-center">
            {let wasOpen = $state(false)}
            <ContextMenu.Root
              onOpenChange={(v) => {
                delay(300).then(() => {
                  wasOpen = v;
                });
              }}
            >
              <ContextMenu.Trigger
                class="flex w-full gap-1"
                disabled={!openedManga.active}
              >
                <Button variant="outline">
                  <Icon icon="lucide:bookmark-off" />
                  Add as entry
                </Button>
                <Button variant="secondary">
                  <Icon icon="lucide:squares-subtract" />
                  Add as source
                </Button>
                <Button
                  variant="ghost"
                  onclick={(e) => {
                    e.stopPropagation();
                    if (wasOpen) return;
                    const event = new MouseEvent("contextmenu", {
                      bubbles: true,
                      clientX: e.clientX,
                      clientY: e.clientY,
                    });
                    e.currentTarget.parentElement?.dispatchEvent(event);
                  }}
                >
                  <Icon icon="lucide:ellipsis-vertical" />
                </Button>
              </ContextMenu.Trigger>
              <ContextMenu.Content>
                <ContextMenu.Item
                  onclick={() => {
                    if ("s" in manga) {
                      const key = openedManga.value;
                      crEvent.val[key] = true;
                      suwaManager.fetchManga(manga.s.id).then((mf) => {
                        openedMangas.value[key] = { s: mf };
                        delay(1000).then(() => {
                          crEvent.val[key] = false;
                        });
                      });
                    }
                  }}
                >
                  <Icon icon="lucide:refresh-cw" /> Refresh data
                </ContextMenu.Item>
              </ContextMenu.Content>
            </ContextMenu.Root>
            {#if mdDesc.length > 0}
              <div
                class="flex w-full flex-col items-center"
                in:slide={{
                  duration: crEvent.val[openedManga.value] ? 500 : 0,
                  easing: quintIn,
                }}
              >
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div
                  class={cn(
                    "manga-desc prose prose-invert text-primary mt-2 block min-w-0 overflow-hidden px-2 pt-0.5 text-sm transition-[max-height] duration-400 select-auto",
                    showDesc ? "max-h-600" : "max-h-16",
                  )}
                  onclick={handleDescClick}
                >
                  {@html mdDesc}
                </div>
                <Button
                  class={cn(
                    "mb-2 h-6 rounded-lg backdrop-blur-sm transition-all duration-400",
                    showDesc ? "" : "-mt-3",
                  )}
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
            {/if}
            {#if mangaJ.genre}
              <div
                class="flex w-full flex-wrap"
                in:slide={{
                  duration: crEvent.val[openedManga.value] ? 500 : 0,
                  easing: quintIn,
                }}
              >
                {#each mangaJ.genre as genre, i (i)}
                  <div
                    class="mt-0.5 ml-0.5"
                    in:slide={{
                      duration: crEvent.val[openedManga.value] ? 500 : 0,
                      easing: quintIn,
                      axis: "x",
                    }}
                  >
                    <Badge
                      class="text-sm"
                      variant="outline"
                      onclick={() => {
                        copyText(genre, "genre");
                      }}
                    >
                      {genre}
                    </Badge>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
        <div
          class="bg-background/70 flex h-full w-5/11 flex-col gap-2 rounded-xl p-2"
        >
          <div
            class="bg-secondary/40 flex w-full flex-col gap-1.5 rounded-lg p-1"
          >
            <div class="flex flex-col items-center gap-1.5 lg:flex-row">
              <div class="flex w-full gap-1.5">
                <Badge class="h-10 min-w-18 rounded-lg" variant="outline">
                  <ScrollingValue value={filteredChapters.length} />
                  /
                  <ScrollingValue value={currentChapters.length} />
                </Badge>
                <Input
                  class="rounded-lg"
                  variant="outline"
                  placeholder="Filter chapters..."
                  bind:value={chaptersFilter}
                  autofocus
                />
              </div>
              <div class="flex w-full gap-2"></div>
            </div>
            <!-- <div class="bg-primary/80 h-1 w-full rounded-2xl"></div> -->
            <div class="flex items-center gap-1.5">
              <Tooltip text={lastFetchedAt.toLocaleString()}>
                <Button
                  class="rounded-lg"
                  variant="secondary"
                  onclick={() => {
                    // suwaManager.refreshManga()
                    if ("s" in manga) {
                      suwaManager
                        .getChaptersManga(manga.s.id, true)
                        .then((data) => {
                          chaptersCache[openedManga.value] = data.nodes;
                        });
                    }
                  }}
                >
                  <Icon icon="lucide:refresh-cw" />
                  Fetched:
                  <span class="font-bold">
                    {#key timeH.minutes}
                      {timeAgo(lastFetchedAt)}
                    {/key}
                  </span>
                </Button>
              </Tooltip>
              <!-- <Badge class="h-10" variant="outline">
                  <Label>
                  </Label>
                </Badge> -->
              <Button class="w-full rounded-lg" variant="outline">
                <Icon icon="lucide:play" />
                Chapter {currentChapters.at(-1)?.chapterNumber}
              </Button>
            </div>
          </div>
          <VList class="scrollbar px-1" data={filteredChapters}>
            {#snippet children(chapter, _)}
              <Button
                class="mb-0.5 h-16 w-full flex-col items-start justify-start gap-1"
                variant="outline"
                onclick={() => {
                  console.log(chapter);
                }}
              >
                <span class="text-sm font-semibold">
                  {chapter.name}
                  <!-- .replace(`Chapter ${chapter.chapterNumber} - `, "")
                    .replace(`Chapter ${chapter.chapterNumber}`, "")} -->
                </span>
                <span class="flex text-xs">
                  {#if chapter.scanlator && chapter.scanlator !== "Unknown" && chapter.scanlator
                      .replace(/[\u200B-\u200D\uFEFF]/g, "")
                      .trim() != ""}
                    {chapter.scanlator}
                    •
                  {/if}
                  {fromEpochMillis(chapter.uploadDate).toLocaleDateString()}
                </span>
              </Button>
            {/snippet}
          </VList>
        </div>
        <div class="flex h-full flex-col justify-center">
          <Button
            class="h-13 w-10 rounded-r-none border-r-0"
            variant="outline"
            disabled={!("db" in mangaJ)}
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
            class="h-13 w-10 rounded-l-none border-l-0"
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
        <Button class="w-30" onclick={() => openedManga.close()}>
          <Icon icon="lucide:arrow-big-left" />
          Go back
        </Button>
      </div>
    </div>
  {/if}
</div>

<style>
  .manga-desc :global(ul) {
    list-style-type: disc !important;
  }
  .manga-desc :global(ul li) {
    list-style-type: disc !important;
    display: list-item !important;
  }
</style>
