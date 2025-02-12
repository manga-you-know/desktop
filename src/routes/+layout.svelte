<script lang="ts">
  import "@/app.css";
  import { type } from "@tauri-apps/plugin-os";
  import { Toaster } from "@/lib/components";
  import { ModeWatcher } from "mode-watcher";
  import { onMount, onDestroy } from "svelte";
  import { Search, Settings } from "@/components";
  import { autoSearchUpdates, openSearch } from "@/store";
  import { Tooltip as TooltipPrimitive } from "@/lib/components";
  import {
    checkForAppUpdates,
    initDatabase,
    migrateDatabase,
    loadSettings,
    toggleFullscreen,
    loadFavoriteChapters,
    createTray,
    setDefaultDiscordActivity,
    startDiscordPresence,
    setFullscreen,
  } from "@/functions";
  let { children } = $props();
  const os = type();
  const interval = setInterval(
    async () => {
      try {
        await loadFavoriteChapters();
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
    if (e.key === "Escape") {
      setFullscreen(false);
    }
    if (e.key.toUpperCase() === "K" && (e.metaKey || e.ctrlKey)) {
      openSearch.set(!$openSearch);
    }
  }

  onMount(async () => {
    await initDatabase();
    await migrateDatabase();
    await loadSettings();
    await createTray();
    await startDiscordPresence();
    await setDefaultDiscordActivity();
    if (os === "windows" || os === "linux" || os === "macos") {
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
<svelte:window onkeydown={handleKeydown} />
<TooltipPrimitive.Provider>
  {@render children?.()}
</TooltipPrimitive.Provider>
