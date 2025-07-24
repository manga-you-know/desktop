<script lang="ts">
  import "@/app.css";
  import { Toaster } from "@/lib/components";
  import { onMount, onDestroy } from "svelte";
  import {
    AddCustom,
    Downloads,
    EditTags,
    Search,
    Settings,
    TitleBar,
    Update,
  } from "@/components";
  import {
    autoSearchUpdates,
    closeTray,
    customTitlebar,
    isFullscreen,
    isMaximized,
    openSearch,
    theme,
    undoTasks,
    updateInfo,
    windowEffects,
  } from "@/store";
  import {
    checkForAppUpdates,
    initDatabase,
    migrateDatabase,
    loadSettings,
    toggleFullscreen,
    createTray,
    setFullscreen,
    logNewUser,
    loadAppIcons,
    reloadApp,
    refreshLibrary,
    refreshFavorites,
    loadFavoritesChapters,
    saveScreenState,
    refreshPanels,
    updateBadge,
  } from "@/functions";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { twMerge } from "tailwind-merge";
  import { get } from "svelte/store";
  import { cn } from "@/lib/utils";
  import { IS_MOBILE } from "@/constants";
  import { toast } from "svelte-sonner";

  let { children } = $props();
  const window = getCurrentWindow();
  const interval = setInterval(
    async () => {
      try {
        loadFavoritesChapters();
        if (!IS_MOBILE && $autoSearchUpdates && !$updateInfo.updateAvailable) {
          checkForAppUpdates();
        }
      } catch (e) {
        console.log(e);
      }
    },
    1000 * 60 * 10,
  );
  function handleKeydown(e: KeyboardEvent) {
    const isCtrl = e.metaKey || e.ctrlKey;
    if (e.key === "F11") {
      toggleFullscreen();
    }

    if (e.key === "Escape") {
      setFullscreen(false);
    }

    if (e.key.toUpperCase() === "Z" && isCtrl) {
      const task = $undoTasks.pop();
      if (task === undefined) return;
      task.do();
      toast.info(task.message);
    }
    if (e.key.toUpperCase() === "K" && isCtrl) {
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
    saveScreenState();
  });

  async function loadDatabase() {
    await initDatabase();
    await migrateDatabase();
  }
  async function loadScreenState() {
    isMaximized.set(await window.isMaximized());
    isFullscreen.set(await window.isFullscreen());
  }

  onMount(async () => {
    loadDatabase();
    logNewUser();
    createTray();
    loadSettings();
    loadAppIcons();
    refreshLibrary();
    refreshPanels();
    loadScreenState();
    refreshFavorites();
    loadFavoritesChapters();
    if (!IS_MOBILE && $autoSearchUpdates) {
      checkForAppUpdates();
    }
  });
  function screenJob() {
    loadScreenState();
    // saveScreenState();
  }
  window.onResized(screenJob);
  window.onFocusChanged((v) => {
    if (v.payload) {
      updateBadge();
    }
  });
  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<svelte:window onkeydown={handleKeydown} />
<link href="https://fonts.cdnfonts.com/css/minecraftia" rel="stylesheet" />
<div
  class={twMerge(
    "text-black dark:text-white border-background",
    $theme === "dark" && "dark",
  )}
>
  <Toaster theme={$theme} toastOptions={{}} richColors duration={2700} />
  <Search />
  <Settings />
  <AddCustom />
  <Downloads />
  <Update />
  <EditTags />
  {#if IS_MOBILE}
    {@render children?.()}
  {:else}
    <div
      class={cn(
        "flex flex-col overflow-hidden",
        !$windowEffects && "bg-background",
      )}
    >
      {#if $customTitlebar}
        <TitleBar />
      {/if}
      <div
        class={$isFullscreen || !$customTitlebar
          ? "max-h-screen overflow-hidden"
          : "max-h-[calc(100vh-2.5rem)] overflow-hidden"}
      >
        {@render children?.()}
      </div>
    </div>
  {/if}
</div>
