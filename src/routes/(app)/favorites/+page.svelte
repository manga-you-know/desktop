<script lang="ts">
  import { onMount } from "svelte";
  import { FavoriteCard } from "@/components";
  import { Label, Switch } from "@/lib/components";
  import { FavoriteRepository } from "@/repositories";
  import { showOnlyNew, ultraFavorites } from "@/store";
  import { refreshFavorites } from "@/functions";

  onMount(async () => {
    await refreshFavorites();
  });
</script>

<div class="h-full flex flex-col overflow-hidden">
  <div class="h-14 flex relative top-0">
    <div class="flex items-center gap-2">
      <Switch id="showOnlyNew" bind:checked={$showOnlyNew} />
      <Label for="showOnlyNew">Only new chapters</Label>
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
