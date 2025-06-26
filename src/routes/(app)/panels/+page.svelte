<script lang="ts">
  import { FavoritePanel } from "@/components";
  import { onMount } from "svelte";
  import { panels } from "@/store";
  import { copyImageFromPath, refreshPanels } from "@/functions";

  onMount(() => {
    refreshPanels();
  });

  async function handleKeydown(event: KeyboardEvent) {
    if (event.key.toUpperCase() === "C" && (event.metaKey || event.ctrlKey)) {
      for (let panel of $panels) {
        if (panel.shouldCopy) {
          await copyImageFromPath(panel.path);
          break;
        }
      }
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div
  class="scrollbar w-[99.2%] h-full flex flex-wrap justify-center gap-5 scroll-smooth overflow-y-auto overflow-x-hidden p-7"
>
  {#each $panels as panel}
    <FavoritePanel
      src={panel.src}
      path={panel.path}
      bind:shouldCopy={panel.shouldCopy}
    />
  {/each}
</div>
