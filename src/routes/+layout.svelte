<script lang="ts">
  import "@/app.css";
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
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "F11") {
      toggleFullscreen();
    }
    if (e.key.toUpperCase() === "K" && (e.metaKey || e.ctrlKey)) {
      openSearch.set(!$openSearch);
    }
  }

  onMount(async () => {
    await initDatabase();
    await migrateDatabase();
    await loadSettings();
    if (os === "windows" || os === "linux" || os === "macos") {
      // });
      // await register("F11", (e) => {
      //   if (e.state === "Pressed") toggleFullscreen();
      // });
      loadFavoriteChapters();
      if ($autoSearchUpdates) {
        await checkForAppUpdates();
      }
      // const window = getCurrentWindow();
      // window.onFocusChanged((e) => {
      //   // if (e.payload === true) {
      //   //   loadFavoriteChapters();
      //   // }

      // });
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
<svelte:window onkeydown={handleKeydown} />
{@render children?.()}
