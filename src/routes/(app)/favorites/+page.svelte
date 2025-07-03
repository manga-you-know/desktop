<script lang="ts">
  import { onMount } from "svelte";
  import { FavoriteCard } from "@/components";
  import { Button, Label, Switch, Badge, Pagination } from "@/lib/components";
  import {
    showOnlyNew,
    ultraFavorites,
    favoritesLoaded,
    isRefreshing,
    openSearch,
  } from "@/store";
  import {
    loadFavoritesChapters,
    refreshFavorites,
    saveSettings,
  } from "@/functions";
  import Icon from "@iconify/svelte";
  import { cn } from "@/lib/utils";
  import { IS_MOBILE } from "@/constants";
  import type { Favorite } from "@/types";

  let favoriteDiv: HTMLDivElement = $state(null!);
  let favdivWidth: number = $state(0);
  let page = $state(1);
  let perPage = $derived(Math.floor(favdivWidth / 169) * 3);
  let favoritesWithChapter: Favorite[] = $derived(
    $ultraFavorites.filter(
      (fv) => $favoritesLoaded[fv.id.toString()]?.nextChapter
    )
  );
  let displayedFavorites: Favorite[] = $derived(
    !$showOnlyNew
      ? $ultraFavorites.slice((page - 1) * perPage, page * perPage)
      : favoritesWithChapter.slice((page - 1) * perPage, page * perPage)
  );
  const count = $derived($ultraFavorites.length);
  const extraSpace: number = $derived(
    perPage >= displayedFavorites.length
      ? perPage - displayedFavorites.length
      : perPage * 2 >= displayedFavorites.length
        ? perPage * 2 - displayedFavorites.length
        : perPage * 3 >= displayedFavorites.length
          ? perPage * 3 - displayedFavorites.length
          : 0
  );
  onMount(async () => {
    await refreshFavorites();
  });
  $effect(() => {
    if (displayedFavorites.length === 0 && page > 1) {
      page = Math.ceil($ultraFavorites.length / perPage);
    }
  });
</script>

<div class="h-full flex flex-col overflow-hidden">
  <div
    class={cn(
      "flex relative top-0",
      IS_MOBILE ? "h-24 justify-center" : "h-14"
    )}
  >
    <div class="flex flex-wrap items-center gap-2">
      <div class="flex">
        <Badge
          class="font-bold h-8 w-22 rounded-xl rounded-r-none mr-0"
          variant="secondary"
        >
          + {Object.values($favoritesLoaded).reduce(
            (total, fv) => total + (fv.isLoaded && fv.nextChapter ? 1 : 0),
            0
          )} Favorites
        </Badge>
        <Badge
          class="font-bold h-8 w-22 rounded-xl rounded-l-none -ml-[2px]"
          variant="secondary"
        >
          + {Object.values($favoritesLoaded).reduce(
            (total, fv) => total + (fv.isLoaded ? fv.toReadCount : 0),
            0
          )} Chapters
        </Badge>
      </div>
      <Button
        size="sm"
        variant="secondary"
        class="rounded-xl h-8"
        disabled={$isRefreshing}
        onclick={() => loadFavoritesChapters()}
      >
        <Icon
          icon={$isRefreshing
            ? "line-md:loading-loop"
            : "mingcute:refresh-3-fill"}
          class="w-5 h-5"
        />
        Refresh
      </Button>
      <div class="flex gap-2 items-center">
        <Switch
          id="showOnlyNew"
          bind:checked={$showOnlyNew}
          onCheckedChange={() => {
            page = 1;
            favoriteDiv.scrollTo({ top: 0 });
            saveSettings();
          }}
        />
        <Label class="dark:text-white cursor-pointer" for="showOnlyNew"
          >Only new chapters</Label
        >
      </div>
    </div>
  </div>

  <div
    class="scrollbar w-[99.2%] h-full justify-center flex flex-wrap content-start gap-3 scroll-smooth overflow-y-scroll overflow-x-hidden pb-5"
    bind:this={favoriteDiv}
    bind:clientWidth={favdivWidth}
  >
    {#if displayedFavorites.length === 0}
      <div class="flex w-full justify-center mt-10">
        <Badge
          class="flex flex-col text-sm h-12"
          variant="destructive"
          onclick={() => openSearch.set(true)}
        >
          {#if !$showOnlyNew || $ultraFavorites.length === 0}
            There's no favorite. You can click on the star in the chapters <br
            />
            modal to achieve that. Or you can find something at
            <span
              class="absolute cursor-pointer hover:underline mt-5 ml-[21rem]"
              >Search</span
            >
          {:else}
            Looks like you've been reading a lot... all done!
          {/if}
        </Badge>
      </div>
    {/if}
    {#each displayedFavorites as favorite}
      <FavoriteCard {favorite} />
    {/each}
    {#each Array.from({ length: extraSpace }, (_, i) => i) as n (n)}
      <div class="w-[158px] h-[234px] p-1"></div>
    {/each}
    {#if !$showOnlyNew ? $ultraFavorites.length > perPage : favoritesWithChapter.length > perPage}
      <div class="w-full smh:h-10"></div>
      <div
        class="bg-secondary/60 backdrop-blur-sm flex rounded-3xl smh:absolute smh:bottom-6 mt-20 smh:mt-0 py-2 px-2"
      >
        <Pagination.Root
          {count}
          {perPage}
          siblingCount={1}
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
