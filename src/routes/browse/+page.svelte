<script lang="ts">
  import {
    Image,
    MangaFetchCard,
    SearchFilters,
    SelectSourceOrGroup,
    Tooltip,
  } from "@/components";
  import {
    Badge,
    Button,
    Checkbox,
    Input,
    Label,
    Popover,
  } from "@/lib/components";
  import { suwaManager } from "@/lib/helpers";
  import { cn, getLangName, getLangNative, titleCase } from "@/lib/utils";
  import {
    openExtensions,
    searchInput,
    sourceGroupMode,
    searchType,
    suwayomi,
    selectedSourceId,
    suwayomiUrl,
    selectedGroupSource,
    showExtensionsNSourcesNSFW,
    openedExtension,
    openedSearchFilters,
    hideOnLibrary,
    dbHelper,
  } from "@/states";
  import type {
    FetchSourceMangaResult,
    FilterChange,
    MangaFetch,
    SourceBrowse,
  } from "@/types/server";
  import Icon from "@iconify/svelte";
  import { animate } from "animejs";
  import { onMount } from "svelte";
  import { ScrollingValue } from "svelte-ux";
  import { fade } from "svelte/transition";
  import { VList } from "virtua/svelte";

  let selectedSource = $derived(suwayomi.sourcesById[selectedSourceId.value]);
  let openSearchSettings = $state(false);
  let openSelectSource = $state(false);
  let wasOpenSourceOpen = false;
  let sourceBrowse: SourceBrowse | undefined = $state();

  let debounceTimer: ReturnType<typeof setTimeout>;
  let resultsQuery = $state("");

  let changes: FilterChange[] = $state([]);

  let fetchedMangaData = $state<
    Record<string, Record<number, FetchSourceMangaResult>>
  >({});
  let results = $derived<MangaFetch[]>(
    Object.values(
      fetchedMangaData[
        selectedSourceId.value +
          searchType.value +
          (searchType.value === "SEARCH"
            ? searchInput.value + JSON.stringify(changes)
            : "")
      ] ?? {},
    ).flatMap((fm) => fm.mangas),
  );

  let isSearching = $state(false);
  const search = async (goBeyoundTwo: boolean = false) => {
    if (selectedSourceId.value === undefined) return;
    const key =
      selectedSourceId.value +
      searchType.value +
      (searchType.value === "SEARCH"
        ? searchInput.value + JSON.stringify(changes)
        : "");
    const lastData = Object.values(fetchedMangaData[key] ?? {});
    if (lastData.length > 0 && !lastData.at(-1)?.hasNextPage) return;
    const page = lastData.length + 1;
    if (page === 3 && !goBeyoundTwo) return;
    isSearching = true;
    const data = await suwaManager.fetchSourceManga({
      source: selectedSourceId.value,
      type: searchType.value,
      query: searchInput.value,
      page: page,
      filters: changes,
    });
    if (page > 1) {
      fetchedMangaData[key][page] = data;
    } else {
      fetchedMangaData[key] = {
        [page]: data,
      };
    }
    isSearching = false;
    if (data.hasNextPage && page === 1) {
      search();
    }
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
    ) ?? [],
  );

  let itemsPerRow = $derived(Math.floor(divWidth / 210));

  let rowedMangas: MangaFetch[][] = $derived.by(() => {
    if (!scrollContainer || divWidth < 210) return [filteredManga];
    return filteredManga.reduce((acc: MangaFetch[][], _, i) => {
      if (i % itemsPerRow === 0)
        acc.push(filteredManga.slice(i, i + itemsPerRow));
      return acc;
    }, []);
  });

  selectedSourceId.onchange = (s) => {
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
  };

  searchType.onchange = () => {
    document.getElementById("div-mangas")?.scroll({ top: 0 });
    search();
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
    if (rowedMangas.length < 3 && results.length < 100) {
      search(true);
    }
  });

  $effect(() => {
    if (selectedSource && results.length === 0) {
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
      // change to have distance based on batch
    );
    observerRef.observe(sentinel);
    return () => observerRef?.disconnect();
  });
</script>

<div class="justify-around-stretch flex w-full flex-col">
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
    class="parent flex h-full w-full flex-col items-center overflow-y-scroll scroll-smooth"
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
        <Checkbox class="pointer-events-none" checked={!hideOnLibrary.value} />
        On library
        <!-- {hideOnLibrary.value ? "Show" : "Hide"} -->
      </Button>
    </div>
    <div class="absolute flex w-full justify-end pt-12 pr-8">
      <Button
        class={cn(
          "z-1 h-12 w-13 opacity-100 backdrop-blur-sm transition-opacity duration-500",
          divOffset < 400 && "opacity-0",
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
      class="flex w-full items-center justify-center"
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
                {#if isSearching}
                  <div
                    class="bg-secondary flex h-80 w-50 animate-pulse items-center justify-center rounded-xl p-0.5"
                    in:fade
                  >
                    <Icon
                      class={cn("size-10 animate-spin")}
                      icon="mingcute:loading-fill"
                    />
                  </div>
                {:else}
                  <div class="h-80 w-50 p-0.5"></div>
                {/if}
              {/each}
            {/if}
          </div>
        </div>
        {#if isSearching && index === rowedMangas.length - 1}
          <div class="mb-0.5 flex w-full justify-center gap-0.5">
            {#each { length: itemsPerRow }, i (i)}
              <div
                class="bg-secondary flex h-80 w-50 animate-pulse items-center justify-center rounded-xl p-0.5"
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
      {/snippet}
    </VList>
    <!-- <div class="h-20 w-20 bg-red-500"></div> -->
  </div>
</div>
