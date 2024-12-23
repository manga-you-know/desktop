<script lang="ts">
  import { onMount } from "svelte";
  import { UltraFavoriteCard } from "@/components";
  import { FavoriteRepository } from "@/repositories";
  import type { Favorite } from "@/models";

  let favorites: Favorite[] = [];

  onMount(async () => {
    favorites = await FavoriteRepository.getUltraFavorites();
  });
</script>

<div class="overflow-x-hidden h-screen">
  <div class="h-14 flex relative top-0">
    <h1 class="text-white">fodas</h1>
  </div>
  <div
    class="flex flex-wrap content-start gap-3 scroll-smooth overflow-auto h-[calc(100vh-3.5rem)] pb-5"
  >
    {#each favorites as favorite}
      <UltraFavoriteCard {favorite} />
    {/each}
  </div>
</div>
