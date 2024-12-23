<script lang="ts">
  import { onMount } from "svelte";
  import type { Favorite } from "@/models";
  import { FavoriteRepository } from "@/repositories";
</script>

<div class="overflow-x-hidden h-screen">
  <div class="h-14 flex relative top-0">
    <h1 class="text-white">fodas</h1>
  </div>
  <div
    class="flex flex-wrap gap-3 overflow-auto h-[calc(100vh-3.5rem)] pb-5"
  ></div>
</div>
