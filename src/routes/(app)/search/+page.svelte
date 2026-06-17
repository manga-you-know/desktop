<script lang="ts">
  import { Image, SearchFilters, Tooltip } from "@/components";
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
    selectedSource,
    suwayomiUrl,
    selectedGroupSource,
    showExtensionsNSourcesNSFW,
    openedExtension,
    openedSearchFilters,
  } from "@/states";
  import type { FilterChange, Manga, SourceBrowse } from "@/types/server";
  import Icon from "@iconify/svelte";
  import { animate } from "animejs";
  import { onMount } from "svelte";
  import { ScrollingValue } from "svelte-ux";
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
        (selectedSource.value?.id === s.id ? true : !disabledLangs[s.lang]) &&
        (showExtensionsNSourcesNSFW.value ? true : !s.isNsfw),
    ),
  );

  let openSearchSettings = $state(false);
  let openSelectSource = $state(false);
  let sourceBrowse: SourceBrowse | undefined = $state();

  onMount(() => {
    if (
      suwayomi.enabledSources.length > 0 &&
      selectedSource.value === undefined
    ) {
      selectedSource.value = suwayomi.enabledSources[0];
    }
    if (selectedSource.value) {
      suwaManager.getSourceBrowse(selectedSource.value.id).then((sb) => {
        sourceBrowse = sb;
      });
      if (
        !selectedSource.value.supportsLatest &&
        searchType.value === "LATEST"
      ) {
        searchType.value = "POPULAR";
      }
      search();
    } else {
      sourceBrowse = undefined;
    }
  });

  let debounceTimer: ReturnType<typeof setTimeout>;
  let resultFilter = $state("");

  let changes: FilterChange[] = $state([]);

  let fetchedManga: Manga[] = $state([]);

  const search = () => {
    if (selectedSource.value === undefined) return;
    suwaManager
      .fetchSourceManga({
        source: selectedSource.value.id,
        type: searchType.value,
        query: searchInput.value,
        page: 1,
        filters: changes,
      })
      .then((r) => {
        console.log(r);
        fetchedManga = r.mangas;
      });
  };

  const handleInput = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      search();
      console.log("fire", searchInput.value);
      resultFilter = "";
    }, 600);
  };

  let filteredManga = $derived(
    fetchedManga.filter((m) =>
      m.title.toLowerCase().includes(resultFilter.toLowerCase()),
    ),
  );

  selectedSource.onchange = (s) => {
    if (s) {
      if (!s.supportsLatest && searchType.value === "LATEST") {
        searchType.value = "POPULAR";
      }
      suwaManager.getSourceBrowse(s.id).then((sb) => {
        sourceBrowse = sb;
      });
      search();
    } else {
      sourceBrowse = undefined;
    }
  };

  searchType.onchange = search;
</script>

<div class="justify-around-stretch flex w-full flex-col gap-3">
  <div class="flex items-center justify-center gap-2">
    <Badge class="h-10 w-13" variant="outline">
      <ScrollingValue value={fetchedManga.length} />
    </Badge>
    <Input
      class="hover:bg-secondary/20 w-70 transition-all"
      divClass="w-70 transition-all"
      variant="outline"
      placeholder="Query in source{sourceGroupMode.value !== 'single'
        ? 's'
        : ''}..."
      disabled={searchType.value !== "SEARCH"}
      oninput={handleInput}
      bind:value={searchInput.value}
    />
    <Button variant="outline">
      <Icon icon="lucide:sliders-horizontal" />
    </Button>
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
      <Button variant="outline" onclick={openExtensions.open}>
        <Icon icon="lucide:puzzle" />
      </Button>
    </Tooltip>
  </div>
  <div class="flex items-center justify-center gap-2">
    <div
      class="border-secondary bg-background/30 parent flex justify-start gap-1 rounded-xl border p-1"
    >
      <Button
        class={cn(
          "pointer-events-none absolute w-30 rounded-lg transition-all duration-200",
          searchType.value === "SEARCH" && "translate-x-0",
          searchType.value === "POPULAR" && "translate-x-31",
          searchType.value === "LATEST" && "translate-x-62",
        )}
        variant="secondary"
      ></Button>
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
        <Icon icon="lucide:text-search" />Search
      </Button>
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
        disabled={!selectedSource.value?.supportsLatest &&
          sourceGroupMode.value === "single"}
        onclick={() => {
          searchType.value = "LATEST";
        }}
      >
        <Icon icon="lucide:badge-info" />Latest
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
            ? (selectedSource.value?.displayName ?? "None.")
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
              {#if selectedSource.value}
                <Image
                  class="size-10"
                  src={suwayomiUrl.value + selectedSource.value.iconUrl}
                />
                <span class="truncate font-bold">
                  {selectedSource.value.displayName}
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
                  selectedSource.value?.id === source.id &&
                    "bg-secondary pointer-events-none",
                )}
                onclick={() => {
                  selectedSource.value = source;
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
    <Tooltip text="Source filters">
      <Button
        class="h-12.5 w-14"
        variant="outline"
        disabled={searchType.value !== "SEARCH" ||
          sourceGroupMode.value !== "single" ||
          sourceBrowse?.filters.length === 0}
        onclick={() => {
          openedSearchFilters.open({ sourceBrowse });
        }}
      >
        <Icon icon="lucide:list-filter" />
      </Button>
    </Tooltip>
  </div>
  <div class="bg-secondary/40 h-1 w-full rounded-2xl"></div>
  <div class="flex items-center justify-center gap-2">
    <Badge class="h-10 w-20 text-sm font-bold" variant="outline">
      <ScrollingValue value={filteredManga.length} />
      /
      <ScrollingValue value={fetchedManga.length} />
    </Badge>
    <Input
      class="hover:bg-secondary/20 w-70"
      divClass="w-70"
      variant="outline"
      placeholder="Filter results..."
      bind:value={resultFilter}
    />
    <Button></Button>
  </div>
  <div class="flex flex-wrap">
    {#each filteredManga as manga (manga.id)}
      <div class="flex h-90 w-40 flex-col gap-2">
        <Label>{manga.title}</Label>
        <Image src={suwayomiUrl.value + manga.thumbnailUrl} />
      </div>
    {/each}
  </div>
</div>
