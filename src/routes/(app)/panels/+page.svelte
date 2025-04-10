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
  let downloaded: DirEntry[] = $state([]);
  let panels: { src: string; path: string }[] = $state([]);

  async function refreshPanels() {
    const path = "favorite-panels";
    if (await exists(path, { baseDir: BaseDirectory.Document })) {
      downloaded = await readDir(path, {
        baseDir: BaseDirectory.Document,
      });
    }
    panels = [];
    const docDir = await documentDir();
    for (const panel of downloaded) {
      const path = await join(docDir, "favorite-panels", panel.name);
      panels.push({ src: convertFileSrc(path), path });
    }
  }

  onMount(() => {
    refreshPanels();
  });
</script>

<div
  class="h-full flex flex-wrap content-start gap-10 scroll-smooth overflow-y-auto overflow-x-hidden p-5"
>
  {#each panels as panel}
    <FavoritePanel src={panel.src} path={panel.path} />
  {/each}
</div>
