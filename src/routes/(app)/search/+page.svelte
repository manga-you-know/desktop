<script lang="ts">
  import { Image, MangaFetchCard, SearchFilters, Tooltip } from "@/components";
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

  let selectSourceFilter = $state("");
  let disabledLangs: Record<string, boolean> = $state({});
  let groupByLangSources = $derived(
    Object.entries(Object.groupBy(suwayomi.enabledSources, (s) => s.lang))
      .map(([lang, sources]) => {
        return {
          lang: lang,
          count: sources?.length ?? 0,
        };
      })
      .sort((a, b) => {
        if (a.lang === "all") return -1;
        if (b.lang === "all") return 1;
        const aName = getLangNative(a.lang);
        const bName = getLangNative(b.lang);
        return aName.localeCompare(bName, "en", { sensitivity: "base" });
      }),
  );
  let filteredSources = $derived(
    suwayomi.enabledSources.filter(
      (s) =>
        (s.displayName
          .toLowerCase()
          .includes(selectSourceFilter.toLowerCase()) ||
          s.name.toLowerCase().includes(selectSourceFilter.toLowerCase()) ||
          s.lang.toLowerCase().includes(selectSourceFilter.toLowerCase()) ||
          getLangNative(s.lang)
            .toLowerCase()
            .includes(selectSourceFilter.toLowerCase()) ||
          getLangName(s.lang)
            .toLowerCase()
            .includes(selectSourceFilter.toLowerCase())) &&
        (selectedSourceId.value === s.id ? true : !disabledLangs[s.lang]) &&
        (showExtensionsNSourcesNSFW.value ? true : !s.isNsfw),
    ),
  );

  let selectedSource = $derived(suwayomi.sourcesById[selectedSourceId.value]);
  let openSearchSettings = $state(false);
  let openSelectSource = $state(false);
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
      { root: scrollContainer, rootMargin: "600px 0px" },
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
          openedSearchFilters.open({ sourceBrowse });
        }}
      >
        <Icon icon="lucide:list-filter" />
      </Button>
    </Tooltip>
    <Tooltip
      text="Source mode"
      subtext={sourceGroupMode.value === "single"
        ? "Single uses one source to fetch"
        : sourceGroupMode.value === "group"
          ? "Group uses multiple sources to fetch"
          : "Global uses all enabled sources to fetch"}
    >
      <Button
        class="w-27 justify-start font-bold"
        onclick={(e) => {
          if (sourceGroupMode.value === "single") {
            sourceGroupMode.value = "group";
          } else if (sourceGroupMode.value === "group") {
            sourceGroupMode.value = "global";
          } else {
            sourceGroupMode.value = "single";
          }
          animate(e.currentTarget, {
            filter: ["blur(1px)", "blur(2px)", "blur(0px)"],
            duration: 500,
            easing: "easeOutQuad",
          });
          if (sourceGroupMode.value !== "global") {
            animate("#source-select", {
              filter: ["blur(3px)", "blur(0px)"],
              duration: 700,
              easing: "easeOutQuad",
            });
          }
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
    <Popover.Root bind:open={openSelectSource}>
      <Popover.Trigger
        class="flex items-center"
        disabled={sourceGroupMode.value === "global"}
      >
        <Tooltip
          text="Select source {sourceGroupMode.value !== 'single'
            ? 'group'
            : ''}"
          subtext={sourceGroupMode.value === "single"
            ? (selectedSource.displayName ?? "None.")
            : selectedGroupSource.value}
        >
          <Button
            class={cn(
              "h-12.5 w-55 justify-start overflow-hidden",
              sourceGroupMode.value === "single" && "px-2",
            )}
            variant="outline"
            disabled={sourceGroupMode.value === "global"}
            id="source-select"
          >
            {#if sourceGroupMode.value === "single"}
              {#if selectedSource}
                <Image
                  class="size-10"
                  src={suwayomiUrl.value + selectedSource.iconUrl}
                />
                <span class="truncate font-bold">
                  {selectedSource.displayName}
                </span>
              {:else}
                No sources...
              {/if}
            {:else}
              <div
                class="flex w-full items-center justify-center gap-2 font-bold"
              >
                {#if selectedGroupSource.value === "Favorites"}
                  <Icon icon="lucide:star" />
                  <Label class="cursor-pointer font-bold">Favorites</Label>
                {:else}
                  <Label class="cursor-pointer truncate text-ellipsis">
                    {selectedGroupSource.value}
                  </Label>
                {/if}
              </div>
            {/if}
          </Button>
        </Tooltip>
      </Popover.Trigger>
      <Popover.Content class="w-80">
        <div class="flex w-full flex-col gap-2">
          <div class="flex items-center gap-1">
            <Badge class="h-9 w-12" variant="outline">
              <ScrollingValue value={filteredSources.length} />
            </Badge>
            <Input
              class="h-9 w-full"
              divClass="w-full"
              variant="outline"
              placeholder="Sources..."
              bind:value={selectSourceFilter}
            />
            <Tooltip
              text="{showExtensionsNSourcesNSFW.value
                ? 'Disable'
                : 'Enable'} NSFW"
            >
              <Button
                class="flex h-9 justify-between rounded-xl font-bold duration-500"
                variant={showExtensionsNSourcesNSFW.value
                  ? "destructive"
                  : "info"}
                onclick={(e) => {
                  showExtensionsNSourcesNSFW.toggle();
                  animate(e.currentTarget, {
                    filter: ["blur(0px)", "blur(3px)", "blur(0px)"],
                    duration: 500,
                    easing: "easeOutQuad",
                  });
                }}
              >
                <Icon
                  icon={showExtensionsNSourcesNSFW.value
                    ? "lucide:triangle-alert"
                    : "lucide:heart"}
                />
                <!-- {showExtensionsNSourcesNSFW.value ? "N" : ""}SFW -->
              </Button>
            </Tooltip>
            <Popover.Root>
              <Popover.Trigger>
                <Tooltip
                  text="Enabled langs: {groupByLangSources.length -
                    Object.values(disabledLangs).filter((v) => v).length}"
                >
                  <Button class="h-9 font-bold">
                    <Icon icon="lucide:languages" />
                    <!-- Languages -->
                  </Button>
                </Tooltip>
              </Popover.Trigger>
              <Popover.Content>
                <div
                  class="scrollbar flex max-h-50 flex-col gap-1 overflow-y-scroll"
                >
                  {#each groupByLangSources as l}
                    <Button
                      class="hover:bg-secondary/50 w-full justify-between px-3"
                      variant="outline"
                      onclick={() => {
                        if (l.lang in disabledLangs) {
                          disabledLangs[l.lang] = !disabledLangs[l.lang];
                        } else {
                          disabledLangs[l.lang] = true;
                        }
                      }}
                    >
                      <div class="flex items-center gap-2">
                        <Checkbox
                          class="pointer-events-none"
                          checked={!disabledLangs[l.lang]}
                        />
                        <Label class="cursor-pointer">
                          {getLangNative(l.lang)}
                        </Label>
                      </div>
                      <Badge class="w-10" variant="secondary">
                        <ScrollingValue value={l.count} />
                      </Badge>
                    </Button>
                  {/each}
                </div>
              </Popover.Content>
            </Popover.Root>
          </div>
          <!-- <div class="flex justify-between gap-2"></div> -->
          <VList
            class={cn(
              "scrollbar w-full",
              filteredSources.length > 0 ? "h-60!" : "h-0",
            )}
            data={filteredSources}
            getKey={(d, _) => d.id}
          >
            {#snippet children(source, _)}
              <Button
                class={cn(
                  "bg-background group/extension hover:bg-secondary/40 text-primary m-0.5 flex h-12 w-70 items-center justify-between gap-2 rounded-xl p-2 hover:no-underline!",
                  selectedSourceId.value === source.id &&
                    "bg-secondary pointer-events-none",
                )}
                onclick={() => {
                  selectedSourceId.value = source.id;
                  animate("#source-select", {
                    filter: ["blur(4px)", "blur(0px)"],
                    duration: 700,
                    easing: "easeOutQuad",
                  });
                  openSelectSource = false;
                  selectSourceFilter = "";
                }}
              >
                <div class="pointer-events-none flex items-center gap-2">
                  <Image
                    class="size-10"
                    src={suwayomiUrl.value + source.iconUrl}
                  />
                  <div class="gap-0.1 flex flex-col items-start justify-center">
                    <Label
                      class={cn(
                        "max-w-40 cursor-pointer truncate text-lg group-hover/extension:underline!",
                        source.isConfigurable && "max-w-36",
                      )}
                    >
                      {source.displayName}
                    </Label>
                    <div class="flex w-18 justify-between">
                      <span class="text-red-500">
                        {source.isNsfw ? "+18" : ""}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center">
                  {#if source.isConfigurable}
                    <Button
                      class="pointer-events-auto h-8 w-9 rounded-lg"
                      variant="ghost"
                      onclick={(e) => {
                        e.stopPropagation();
                        openSelectSource = false;
                        openedExtension.open({
                          source: source,
                          extension:
                            suwayomi.extensionsByPkgName[
                              source.extension.pkgName
                            ],
                        });
                      }}
                    >
                      <Icon icon="lucide:settings" />
                    </Button>
                  {/if}
                </div>
              </Button>
            {/snippet}
          </VList>
          {#if filteredSources.length === 0}
            <div class="flex h-60 flex-col items-center p-4">
              <Badge class="flex flex-col gap-1 text-base">
                No source found lil bro.
                {#if suwayomi.enabledSources.length === 0}
                  <span>You could try enabling one...</span>
                {/if}
                <span class="text-xl">╮( ˘ ､ ˘ )╭</span>
              </Badge>
            </div>
          {/if}
        </div>
      </Popover.Content>
    </Popover.Root>
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
              translateY: -120,
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
        <div class="mb-0.5 flex w-full justify-center gap-0.5">
          {#each row as manga (manga.id)}
            <MangaFetchCard {manga} suwaSource={selectedSource} />
          {/each}
          {#if row.length < itemsPerRow}
            {#each { length: itemsPerRow - row.length }}
              <div
                class={cn(
                  "flex h-80 w-50 items-center justify-center rounded-xl p-0.5 opacity-0 transition-opacity duration-500",
                  isSearching && "bg-secondary animate-pulse opacity-100",
                )}
              >
                <Icon
                  class={cn(
                    "size-10 animate-spin transition-all duration-500",
                    !isSearching && "hidden",
                  )}
                  icon="mingcute:loading-fill"
                />
              </div>
            {/each}
          {/if}
        </div>
        {#if isSearching && index === rowedMangas.length - 1}
          <div class="mb-0.5 flex w-full justify-center gap-0.5">
            {#each { length: itemsPerRow }, i (i)}
              <div
                class="bg-secondary flex h-80 w-50 animate-pulse items-center justify-center rounded-xl p-0.5"
                in:fade
              >
                <Icon
                  class="size-10 animate-spin transition-all duration-500"
                  icon="mingcute:loading-fill"
                />
              </div>
            {/each}
          </div>
        {/if}
        {#if index === rowedMangas.length - 1}
          <div bind:this={sentinel} class="h-4 w-full"></div>
        {/if}
      {/snippet}
    </VList>
    <!-- <div class="h-20 w-20 bg-red-500"></div> -->
  </div>
</div>
