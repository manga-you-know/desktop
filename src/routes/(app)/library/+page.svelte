<script lang="ts">
  import { onMount } from "svelte";
  import { Pagination, Button, Badge, Input } from "@/lib/components";
  import {
    LibraryCard,
    LibraryOrder,
    LibrarySearch,
    LibrarySource,
    LibraryTag,
  } from "@/components";
  import { FavoriteDB } from "@/repositories";
  import {
    coversLoaded,
    downloadManager,
    favoritesLoaded,
    isAscending,
    libraryFavorites,
    libraryQuery,
    openSearch,
    searchTerm,
  } from "@/store";
  import type { Favorite } from "@/types";
  import { cn } from "@/lib/utils";
  import { IS_MOBILE } from "@/constants";
  import { get, has, set } from "tauri-plugin-cache-api";

  let libraryDiv: HTMLDivElement = $state(null!);
  let libdivWidth: number = $state(0);
  let showedFilter = $state(0);
  let page = $state(1);
  let perPage = $derived(Math.floor(libdivWidth / 169) * 3);
  const count = $derived($libraryFavorites.length);
  let displayedLibrary: Favorite[] = $derived(
    $isAscending
      ? $libraryFavorites.slice((page - 1) * perPage, page * perPage)
      : $libraryFavorites
          .toReversed()
          .slice((page - 1) * perPage, page * perPage)
  );
  const siblingCount = 1;

  async function loadImage(cover: string, url: string) {
    $coversLoaded[cover] = cover;
    // if (cover.includes("asset.localhost")) return;
    // if (await has(cover)) {
    //   $coversLoaded[cover] = (await get<string>(cover)) ?? cover;
    // } else {
    //   const imageB64 = await $downloadManager.getBase64Image(
    //     cover,
    //     `https://${url.split("/")[2]}/`
    //   );
    //   $coversLoaded[cover] = imageB64;
    //   await set(cover, imageB64);
    // }
  }

  async function loadAllImages() {
    await Promise.all(
      $libraryFavorites.map((fv) => loadImage(fv.cover, fv.link))
    );
  }

  function extraSpaceCards(): number {
    const x = perPage / 3;
    const n = displayedLibrary.length;
    if (n <= x) return x - n;
    if (n <= 2 * x) return 2 * x - n;
    if (n <= 3 * x) return 3 * x - n;
    return 0;
  }

  onMount(async () => {
    const newFavorites = await FavoriteDB.getLibraryFavorites();
    libraryFavorites.set(newFavorites);
    loadAllImages();
  });

  $effect(() => {
    if (displayedLibrary.length === 0 && page > 1) {
      page = Math.ceil($libraryFavorites.length / perPage);
    }
  });
</script>

<div class="h-full overflow-hidden flex flex-col items-center">
  <div
    bind:this={libraryDiv}
    bind:clientWidth={libdivWidth}
    class="scrollbar w-[99.2%] h-full flex flex-wrap content-start justify-center gap-3 scroll-smooth overflow-x-hidden overflow-y-scroll pb-5"
  >
    <div
      class={cn(
        "bg-secondary/60 backdrop-blur-sm flex !max-w-[80svw] -mb-[15px] rounded-3xl mt-1 p-2 gap-1 md:gap-2 justify-center items-center smh:absolute z-20",
        IS_MOBILE ? "h-28 flex-wrap" : "h-14"
      )}
    >
      <Badge
        class="h-10 w-12 flex justify-center items-center bg-secondary/70 hover:bg-secondary/50"
        variant="secondary"
      >
        {count}
      </Badge>
      <LibrarySearch bind:page bind:favdiv={libraryDiv} />
      <LibraryOrder />
      <LibraryTag
        class={showedFilter === 0 ? "!inline-flex" : "hidden md:inline-flex"}
      />
      <LibrarySource
        class={showedFilter === 1 ? "!inline-flex" : "hidden md:inline-flex"}
      />
      <Button
        class="md:hidden flex items-start !w-9"
        variant="secondary"
        onclick={() => {
          if (showedFilter === 1) showedFilter = 0;
          else showedFilter++;
        }}
        >...
      </Button>
    </div>
    <div class="w-full h-0 smh:h-14"></div>
    <!-- {#key displayedLibrary} -->
    {#if displayedLibrary.length === 0}
      <div class="w-full flex justify-center mt-4">
        <Badge
          class="text-sm h-20 bg-blue-400 hover:bg-blue-300/40 transition-colors duration-300"
          onclick={() => {
            searchTerm.set($libraryQuery);
            openSearch.set(true);
          }}
          >Nothing was found. You can try finding "<span class="text-gray-200">
            {$libraryQuery}
          </span>" in
          <span class="ml-1 text-gray-200 underline">Search</span>
        </Badge>
      </div>
    {/if}
    {#each displayedLibrary as favorite, i (i)}
      <LibraryCard {favorite} />
    {/each}
    <!-- {/key} -->
    {#each Array.from({ length: extraSpaceCards() }, (_, i) => i) as n}
      <div class="w-[158px] h-[271px] p-1"></div>
    {/each}
    {#if $libraryFavorites.length > perPage}
      <div class="w-full h-10"></div>
      <div
        class="bg-secondary/60 backdrop-blur-sm flex rounded-3xl -mt-[15px] absolute bottom-6 smh:mt-3 p-2 transition-all"
      >
        <Pagination.Root
          {count}
          {perPage}
          {siblingCount}
          bind:page
          onPageChange={() => libraryDiv.scrollTo({ top: 0 })}
        >
          {#snippet children({ pages, currentPage })}
            <Pagination.Content tabindex={-1}>
              <Pagination.Item>
                <Pagination.PrevButton class="dark:text-white" tabindex={-1} />
              </Pagination.Item>
              {#each pages as page (page.key)}
                {#if page.type === "ellipsis"}
                  <Pagination.Item tabindex={-1}>
                    <Pagination.Ellipsis class="dark:text-white" />
                  </Pagination.Item>
                {:else}
                  <Pagination.Item>
                    <Pagination.Link
                      {page}
                      variant={currentPage === page.value ? "default" : "ghost"}
                      effect={currentPage === page.value ? "ringHover" : null}
                      isActive={currentPage === page.value}
                      tabindex={-1}
                    >
                      {page.value}
                    </Pagination.Link>
                  </Pagination.Item>
                {/if}
              {/each}
              <Pagination.Item>
                <Pagination.NextButton class="dark:text-white" tabindex={-1} />
              </Pagination.Item>
            </Pagination.Content>
          {/snippet}
        </Pagination.Root>
      </div>
    {/if}
  </div>
</div>
{#each $libraryFavorites.map((_) => _.cover) as image}
  <img class="hidden" src={image} alt="Prefetched" data-sveltekit-prefetch />
{/each}
