<script lang="ts">
  import { onMount } from "svelte";
  import { FavoriteCard } from "@/components";
  import { FavoriteRepository } from "@/repositories";
  import type { Favorite } from "@/models";

  let favorites: Favorite[] = [];

  onMount(async () => {
    favorites = await FavoriteRepository.getUltraFavorites();
  });
</script>

<div class="h-full flex flex-col overflow-hidden">
  <div class="h-14 flex relative top-0">
    <h1 class="text-white">fodas</h1>
  </div>
  <div
    class="flex flex-wrap content-start gap-3 scroll-smooth overflow-y-auto overflow-x-hidden pb-5"
  >
    {#each favorites as favorite}
      <FavoriteCard {favorite} />
    {/each}
  </div>
</div>
