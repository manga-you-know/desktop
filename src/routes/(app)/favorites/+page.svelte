<script lang="ts">
  import { onMount } from "svelte";
  import { FavoriteCard } from "@/components";
  import { FavoriteRepository } from "@/repositories";
  import { ultraFavorites } from "@/store";
  import { refreshFavorites } from "@/functions";

  onMount(async () => {
    await refreshFavorites();
  });
</script>

<div class="h-full flex flex-col overflow-hidden">
  <div class="h-14 flex relative top-0"></div>
  <div
    class="flex flex-wrap content-start gap-3 scroll-smooth overflow-y-auto overflow-x-hidden pb-5"
  >
    {#each $ultraFavorites as favorite}
      <FavoriteCard {favorite} />
    {/each}
  </div>
</div>
