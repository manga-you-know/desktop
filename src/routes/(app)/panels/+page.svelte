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
  import { refreshPanels } from "@/functions";

  onMount(() => {
    refreshPanels();
  });
</script>

<div
  class="h-full flex flex-wrap content-start gap-10 scroll-smooth overflow-y-auto overflow-x-hidden p-5"
>
  {#each $panels as panel}
    <FavoritePanel src={panel.src} path={panel.path} />
  {/each}
</div>
