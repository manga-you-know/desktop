<script lang="ts">
  import { onMount } from "svelte";
  import { Pagination } from "@/lib/components";
  import { FavoriteCard } from "@/components";
  import { FavoriteRepository } from "@/repositories";
  import { favorites } from "@/store";
  import type { Favorite } from "@/models";

  let favoriteDiv: HTMLDivElement;
  let page = $state(1);
  let perPage = 21;
  const count = $derived($favorites.length);
  let displayedFavorites: Favorite[] = $derived(
    $favorites.slice((page - 1) * perPage, page * perPage)
  );
  const siblingCount = 1;
  onMount(async () => {
    const newFavorites = await FavoriteRepository.getFavorites();
    favorites.set(newFavorites);
  });
</script>

<div class="p-1 overflow-x-hidden overflow-y-hidden h-screen flex flex-col">
  <div class="h-14 flex relative top-0">
    <h1 class="text-white">fodas</h1>
  </div>
  <div
    bind:this={favoriteDiv}
    class="flex flex-wrap content-start gap-3 scroll-smooth overflow-x-hidden overflow-y-auto h-[calc(100vh-3.5rem)] pb-5"
  >
    {#each displayedFavorites as favorite}
      <FavoriteCard {favorite} />
    {/each}
  </div>

  {#if $favorites.length > perPage}
    <Pagination.Root
      class="my-2"
      {count}
      {perPage}
      {siblingCount}
      bind:page
      onPageChange={() => favoriteDiv.scrollTo({ top: 0 })}
    >
      {#snippet children({ pages, currentPage })}
        <Pagination.Content>
          <Pagination.Item>
            <Pagination.PrevButton />
          </Pagination.Item>
          {#each pages as page (page.key)}
            {#if page.type === "ellipsis"}
              <Pagination.Item>
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
                >
                  {page.value}
                </Pagination.Link>
              </Pagination.Item>
            {/if}
          {/each}
          <Pagination.Item>
            <Pagination.NextButton />
          </Pagination.Item>
        </Pagination.Content>
      {/snippet}
    </Pagination.Root>
  {/if}
</div>
