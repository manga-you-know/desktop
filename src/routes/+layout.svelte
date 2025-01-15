<script lang="ts">
  import "@/app.css";
  import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";
  import { type } from "@tauri-apps/plugin-os";
  import { ModeWatcher } from "mode-watcher";
  // import { NinjaKeys } from "ninja-keys";
  // import { shortcuts, Shortcuts } from "svelte-keyboard-shortcuts";
  import { onMount } from "svelte";
  import { Search, Settings } from "@/components";
  import { autoSearchUpdates, openSearch } from "@/store";
  import {
    checkForAppUpdates,
    initDatabase,
    migrateDatabase,
    loadSettings,
    toggleFullscreen,
  } from "@/functions";
  let { children } = $props();

  const os = type();
  onMount(async () => {
    await initDatabase();
    await migrateDatabase();
    await loadSettings();
    if (os === "windows" || os === "linux" || os === "macos") {
      await unregisterAll();
      await register("CommandOrControl+K", (e) => {
        if (e.state === "Pressed") {
          $openSearch = !$openSearch;
        }
      });
      await register("F11", (e) => {
        if (e.state === "Pressed") toggleFullscreen();
      });
      if ($autoSearchUpdates) {
        await checkForAppUpdates();
      }
    }
  });
</script>

<Search />
<Settings />
<ModeWatcher defaultMode="dark" />
{@render children?.()}
