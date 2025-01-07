<script lang="ts">
  import { onMount } from "svelte";
  import { Pagination, Button, Badge, Input } from "@/lib/components";
  import { LibraryCard, LibraryOrder, LibrarySearch } from "@/components";
  import { FavoriteRepository } from "@/repositories";
  import { libraryFavorites, searchTerm } from "@/store";
  import type { Favorite } from "@/interfaces";
  let favoriteDiv: HTMLDivElement;
  let page = $state(1);
  let perPage = 16;
  const count = $derived($libraryFavorites.length);
  let displayedFavorites: Favorite[] = $derived(
    $libraryFavorites.slice((page - 1) * perPage, page * perPage)
  );
  libraryFavorites.subscribe((_) => {
    page = 1;
  });
  const siblingCount = 1;
  onMount(async () => {
    const newFavorites = await FavoriteRepository.getFavorites();
    libraryFavorites.set(newFavorites);
  });
</script>

<div class="h-full overflow-hidden flex flex-col">
  <div class="w-full h-14 p-2 gap-2 flex items-center relative top-0">
    <Badge class="h-10 w-12 flex justify-center rounded-md" variant="outline"
      >{count}</Badge
    >
    <LibraryOrder />
    <LibrarySearch />
  </div>
  <div
    bind:this={favoriteDiv}
    class="flex flex-wrap content-start gap-3 scroll-smooth overflow-x-hidden overflow-y-auto pb-5"
  >
    {#each displayedFavorites as favorite}
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
            <Pagination.PrevButton tabindex={-1} />
          </Pagination.Item>
          {#each pages as page (page.key)}
            {#if page.type === "ellipsis"}
              <Pagination.Item tabindex={-1}>
                <Pagination.Ellipsis />
              </Pagination.Item>
            {:else}
              <Pagination.Item>
                <Pagination.Link
                  {page}
                  class={currentPage === page.value
                    ? "!bg-white !text-black"
                    : ""}
                  isActive={currentPage === page.value}
                  tabindex={-1}
                >
                  {page.value}
                </Pagination.Link>
              </Pagination.Item>
            {/if}
          {/each}
          <Pagination.Item>
            <Pagination.NextButton tabindex={-1} />
          </Pagination.Item>
        </Pagination.Content>
      {/snippet}
    </Pagination.Root>
  {/if}
</div>
{#each $libraryFavorites.map((_) => _.cover) as image}
  <img class="hidden" src={image} alt="Prefetched" data-sveltekit-prefetch />
{/each}
