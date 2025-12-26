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
  import { delay } from "@/utils";
  import { SsgoiTransition } from "@ssgoi/svelte";
  import { ScrollingValue } from "svelte-ux";

  let libraryDiv: HTMLDivElement = $state(null!);
  let libdivWidth: number = $state(0);
  let showedFilter = $state(0);
  let page = $state(1);
  let perPage = $derived(Math.floor(libdivWidth / 168) * 3);
  const count = $derived($libraryFavorites.length);
  let displayedLibrary: Favorite[] = $derived(
    $isAscending
      ? $libraryFavorites.slice((page - 1) * perPage, page * perPage)
      : $libraryFavorites
          .toReversed()
          .slice((page - 1) * perPage, page * perPage),
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
      $libraryFavorites.map((fv) => loadImage(fv.cover, fv.link)),
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

<SsgoiTransition id="/library">
  <div class="mr-4 flex h-full flex-col items-center overflow-hidden">
    <div
      bind:this={libraryDiv}
      bind:clientWidth={libdivWidth}
      class="scrollbar flex h-full w-full flex-wrap content-start justify-center gap-3 overflow-x-hidden overflow-y-scroll! scroll-smooth pb-5"
    >
      <div
        class={cn(
          "smh:absolute z-20 mt-1 -mb-[15px] flex max-w-[80svw]! items-center justify-center gap-1 rounded-3xl p-2 backdrop-blur-md md:gap-2",
          IS_MOBILE ? "h-28 flex-wrap" : "h-14",
        )}
      >
        <Badge
          class="flex h-10 w-12 items-center justify-center"
          variant="outline"
        >
          <ScrollingValue axis="y" value={count} />
        </Badge>
        <LibrarySearch bind:page bind:favdiv={libraryDiv} />
        <LibraryOrder />
        <LibraryTag
          class={showedFilter === 0 ? "inline-flex!" : "hidden md:inline-flex"}
        />
        <LibrarySource
          class={showedFilter === 1 ? "inline-flex!" : "hidden md:inline-flex"}
        />
        <Button
          class="flex w-9! items-start md:hidden"
          variant="secondary"
          onclick={() => {
            if (showedFilter === 1) showedFilter = 0;
            else showedFilter++;
          }}
          >...
        </Button>
      </div>
      <div class="smh:h-14 h-0 w-full"></div>
      <!-- {#key displayedLibrary} -->
      {#if displayedLibrary.length === 0}
        <div class="mt-4 flex w-full justify-center">
          <Badge
            class="h-20 text-sm transition-colors duration-300"
            variant="info"
            onclick={() => {
              searchTerm.set($libraryQuery);
              openSearch.set(true);
            }}
            >{#if $libraryQuery.length > 0}
              Nothing was found. You can try finding "<span
                class="text-gray-200"
              >
                {$libraryQuery}
              </span>" in
            {:else}
              Nothing saved, try searching something at
            {/if}
            <span class="ml-1 text-gray-200 underline">Search</span>
          </Badge>
        </div>
      {/if}
      {#each displayedLibrary as favorite, i (i)}
        <LibraryCard {favorite} />
      {/each}
      <!-- {/key} -->
      {#each Array.from({ length: extraSpaceCards() }, (_, i) => i)}
        <div class="h-[271px] w-[158px] p-1"></div>
      {/each}
      {#if $libraryFavorites.length > perPage}
        <div class="h-10 w-full"></div>
        <div
          class="bg-secondary/30 group-data-[retro=active]/theme:bg-secondary/95 smh:mt-3 absolute bottom-6 -mt-[15px] flex rounded-3xl p-2 backdrop-blur-md transition-all"
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
                  <Pagination.PrevButton
                    class="dark:text-white"
                    tabindex={-1}
                  />
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
                        variant={currentPage === page.value
                          ? "secondary"
                          : "ghost"}
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
                  <Pagination.NextButton
                    class="dark:text-white"
                    tabindex={-1}
                  />
                </Pagination.Item>
              </Pagination.Content>
            {/snippet}
          </Pagination.Root>
        </div>
      {/if}
    </div>
  </div>
</SsgoiTransition>

{#each $libraryFavorites.map((_) => _.cover) as image}
  <img class="hidden" src={image} alt="Prefetched" data-sveltekit-prefetch />
{/each}
