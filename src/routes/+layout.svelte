<script lang="ts">
  import "@/app.css";
  import { Toaster } from "@/lib/components";
  import { ModeWatcher } from "mode-watcher";
  import { onMount, onDestroy } from "svelte";
  import { AddCustom, Search, Settings } from "@/components";
  import {
    autoSearchUpdates,
    closeTray,
    openSearch,
    isMobile,
    theme,
  } from "@/store";
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
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { twMerge } from "tailwind-merge";
  let { children } = $props();
  const window = getCurrentWindow();
  const interval = setInterval(
    async () => {
      try {
        loadFavoriteChapters();
        if (!$isMobile && $autoSearchUpdates) {
          checkForAppUpdates();
        }
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

  window.onCloseRequested((e) => {
    if (closeTray) {
      e.preventDefault();
      window.hide();
    }
  });
  async function loadDatabase() {
    await initDatabase();
    await migrateDatabase();
  }
  async function loadDiscordPresence() {
    await startDiscordPresence();
    await setDefaultDiscordActivity();
  }
  onMount(() => {
    loadDatabase();
    loadSettings();
    createTray();
    loadDiscordPresence();
    loadFavoriteChapters();
    if (!$isMobile && $autoSearchUpdates) {
      checkForAppUpdates();
    }
  });
  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<svelte:window onkeydown={handleKeydown} />
<div
  class={twMerge(
    "dark:bg-black text-black dark:text-white",
    $theme === "dark" ? "dark" : ""
  )}
>
  <Toaster richColors />
  <Search />
  <Settings />
  <AddCustom />
  <TooltipPrimitive.Provider>
    {@render children?.()}
  </TooltipPrimitive.Provider>
</div>
