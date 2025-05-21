<script lang="ts">
  import "@/app.css";
  import { Toaster } from "@/lib/components";
  import { onMount, onDestroy } from "svelte";
  import {
    AddCustom,
    Downloads,
    EditCollections,
    Search,
    Settings,
    Update,
  } from "@/components";
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
    setFullscreen,
    logNewUser,
    loadAppIcons,
    reloadApp,
  } from "@/functions";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { twMerge } from "tailwind-merge";
  import { get } from "svelte/store";

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

    if (e.key === "F5" && (e.metaKey || e.ctrlKey)) {
      reloadApp();
    }
  }

  window.onCloseRequested((e) => {
    e.preventDefault();
    if (get(closeTray)) {
      window.hide();
    } else {
      window.destroy();
      interval.unref();
    }
  });
  async function loadDatabase() {
    await initDatabase();
    await migrateDatabase();
  }
  onMount(async () => {
    loadDatabase();
    loadSettings();
    createTray();
    loadFavoriteChapters();
    loadAppIcons();
    if (!$isMobile && $autoSearchUpdates) {
      checkForAppUpdates();
    }
    logNewUser();
  });
  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<svelte:window onkeydown={handleKeydown} />
<div
  class={twMerge(
    "dark:bg-[#111113]! text-black dark:text-white",
    $theme === "dark" ? "dark" : ""
  )}
>
  <Toaster theme={$theme} toastOptions={{}} richColors duration={2700} />
  <Search />
  <Settings />
  <AddCustom />
  <Downloads />
  <Update />
  <EditCollections />
  <TooltipPrimitive.Provider>
    {@render children?.()}
  </TooltipPrimitive.Provider>
</div>
