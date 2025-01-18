<script lang="ts">
  import "@/app.css";
  import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";
  import { type } from "@tauri-apps/plugin-os";
  import { Toaster } from "@/lib/components";
  import { ModeWatcher } from "mode-watcher";
  // import { NinjaKeys } from "ninja-keys";
  // import { shortcuts, Shortcuts } from "svelte-keyboard-shortcuts";
  import { onMount, onDestroy } from "svelte";
  import { Search, Settings } from "@/components";
  import { autoSearchUpdates, openSearch } from "@/store";
  import {
    checkForAppUpdates,
    initDatabase,
    migrateDatabase,
    loadSettings,
    toggleFullscreen,
    loadFavoriteChapters,
  } from "@/functions";
  let { children } = $props();
  const os = type();
  const interval = setInterval(
    async () => {
      try {
        await loadFavoriteChapters(true);
      } catch (e) {
        console.log(e);
      }
    },
    1000 * 60 * 10
  );
  onMount(async () => {
    await initDatabase();
    await migrateDatabase();
    await loadSettings();
    if (os === "windows" || os === "linux" || os === "macos") {
      try {
        await unregisterAll();
        await register("CommandOrControl+K", (e) => {
          if (e.state === "Pressed") {
            $openSearch = !$openSearch;
          }
        });
        await register("F11", (e) => {
          if (e.state === "Pressed") toggleFullscreen();
        });
      } catch (e) {
        console.log(e);
      }
      loadFavoriteChapters();
      if ($autoSearchUpdates) {
        await checkForAppUpdates();
      }
    }
  });
  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<Toaster richColors />
<Search />
<Settings />
<ModeWatcher defaultMode="dark" />
{@render children?.()}
