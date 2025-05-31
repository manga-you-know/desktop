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
  import { libraryFavorites } from "@/store";
  import type { Favorite } from "@/types";
  import { cn } from "@/lib/utils";
  import { IS_MOBILE } from "@/constants";
  let libraryDiv: HTMLDivElement = $state(null!);
  let libdivWidth: number = $state(0);
  let page = $state(1);
  let perPage = $derived(Math.floor(libdivWidth / 168) * 3);
  const count = $derived($libraryFavorites.length);
  let displayedLibrary: Favorite[] = $derived(
    $libraryFavorites.slice((page - 1) * perPage, page * perPage)
  );
  $effect(() => {
    if (displayedLibrary.length === 0 && page > 1) {
      page = Math.ceil($libraryFavorites.length / perPage);
    }
  });
  const siblingCount = 1;
  onMount(async () => {
    const newFavorites = await FavoriteDB.getLibraryFavorites();
    libraryFavorites.set(newFavorites);
  });
  function extraSpaceCards(): number {
    const x = perPage / 3;
    const n = displayedLibrary.length;
    if (n <= x) return x - n;
    if (n <= 2 * x) return 2 * x - n;
    if (n <= 3 * x) return 3 * x - n;
    return 0;
  }
</script>

<div class="h-full overflow-hidden flex flex-col">
  <div
    class={cn(
      "flex flex-wrap w-full p-2 gap-2 justify-center items-center relative top-0",
      IS_MOBILE ? "h-28" : "h-14"
    )}
  >
    <Badge class="h-10 w-12 flex justify-center" variant="secondary">
      {count}
    </Badge>
    <LibrarySearch bind:page bind:favdiv={libraryDiv} />
    <LibraryOrder />
    <LibraryTag />
    <LibrarySource />
  </div>
  <div
    bind:this={libraryDiv}
    bind:clientWidth={libdivWidth}
    class="h-full flex flex-wrap content-start justify-center gap-3 scroll-smooth overflow-x-hidden overflow-y-auto pb-5"
  >
    {#each displayedLibrary as favorite, i (i)}
      <LibraryCard {favorite} />
    {/each}
    {#each Array.from({ length: extraSpaceCards() }, (_, i) => i) as n}
      <div class="w-[158px] h-[271px] p-1"></div>
    {/each}
  </div>

  {#if $libraryFavorites.length > perPage}
    <Pagination.Root
      class="mt-2"
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
                  class={currentPage === page.value
                    ? "!bg-white !text-black"
                    : "dark:text-white"}
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
  {/if}
</div>
{#each $libraryFavorites.map((_) => _.cover) as image}
  <img class="hidden" src={image} alt="Prefetched" data-sveltekit-prefetch />
{/each}
