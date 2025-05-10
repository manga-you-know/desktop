<script lang="ts">
  import { onMount } from "svelte";
  import { Pagination, Button, Badge, Input } from "@/lib/components";
  import {
    LibraryCard,
    LibraryOrder,
    LibrarySearch,
    LibrarySource,
    LibraryCollection,
  } from "@/components";
  import { FavoriteDB } from "@/repositories";
  import { libraryFavorites } from "@/store";
  import type { Favorite } from "@/interfaces";
  import Icon from "@iconify/svelte";
  let favoriteDiv: HTMLDivElement;
  let page = $state(1);
  let perPage = 16;
  const count = $derived($libraryFavorites.length);
  let displayedFavorites: Favorite[] = $derived(
    $libraryFavorites.slice((page - 1) * perPage, page * perPage)
  );
  libraryFavorites.subscribe(async (_) => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    console.log(page, displayedFavorites.length);
    if (displayedFavorites.length === 0 && page > 1) {
      page = page - 1;
      console.log("FUCKING");
    }
    console.log(page);
  });
  const siblingCount = 1;
  onMount(async () => {
    const newFavorites = await FavoriteDB.getLibraryFavorites();
    libraryFavorites.set(newFavorites);
  });
</script>

<div class="h-full overflow-hidden flex flex-col">
  <div class="w-full h-14 p-2 gap-2 flex items-center relative top-0">
    <Badge class="h-10 w-12 flex justify-center rounded-xl" variant="secondary">
      {count}
    </Badge>
    <LibrarySearch />
    <LibraryOrder />
    <LibraryCollection />
    <LibrarySource />
  </div>
  <div
    bind:this={favoriteDiv}
    class="h-full flex flex-wrap content-start gap-3 scroll-smooth overflow-x-hidden overflow-y-auto pb-5"
  >
    {#each displayedFavorites as favorite, i (i)}
      <LibraryCard {favorite} />
    {/each}
  </div>

  {#if $libraryFavorites.length > perPage}
    <Pagination.Root
      class="my-2"
      {count}
      {perPage}
      {siblingCount}
      bind:page
      onPageChange={() => favoriteDiv.scrollTo({ top: 0 })}
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
