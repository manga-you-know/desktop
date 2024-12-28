<script lang="ts">
  import { Button, Dialog, Input } from "@/lib/components";
  import { downloadManager } from "@/store";
  import { FavoriteRepository } from "@/repositories";
  import { MANGASOURCES } from "@/constants";
  import Icon from "@iconify/svelte";
  import type { Favorite } from "@/models";
  import ScrollArea from "@/lib/components/ui/scroll-area/scroll-area.svelte";
  import { onMount } from "svelte";

  let { open = $bindable(false) } = $props();
  let searchTerm = $state("");
  let selectedSource = $state(MANGASOURCES[2]);
  let results: Favorite[] = $state([]);
  let favorites: Favorite[] = $state([]);
  onMount(async () => {
    favorites = await FavoriteRepository.getRawFavorites();
  });
  async function search() {
    results = await $downloadManager.search(searchTerm, selectedSource);
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content interactOutsideBehavior="close">
    <Dialog.Header>
      <Dialog.Title>Search Favorites in {selectedSource}</Dialog.Title>
      <Input
        bind:value={searchTerm}
        placeholder="Search..."
        onchange={search}
      />
      <div class="flex gap-2">
        <ScrollArea class="h-60">
          {#each results as result}
            <Button
              class="w-full flex justify-center"
              onclick={async () => {
                await FavoriteRepository.createFavorite(result);
                favorites = await FavoriteRepository.getRawFavorites();
              }}
            >
              <span class="ml-2">{result.name}</span>
              <Icon
                icon={favorites.includes(result)
                  ? "heroicons:star-solid"
                  : "heroicons:star"}
              />
            </Button>
          {/each}
        </ScrollArea>
      </div>
      <div class="flex gap-2"></div>
    </Dialog.Header>
    <Dialog.Footer></Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
