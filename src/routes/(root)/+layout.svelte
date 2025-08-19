<script lang="ts">
  import "@/app.css";
  import { Toaster } from "@/lib/components";
  import { onMount, onDestroy } from "svelte";
  import {
    AddCustom,
    Downloads,
    EditTags,
    PatchNotes,
    Search,
    Settings,
    TitleBar,
    Update,
  } from "@/components";
  import {
    autoSearchUpdates,
    blackWhiteMode,
    brightness,
    closeTray,
    contrast,
    customTitlebar,
    filter,
    filterReader,
    isFullscreen,
    isMaximized,
    openSearch,
    saturation,
    sepia,
    theme,
    undoTasks,
    updateInfo,
    useFilter,
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
    destroyEverything,
    showPatchNotes,
  } from "@/functions";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { twMerge } from "tailwind-merge";
  import { get } from "svelte/store";
  import { cn } from "@/lib/utils";
  import { IS_MOBILE } from "@/constants";
  import { toast } from "svelte-sonner";
  import { page } from "$app/state";
  import { exit } from "@tauri-apps/plugin-process";

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
    if (get(closeTray)) {
      e.preventDefault();
      window.hide();
    } else {
      exit();
    }
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
    showPatchNotes();
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
  class={cn(
    "text-black dark:text-white border-background",
    $theme === "dark" && "dark",
  )}
>
  <Toaster
    theme={$theme}
    toastOptions={{ classes: { toast: "rounded-2xl" } }}
    richColors
    duration={2700}
  />
  <Search />
  <Settings />
  <AddCustom />
  <Downloads />
  <Update />
  <EditTags />
  <PatchNotes />
  {#if IS_MOBILE}
    {@render children?.()}
  {:else}
    <div
      class={cn(
        "fixed z-[999] pointer-events-none w-screen h-screen transition-colors duration-300",
        $useFilter &&
          (!$filterReader || page.route.id?.startsWith("/(root)/reader")) &&
          $filter,
      )}
    ></div>
    <div
      class={cn(
        "flex flex-col overflow-hidden transition-colors duration-300",
        !$windowEffects && "bg-background",
        page.route.id?.startsWith("/(root)/reader") && "dark:bg-black",
      )}
    >
      <div
        class={cn(
          "w-screen h-screen filter-effects",
          $blackWhiteMode && "!grayscale",
        )}
        style="--contrast: {$contrast}; --brightness: {$brightness}; --saturation: {$saturation}; --sepia: {$sepia};"
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
    </div>
  {/if}
</div>

<style>
  .filter-effects {
    filter: contrast(var(--contrast)) brightness(var(--brightness))
      saturate(var(--saturation)) sepia(var(--sepia));
  }
</style>
