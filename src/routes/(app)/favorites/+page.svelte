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
  import { ScrollingValue } from "svelte-ux";

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

<div class="mr-4 flex h-full flex-col overflow-hidden">
  <div
    class="scrollbar flex h-full w-full flex-wrap content-start justify-center gap-3 overflow-x-hidden overflow-y-scroll scroll-smooth pb-5"
    bind:this={favoriteDiv}
    bind:clientWidth={favdivWidth}
  >
    <div
      class={cn(
        "smh:absolute z-20 mt-1 -mb-[15px] flex max-w-[80svw]! items-center justify-center gap-1 rounded-3xl p-3 backdrop-blur-md md:gap-2",
        IS_MOBILE ? "h-28 flex-wrap" : "h-14",
      )}
    >
      <div class="flex items-center gap-2">
        <div class="flex gap-2">
          <Badge
            class="flex w-12! w-22 justify-center gap-0.5 font-bold"
            variant="outline"
          >
            <ScrollingValue axis="y" value={countFound} />
          </Badge>
          <Badge class="h-10 w-22 gap-1 font-bold" variant="outline">
            {#if favoritesWithChapter.length > 0}
              +
            {/if}
            <ScrollingValue axix="y" value={favoritesWithChapter.length} />
            Favorites
          </Badge>
          <Badge class="h-10 w-22 gap-1 font-bold" variant="outline">
            {#if favoritesWithChapter.length > 0}
              +
            {/if}
            <ScrollingValue
              axis="y"
              value={Object.values($favoritesLoaded).reduce(
                (total, fv) => total + (fv.isLoaded ? fv.toReadCount : 0),
                0,
              )}
            /> Chapters
          </Badge>
        </div>

        <Button
          class="group/show hover:bg-background/40 flex h-10 px-2"
          variant="outline"
          onclick={() => {
            showOnlyNew.set(!$showOnlyNew);
          }}
        >
          <Switch
            class="dark:data-[state=unchecked]:bg-secondary/70! dark:group-hover/show:data-[state=unchecked]:bg-secondary/90! group-hover/show:data-[state=checked]:bg-primary/70! pointer-events-none  rounded-[11px]"
            classThumb="rounded-xl"
            id="show-only-new"
            bind:checked={$showOnlyNew}
          />
          <Label
            class="mr-1 cursor-pointer dark:text-white"
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
            class="h-5 w-5"
          />
          {$isRefreshing ? "Loading..." : "Refresh"}
        </Button>
      </div>
    </div>
    <div class="smh:h-14 h-12 w-full"></div>
    {#if displayedFavorites.length === 0}
      <div class="mt-10 flex w-full justify-center">
        <Badge
          class="flex h-12 flex-col items-center justify-center text-sm"
          variant={!$showOnlyNew || $ultraFavorites.length === 0
            ? "destructive"
            : "info"}
          onclick={() => openSearch.set(true)}
        >
          {#if !$showOnlyNew || $ultraFavorites.length === 0}
            There's no favorite. You can click on the star in the chapters <br
            />
            modal to achieve that. Or you can find something at
            <span class="absolute mt-5 ml-84 cursor-pointer hover:underline"
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
      <div class="h-[234px] w-[158px] p-1"></div>
    {/each}
    {#if !$showOnlyNew ? $ultraFavorites.length > perPage : favoritesWithChapter.length > perPage}
      <div class="h-10 w-full"></div>
      <div
        class="bg-secondary/30 absolute bottom-6 mt-10 flex rounded-3xl px-2 py-2 backdrop-blur-md"
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
