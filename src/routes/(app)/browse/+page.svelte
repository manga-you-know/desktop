<script lang="ts">
  import { SearchCard, SelectSource } from "@/components";
  import { Badge, Button, Input } from "@/lib/components";
  import { cn } from "@/lib/utils";
  import { downloadManager, openSearch, selectedSource } from "@/store";
  import Icon from "@iconify/svelte";
  import { ScrollingValue } from "svelte-ux";
  import type { Favorite } from "@/types";
  import { VList } from "virtua/svelte";
  import { fade } from "svelte/transition";
  import { onMount } from "svelte";

  type Result = {
    mangas: Favorite[];
    loading?: boolean;
    hasNextPage?: boolean;
    error?: boolean;
    message?: string;
  };

  let searchQuery = $state("");
  let resultsQuery = $state("");
  let hideOnLibrary = $state(false);
  let fetchedMangaData = $state<Record<string, Record<number, Result>>>({});

  let currentKey = $derived(`${searchQuery}::${$selectedSource}`);
  let pages = $derived(Object.values(fetchedMangaData[currentKey] ?? {}));
  let lastPage = $derived(pages.at(-1));
  let searchState = $derived<"idle" | "loading" | "error">(
    lastPage?.error ? "error" : lastPage?.loading ? "loading" : "idle",
  );
  let results = $derived<Favorite[]>(pages.flatMap((p) => p.mangas) ?? []);

  // $inspect(searchState);

  let scrollContainer: HTMLDivElement = $state(null!);
  let sentinel: HTMLDivElement = $state(null!);
  let observerRef: IntersectionObserver | null = null;
  let divWidth = $state(0);
  let divOffset = $state(0);

  let filteredManga: Favorite[] = $derived(
    results.filter(
      (m) =>
        m.name.toLowerCase().includes(resultsQuery.toLowerCase()) &&
        (hideOnLibrary ? true : true),
    ),
  );

  const CARD_WIDTH = 266;

  let itemsPerRow = $derived(Math.floor(divWidth / CARD_WIDTH));

  let rowedMangas: Favorite[][] = $derived.by(() => {
    if (!scrollContainer || divWidth < CARD_WIDTH) return [filteredManga];
    return filteredManga.reduce((acc: Favorite[][], _, i) => {
      if (i % itemsPerRow === 0)
        acc.push(filteredManga.slice(i, i + itemsPerRow));
      return acc;
    }, []);
  });

  // $inspect(rowedMangas);

  const search = async (goBeyoundTwo: boolean = false) => {
    if ($selectedSource === undefined || !$selectedSource) return;
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
    await $downloadManager
      .search(searchQuery, $selectedSource, page)
      .then((data) => {
        fetchedMangaData[key][page] = data;
      });
    /* await suwaManager
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
      }); */
  };

  let debounceTimer: ReturnType<typeof setTimeout>;

  const handleInput = () => {
    /* if (searchType.value !== "SEARCH") {
      searchType.value = "SEARCH";
    } */
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      resultsQuery = "";
      search();
    }, 400);
  };

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

  /* selectedSource.subscribe(() => {
    search();
  }); */

  onMount(() => {
    search();
  });
</script>

<div class="flex h-full flex-col overflow-hidden mr-4">
  <div class="flex gap-2 justify-center p-2">
    <Badge class="min-w-12 justify-center" variant="outline">
      <ScrollingValue value={filteredManga.length} />
    </Badge>
    <div
      class="rounded-xl flex items-center pl-3 pr-0.5 border border-secondary bg-background/30 hover:bg-secondary/50 dark:text-slate-200 transition-all duration-300"
    >
      <Icon
        class={cn(
          "transition-all",
          searchState === "loading" && "animate-spin",
        )}
        icon={searchState === "loading"
          ? "mingcute:loading-fill"
          : "lucide:search"}
      />
      <Input
        class="w-[17rem]"
        variant="link"
        placeholder="Search..."
        deleteButton
        oninput={handleInput}
        ondelete={() => {
          search();
        }}
        bind:value={searchQuery}
      />
    </div>

    <SelectSource onChange={() => search()} />
  </div>

  <div
    class="flex h-full w-full items-start justify-center gap-5 scroll-smooth p-1"
    bind:this={scrollContainer}
    bind:clientWidth={divWidth}
  >
    <VList
      class={cn(
        "scrollbar flex w-full scrollbar-thin items-center justify-center scroll-smooth",
        rowedMangas.length === 0 && "!h-0",
      )}
      id="div-mangas"
      data={rowedMangas}
      getKey={(_, i) => i}
      onscroll={(off) => {
        divOffset = off;
      }}
    >
      {#snippet children(row, index)}
        <div class="flex w-full justify-center">
          <div class="mb-0.5 inline-flex gap-0.5">
            {#each row as manga, i (i)}
              <SearchCard {manga} />
            {/each}
            {#if row?.length < itemsPerRow}
              {#each { length: itemsPerRow - row.length }}
                {#if searchState === "loading"}
                  <div
                    class="bg-secondary flex h-[23.75rem] w-64 animate-pulse items-center justify-center rounded-xl p-0.5"
                    in:fade
                  >
                    <Icon
                      class={cn("size-10 animate-spin")}
                      icon="mingcute:loading-fill"
                    />
                  </div>
                {:else}
                  <div class="h-[23.75rem] w-64 p-0.5"></div>
                {/if}
              {/each}
            {/if}
          </div>
        </div>
        {#if searchState === "loading" && index === rowedMangas.length - 1}
          <div class="mb-0.5 flex w-full justify-center gap-0.5">
            {#each { length: itemsPerRow }, i (i)}
              <div
                class="bg-secondary flex h-[23.75rem] w-64 animate-pulse items-center justify-center rounded-xl p-0.5"
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
              : "h-0 opacity-0 pointer-events-none",
          )}
        >
          <Button onclick={() => search(true)}>
            <Icon icon="lucide:corner-down-right" />
            Load more
          </Button>
        </div>
      {/snippet}
    </VList>
  </div>
</div>
