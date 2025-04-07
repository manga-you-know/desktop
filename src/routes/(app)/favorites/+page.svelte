<script lang="ts">
  import { onMount } from "svelte";
  import { FavoriteCard } from "@/components";
  import { Label, Switch, Badge } from "@/lib/components";
  import { FavoriteRepository } from "@/repositories";
  import { showOnlyNew, ultraFavorites, favoritesLoaded } from "@/store";
  import { refreshFavorites, saveSettings } from "@/functions";

  onMount(async () => {
    await refreshFavorites();
  });
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
