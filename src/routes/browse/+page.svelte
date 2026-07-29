<script lang="ts">
  import { MangaFetchCard, SelectSourceOrGroup, Tooltip } from "@/components";
  import { Badge, Button, Checkbox, Input, Label } from "@/lib/components";
  import { suwaManager } from "@/lib/helpers";
  import { cn, titleCase } from "@/lib/utils";
  import {
    openExtensions,
    searchInput,
    sourceGroupMode,
    searchType,
    suwayomi,
    selectedSourceId,
    openedSearchFilters,
    hideOnLibrary,
    dbHelper,
    openedManga,
    currentMangaTab,
  } from "@/states";
  import type {
    FetchSourceMangaResult,
    FilterChange,
    MangaFetch,
    SourceBrowse,
  } from "@/types/server";
  import { limitStr } from "@/utils";
  import Icon from "@iconify/svelte";
  import { writeText } from "@tauri-apps/plugin-clipboard-manager";
  import { animate } from "animejs";
  import { onMount, untrack } from "svelte";
  import { ScrollingValue } from "svelte-ux";
  import { fade } from "svelte/transition";
  import { VList } from "virtua/svelte";
  import MangaView from "../MangaView.svelte";

  let selectedSource = $derived(suwayomi.sourcesById[selectedSourceId.value]);
  let openSelectSource = $state(false);
  let wasOpenSourceOpen = false;
  let sourceBrowse: SourceBrowse | undefined = $state();
  let debounceTimer: ReturnType<typeof setTimeout>;
  let resultsQuery = $state("");
  let changes: FilterChange[] = $state([]);

  type State = {
    loading?: boolean;
    error?: boolean;
    message?: string;
  };

  let fetchedMangaData = $state<
    Record<string, Record<number, FetchSourceMangaResult & State>>
  >({});
  let currentKey = $derived(
    [
      selectedSourceId.value,
      searchType.value,
      searchType.value === "SEARCH"
        ? searchInput.value + JSON.stringify(changes)
        : "",
    ].join("::"),
  );
  let pages = $derived(Object.values(fetchedMangaData[currentKey] ?? {}));
  let lastPage = $derived(pages.at(-1));
  let searchState = $derived<"idle" | "loading" | "error">(
    lastPage?.error ? "error" : lastPage?.loading ? "loading" : "idle",
  );
  let results = $derived<MangaFetch[]>(pages.flatMap((fm) => fm.mangas) ?? []);

  const search = async (goBeyoundTwo: boolean = false) => {
    if (selectedSourceId.value === undefined || selectedSourceId.value === "")
      return;
    const key = currentKey;
    const lastData = Object.values(fetchedMangaData[key] ?? {});
    if (lastData.length > 0 && !lastPage?.hasNextPage && !lastPage?.error)
      return;
    const page = lastData.length + 1;
    if (page === 1) {
      fetchedMangaData[key] = {};
    }
    if ((page === 3 && !goBeyoundTwo) || fetchedMangaData[key][page]?.loading)
      return;
    fetchedMangaData[key][page] = {
      mangas: [],
      loading: true,
      hasNextPage: false,
    };
    await suwaManager
      .fetchSourceManga({
        source: selectedSourceId.value,
        type: searchType.value,
        query: searchInput.value,
        page: page,
        filters: changes,
      })
      .then((data) => {
        fetchedMangaData[key][page] = data;
        if (data.hasNextPage && page === 1) {
          search();
        }
      })
      .catch((e) => {
        fetchedMangaData[key][page] = {
          mangas: [],
          hasNextPage: false,
          error: true,
          message: e.toString(),
        };
      });
  };

  const handleInput = () => {
    if (searchType.value !== "SEARCH") {
      searchType.value = "SEARCH";
    }
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      resultsQuery = "";
      search();
    }, 600);
  };

  let scrollContainer: HTMLDivElement = $state(null!);
  let sentinel: HTMLDivElement = $state(null!);
  let observerRef: IntersectionObserver | null = null;
  let divWidth = $state(0);
  let divOffset = $state(0);

  let filteredManga: MangaFetch[] = $derived(
    results.filter(
      (m) =>
        m.title.toLowerCase().includes(resultsQuery.toLowerCase()) &&
        (hideOnLibrary.value
          ? dbHelper.sourcesByIdMangaSource[m.id + m.sourceId] === undefined
          : true),
    ),
  );

  let itemsPerRow = $derived(Math.floor(divWidth / 250));

  let rowedMangas: MangaFetch[][] = $derived.by(() => {
    if (!scrollContainer || divWidth < 210) return [filteredManga];
    return filteredManga.reduce((acc: MangaFetch[][], _, i) => {
      if (i % itemsPerRow === 0)
        acc.push(filteredManga.slice(i, i + itemsPerRow));
      return acc;
    }, []);
  });

  /* selectedSourceId.onchange = (s) => {
    if (selectedSource) {
      if (!selectedSource.supportsLatest && searchType.value === "LATEST") {
        searchType.value = "POPULAR";
      }
      suwaManager.getSourceBrowse(s).then((sb) => {
        sourceBrowse = sb;
      });
      search();
    } else {
      sourceBrowse = undefined;
    }
  }; */

  $effect(() => {
    if (selectedSource) {
      untrack(() => {
        if (!selectedSource.supportsLatest && searchType.value === "LATEST") {
          searchType.value = "POPULAR";
        }
        suwaManager.getSourceBrowse(selectedSource.id).then((sb) => {
          sourceBrowse = sb;
        });
        search(false);
      });
    } else {
      sourceBrowse = undefined;
    }
  });

  searchType.onchange = () => {
    document.getElementById("div-mangas")?.scroll({ top: 0 });
    search(false);
  };

  onMount(() => {
    if (suwayomi.enabledSources.length > 0 && selectedSourceId.value === "") {
      selectedSourceId.value = suwayomi.enabledSources[0].id ?? "";
    }
    if (selectedSource) {
      suwaManager.getSourceBrowse(selectedSourceId.value).then((sb) => {
        sourceBrowse = sb;
      });
      if (!selectedSource.supportsLatest && searchType.value === "LATEST") {
        searchType.value = "POPULAR";
      }
      search();
    } else {
      sourceBrowse = undefined;
    }
  });

  $effect(() => {
    if (
      rowedMangas.length < 3 &&
      results.length < 100 &&
      searchState === "idle"
    ) {
      search(true);
    }
  });

  $effect(() => {
    if (selectedSource && results.length === 0 && searchState === "idle") {
      search(false);
    }
  });

  $effect(() => {
    if (!sentinel || !scrollContainer) return;
    observerRef = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && rowedMangas.length > 4) {
          observerRef?.unobserve(sentinel);
          search(true).then(() => {
            observerRef?.observe(sentinel);
          });
        }
      },
      { root: scrollContainer, rootMargin: "300px 0px" },
    );
    observerRef.observe(sentinel);
    return () => observerRef?.disconnect();
  });

  // $inspect(searchState, lastPage);

  openedManga.onopenchange = (v) => {
    if (!v) {
      currentMangaTab.value = "read";
    }
  };
</script>

<div class="relative flex h-full w-full">
  <div
    class={cn(
      "absolute z-5 h-full w-full transition-all duration-500 ease-in-out",
      openedManga.active
        ? "translate-x-0 opacity-100"
        : "pointer-events-none translate-x-80 opacity-0",
    )}
  >
    <MangaView />
  </div>
  <div class="justify-around-stretch absolute flex h-full w-full flex-col">
    <div class="my-2 flex items-center justify-center gap-2">
      <Badge class="h-10 w-14" variant="outline">
        <ScrollingValue value={results.length} />
      </Badge>
      <Input
        class="hover:bg-secondary/20 w-70 transition-all"
        divClass="w-70 transition-all"
        variant="outline"
        placeholder="Query in source{sourceGroupMode.value !== 'single'
          ? 's'
          : ''}..."
        oninput={handleInput}
        ondelete={() => {
          if (searchType.value === "SEARCH") search();
        }}
        bind:value={searchInput.value}
      />
      <Tooltip text="Source filters">
        <Button
          class={cn(
            "w-12 transition-all duration-500",
            (sourceGroupMode.value !== "single" ||
              sourceBrowse?.filters.length === 0) &&
              "-mx-1 w-0 p-0 opacity-0",
          )}
          variant="secondary"
          onclick={() => {
            searchType.value = "SEARCH";
            openedSearchFilters.open({ sourceBrowse });
          }}
        >
          <Icon icon="lucide:list-filter" />
        </Button>
      </Tooltip>
      <Tooltip
        text="Source mode"
        subtext={sourceGroupMode.value === "single"
          ? "Single uses a single source to fetch"
          : "Group uses multiple sources to fetch"}
      >
        <Button
          class="w-27 justify-start font-bold"
          onmousedown={() => {
            wasOpenSourceOpen = openSelectSource;
          }}
          onclick={(e) => {
            if (wasOpenSourceOpen) {
              openSelectSource = true;
            }
            if (sourceGroupMode.value === "single") {
              sourceGroupMode.value = "group";
            } else {
              sourceGroupMode.value = "single";
            }
            animate(e.currentTarget, {
              filter: ["blur(1px)", "blur(2px)", "blur(0px)"],
              duration: 500,
              easing: "easeOutQuad",
            });
            animate("#source-select", {
              filter: ["blur(3px)", "blur(0px)"],
              duration: 700,
              easing: "easeOutQuad",
            });
          }}
        >
          <Icon
            icon={sourceGroupMode.value === "single"
              ? "lucide:square-divide"
              : sourceGroupMode.value === "group"
                ? "lucide:layers"
                : "lucide:globe"}
          />
          {titleCase(sourceGroupMode.value)}
        </Button>
      </Tooltip>
      <Tooltip text="Manage extensions & sources">
        <Button class="w-12" variant="outline" onclick={openExtensions.open}>
          <Icon icon="lucide:puzzle" />
        </Button>
      </Tooltip>
    </div>
    <div class="mb-2 flex items-center justify-center gap-2">
      <div
        class="border-secondary bg-background/30 parent flex justify-start gap-1 rounded-xl border p-1"
      >
        <Button
          class={cn(
            "pointer-events-none absolute w-30 rounded-lg transition-all duration-200",
            searchType.value === "POPULAR" && "translate-x-0",
            searchType.value === "LATEST" && "translate-x-31",
            searchType.value === "SEARCH" && "translate-x-62",
          )}
          variant="secondary"
        ></Button>
        <Button
          class={cn(
            "hover:bg-secondary/30 z-2 w-30 rounded-lg",
            searchType.value === "POPULAR" && "hover:text-primary/70",
          )}
          variant="ghost"
          onclick={() => {
            searchType.value = "POPULAR";
          }}
        >
          <Icon icon="lucide:heart" />Popular
        </Button>
        <Button
          class={cn(
            "hover:bg-secondary/30 z-2 w-30 rounded-lg",
            searchType.value === "LATEST" && "hover:text-primary/70",
          )}
          variant="ghost"
          disabled={!selectedSource?.supportsLatest &&
            sourceGroupMode.value === "single"}
          onclick={() => {
            searchType.value = "LATEST";
          }}
        >
          <Icon icon="lucide:badge-info" />Latest
        </Button>
        <Button
          class={cn(
            "hover:bg-secondary/30 z-2 w-30 rounded-lg",
            searchType.value === "SEARCH" && "hover:text-primary/70",
          )}
          variant="ghost"
          onclick={() => {
            searchType.value = "SEARCH";
          }}
        >
          <Icon icon="lucide:search" />Search
        </Button>
      </div>
      <SelectSourceOrGroup bind:open={openSelectSource} {selectedSource} />
      <Button class="h-12.5 w-14" variant="outline">
        <Icon icon="lucide:sliders-horizontal" />
      </Button>
    </div>
    <div class="bg-secondary/40 h-1 w-full rounded-2xl"></div>
    <div
      class="parent flex h-full w-full flex-col items-center scroll-smooth"
      bind:this={scrollContainer}
      bind:clientWidth={divWidth}
    >
      <div
        class="border-background bg-background/30 absolute z-2 mt-0.5 flex items-center justify-center gap-2 rounded-2xl border p-1 backdrop-blur-sm"
      >
        <Badge class="h-10 min-w-20 text-sm font-bold" variant="outline">
          <ScrollingValue value={filteredManga.length} />
          /
          <ScrollingValue value={results.length} />
        </Badge>
        <Input
          class="hover:bg-secondary/20 w-70"
          divClass="w-70"
          variant="outline"
          placeholder="Filter results..."
          bind:value={resultsQuery}
        />
        <Button
          class="items-center"
          variant="ghost"
          onclick={async (e) => {
            animate(e.currentTarget, {
              filter: ["blur(2px)", "blur(4px)", "blur(0px)"],
              duration: 600,
              easing: "easeOutQuad",
            });
            if (!hideOnLibrary.value) {
              animate("#div-mangas", {
                filter: ["blur(4px)", "blur(6px)", "blur(0px)"],
                duration: 600,
                easing: "easeOutQuad",
              });
              await animate(".fetch-card", {
                opacity: [1, 0.5, 0],
                translateX: -40,
                duration: 500,
                easing: "easeInQuad",
              });
            } else {
              animate("#div-mangas", {
                filter: ["blur(4px)", "blur(6px)", "blur(0px)"],
                scale: [1, 0.994, 1],
                duration: 600,
                easing: "easeOutQuad",
              });
            }
            hideOnLibrary.value = !hideOnLibrary.value;
          }}
        >
          <!-- <Icon icon={hideOnLibrary.value ? "lucide:book-x" : "lucide:book-text"} -->
          <!-- /> -->
          <Checkbox
            class="pointer-events-none"
            checked={!hideOnLibrary.value}
          />
          On library
          <!-- {hideOnLibrary.value ? "Show" : "Hide"} -->
        </Button>
      </div>
      <div class="absolute flex w-full justify-end pt-12 pr-8">
        <Button
          class={cn(
            "z-1 h-12 w-13 opacity-100 backdrop-blur-sm transition-opacity duration-500",
            divOffset < 400 && "pointer-events-none opacity-0",
          )}
          variant="outline"
          onclick={() => {
            document.getElementById("div-mangas")?.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}
        >
          <Icon class="size-5!" icon="lucide:arrow-up-from-dot" />
        </Button>
      </div>
      <VList
        class={cn(
          "scrollbar flex w-full scrollbar-thin items-center justify-center scroll-smooth",
          rowedMangas.length === 0 && "h-0!",
        )}
        id="div-mangas"
        data={rowedMangas}
        getKey={(_, i) => i}
        onscroll={(off) => {
          divOffset = off;
        }}
      >
        {#snippet children(row, index)}
          {#if index === 0}
            <div class="mt-12 flex w-full flex-col justify-center p-2"></div>
          {/if}
          <div class="flex w-full justify-center">
            <div class="mb-0.5 inline-flex gap-0.5">
              {#each row as manga (manga.id)}
                <MangaFetchCard {manga} suwaSource={selectedSource} />
              {/each}
              {#if row.length < itemsPerRow}
                {#each { length: itemsPerRow - row.length }}
                  {#if searchState === "loading"}
                    <div
                      class="bg-secondary flex h-95 w-60 animate-pulse items-center justify-center rounded-xl p-0.5"
                      in:fade
                    >
                      <Icon
                        class={cn("size-10 animate-spin")}
                        icon="mingcute:loading-fill"
                      />
                    </div>
                  {:else}
                    <div class="h-95 w-60 p-0.5"></div>
                  {/if}
                {/each}
              {/if}
            </div>
          </div>
          {#if searchState === "loading" && index === rowedMangas.length - 1}
            <div class="mb-0.5 flex w-full justify-center gap-0.5">
              {#each { length: itemsPerRow }, i (i)}
                <div
                  class="bg-secondary flex h-95 w-60 animate-pulse items-center justify-center rounded-xl p-0.5"
                  in:fade
                >
                  <Icon
                    class="size-10 animate-spin"
                    icon="mingcute:loading-fill"
                  />
                </div>
              {/each}
            </div>
          {/if}
          {#if rowedMangas.length < 6 ? index === rowedMangas.length - 1 : index === rowedMangas.length - 5}
            <div bind:this={sentinel} class="h-0 w-full"></div>
          {/if}
          <div
            class={cn(
              "flex justify-center",
              searchState === "idle" &&
                lastPage?.hasNextPage &&
                index === rowedMangas.length - 1
                ? "mt-4 h-fit opacity-100 transition-opacity duration-400"
                : "h-0 opacity-0",
            )}
          >
            <Button onclick={() => search(true)}>
              <Icon icon="lucide:corner-down-right" />
              Load more
            </Button>
          </div>
        {/snippet}
      </VList>
      {#if searchState === "error"}
        <div
          class="flex h-full w-full flex-col items-center justify-center gap-2"
        >
          {let showMore = $state(false)}
          <Label class="text-5xl font-bold">(×﹏×)</Label>
          <Label class="text-xl">Unable to load data</Label>
          <div class="flew-wrap flex items-center justify-center gap-1">
            <Label class="z-2 text-center text-xs text-wrap select-auto">
              {limitStr(lastPage?.message ?? "", 100)}
            </Label>
            {#if (lastPage?.message?.length ?? 0) > 100}
              <Button
                class="h-6 rounded-lg p-2"
                variant="ghost"
                onclick={() => {
                  showMore = !showMore;
                }}
              >
                Show {showMore ? "less" : "more"}
              </Button>
            {/if}
          </div>
          <div
            class="grid transition-[grid-template-rows] duration-300 ease-out"
            style:grid-template-rows={showMore ? "1fr" : "0fr"}
          >
            <Label
              class="text-primary/60 z-2 overflow-hidden px-10 text-center text-xs text-wrap select-auto"
            >
              {lastPage?.message}
            </Label>
          </div>
          <div class="flex justify-center gap-2">
            <Button
              class="w-24"
              variant="secondary"
              onclick={() => {
                writeText(lastPage?.message ?? "");
              }}
            >
              <Icon icon="lucide:copy" />
              Copy
            </Button>
            <Button class="w-24" onclick={() => search(true)}>
              <Icon icon="lucide:rotate-cw" />
              Retry
            </Button>
          </div>
        </div>
      {/if}
      <div
        class={cn(
          "flex justify-center",
          searchState === "idle" &&
            rowedMangas.length === 0 &&
            lastPage?.hasNextPage
            ? "z-2 mt-16 h-fit opacity-100 transition-opacity duration-400"
            : "h-0 opacity-0",
        )}
      >
        <Button onclick={() => search(true)}>
          <Icon icon="lucide:corner-down-right" />
          Load more
        </Button>
      </div>
      <div class="mb-0.5 flex w-full justify-center gap-0.5">
        {#each { length: searchState === "loading" && rowedMangas.length === 0 ? itemsPerRow : 0 }, i (i)}
          <div
            class="bg-secondary mt-14 flex h-95 w-60 animate-pulse items-center justify-center rounded-xl p-0.5"
            in:fade
          >
            <Icon class="size-10 animate-spin" icon="mingcute:loading-fill" />
          </div>
        {/each}
      </div>
      <!-- <div class="h-20 w-20 bg-red-500"></div> -->
    </div>
  </div>
</div>
