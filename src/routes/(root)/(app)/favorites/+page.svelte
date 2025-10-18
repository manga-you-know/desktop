<script lang="ts">
  import { onMount } from "svelte";
  import { FavoriteCard } from "@/components";
  import {
    Button,
    Label,
    Switch,
    Badge,
    Pagination,
    ScrollingValue,
  } from "@/lib/components";
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
      (fv) => $favoritesLoaded[fv.id.toString()]?.nextChapter,
    ),
  );
  let displayedFavorites: Favorite[] = $derived(
    !$showOnlyNew
      ? $ultraFavorites.slice((page - 1) * perPage, page * perPage)
      : favoritesWithChapter.slice((page - 1) * perPage, page * perPage),
  );
  const countFound = $derived(
    !$showOnlyNew ? $ultraFavorites.length : favoritesWithChapter.length,
  );
  function extraSpaceCards(): number {
    const x = perPage / 3;
    const n = displayedFavorites.length;
    if (n <= x) return x - n;
    if (n <= 2 * x) return 2 * x - n;
    if (n <= 3 * x) return 3 * x - n;
    return 0;
  }
  onMount(async () => {
    await refreshFavorites();
  });
  $effect(() => {
    if (displayedFavorites.length === 0 && page > 1) {
      page = Math.ceil($ultraFavorites.length / perPage);
    }
  });
  showOnlyNew.subscribe(() => {
    page = 1;
    favoriteDiv?.scrollTo({ top: 0 });
    saveSettings();
  });
</script>

<div class="h-full flex flex-col mr-4 overflow-hidden">
  <div
    class="scrollbar w-full h-full justify-center flex flex-wrap content-start gap-3 scroll-smooth overflow-y-scroll overflow-x-hidden pb-5"
    bind:this={favoriteDiv}
    bind:clientWidth={favdivWidth}
  >
    <div
      class={cn(
        "backdrop-blur-md flex max-w-[80svw]! -mb-[15px] rounded-3xl mt-1 p-3 gap-1 md:gap-2 justify-center items-center smh:absolute z-20",
        IS_MOBILE ? "h-28 flex-wrap" : "h-14",
      )}
    >
      <div class="flex items-center gap-2">
        <div class="flex gap-2">
          <Badge
            class="flex justify-center font-bold w-12! w-22 gap-0.5"
            variant="outline"
          >
            <ScrollingValue class="-mt-4" value={countFound} />
          </Badge>
          <Badge class="font-bold h-10 w-22 gap-1" variant="outline">
            {#if favoritesWithChapter.length > 0}
              +
            {/if}
            <ScrollingValue class="-mt-4" value={favoritesWithChapter.length} />
            Favorites
          </Badge>
          <Badge class="font-bold h-10 w-22 gap-1" variant="outline">
            {#if favoritesWithChapter.length > 0}
              +
            {/if}
            <ScrollingValue
              class="-mt-4"
              value={Object.values($favoritesLoaded).reduce(
                (total, fv) => total + (fv.isLoaded ? fv.toReadCount : 0),
                0,
              )}
            /> Chapters
          </Badge>
        </div>

        <Button
          class="flex h-10 group/show hover:bg-background/40 px-2"
          variant="outline"
          onclick={() => {
            showOnlyNew.set(!$showOnlyNew);
          }}
        >
          <Switch
            class="rounded-[11px] dark:data-[state=unchecked]:bg-secondary/70! dark:group-hover/show:data-[state=unchecked]:bg-secondary/90! group-hover/show:data-[state=checked]:bg-primary/70!  pointer-events-none"
            classThumb="rounded-xl"
            id="show-only-new"
            bind:checked={$showOnlyNew}
          />
          <Label
            class="mr-1 dark:text-white cursor-pointer"
            for="show-only-new"
          >
            To read
          </Label>
        </Button>
        <Button
          variant="outline"
          disabled={$isRefreshing}
          onclick={() => loadFavoritesChapters()}
        >
          <Icon
            icon={$isRefreshing
              ? "line-md:loading-loop"
              : "mingcute:refresh-3-fill"}
            class="w-5 h-5"
          />
          {$isRefreshing ? "Loading..." : "Refresh"}
        </Button>
      </div>
    </div>
    <div class="w-full h-12 smh:h-14"></div>
    {#if displayedFavorites.length === 0}
      <div class="flex w-full justify-center mt-10">
        <Badge
          class="flex flex-col justify-center items-center text-sm h-12"
          variant={!$showOnlyNew || $ultraFavorites.length === 0
            ? "destructive"
            : "info"}
          onclick={() => openSearch.set(true)}
        >
          {#if !$showOnlyNew || $ultraFavorites.length === 0}
            There's no favorite. You can click on the star in the chapters <br
            />
            modal to achieve that. Or you can find something at
            <span class="absolute cursor-pointer hover:underline mt-5 ml-84"
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
    {#each Array.from({ length: extraSpaceCards() }, (_, i) => i) as n (n)}
      <div class="w-[158px] h-[234px] p-1"></div>
    {/each}
    {#if !$showOnlyNew ? $ultraFavorites.length > perPage : favoritesWithChapter.length > perPage}
      <div class="w-full h-10"></div>
      <div
        class="bg-secondary/30 backdrop-blur-md flex rounded-3xl absolute bottom-6 mt-10 py-2 px-2"
      >
        <Pagination.Root
          {perPage}
          count={countFound}
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
                <Pagination.NextButton class="dark:text-white" tabindex={-1} />
              </Pagination.Item>
            </Pagination.Content>
          {/snippet}
        </Pagination.Root>
      </div>
    {/if}
  </div>
</div>
