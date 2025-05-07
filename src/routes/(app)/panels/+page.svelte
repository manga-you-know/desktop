<script lang="ts">
  import { FavoritePanel } from "@/components";
  import {
    exists,
    readDir,
    BaseDirectory,
    type DirEntry,
  } from "@tauri-apps/plugin-fs";
  import { convertFileSrc } from "@tauri-apps/api/core";
  import { documentDir, join } from "@tauri-apps/api/path";
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
  class="h-full flex flex-wrap content-start gap-5 scroll-smooth overflow-y-auto overflow-x-hidden p-7"
>
  {#each $panels as panel}
    <FavoritePanel
      src={panel.src}
      path={panel.path}
      bind:shouldCopy={panel.shouldCopy}
    />
  {/each}
</div>
