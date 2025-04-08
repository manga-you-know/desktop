<script lang="ts">
  import { onMount } from "svelte";
  import { FavoriteCard } from "@/components";
  import { Label, Switch, Badge } from "@/lib/components";
  import { FavoriteRepository } from "@/repositories";
  import { showOnlyNew, ultraFavorites, favoritesLoaded } from "@/store";
  import {
    loadFavoriteChapters,
    refreshFavorites,
    saveSettings,
  } from "@/functions";
  import Button from "@/lib/components/ui/button/button.svelte";
  import Icon from "@iconify/svelte";

  onMount(async () => {
    await refreshFavorites();
  });
  let isRefreshing = $state(false);
</script>

<div class="h-full flex flex-col overflow-hidden">
  <div class="h-14 flex relative top-0">
    <div class="flex items-center gap-2">
      <div>
        <Badge
          class="font-bold h-8 w-22 rounded-xl rounded-r-none mr-0"
          variant="secondary"
        >
          + {Object.values($favoritesLoaded)
            .map((fv) => (fv.nextChapter ? 1 : 0))
            .reduce((a, b) => a + b, 0 as number)} Favorites
        </Badge>
        <Badge
          class="font-bold h-8 w-22 rounded-xl rounded-l-none ml-[-2px]"
          variant="secondary"
        >
          + {Object.values($favoritesLoaded)
            .map((fv) => fv.toReadCount)
            .reduce((a, b) => a + b, 0 as number)} Chapters
        </Badge>
      </div>
      <Button
        size="sm"
        variant="secondary"
        class="rounded-xl h-8"
        disabled={isRefreshing}
        onclick={async () => {
          isRefreshing = true;
          await loadFavoriteChapters();
          isRefreshing = false;
        }}
      >
        <Icon
          icon={isRefreshing
            ? "line-md:loading-loop"
            : "mingcute:refresh-3-fill"}
          class="w-5 h-5"
        />
        Refresh
      </Button>
      <Switch
        id="showOnlyNew"
        bind:checked={$showOnlyNew}
        onCheckedChange={saveSettings}
      />
      <Label class="dark:text-white" for="showOnlyNew">Only new chapters</Label>
    </div>
  </div>

  <div
    class="h-full flex flex-wrap content-start gap-3 scroll-smooth overflow-y-auto overflow-x-hidden pb-5"
  >
    {#each $ultraFavorites as favorite}
      <FavoriteCard {favorite} />
    {/each}
  </div>
</div>
