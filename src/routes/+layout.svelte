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
    blockKeyboard,
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
  import { getCurrentWindow, ProgressBarStatus } from "@tauri-apps/api/window";
  import { twMerge } from "tailwind-merge";
  import { get } from "svelte/store";
  import { cn } from "@/lib/utils";
  import { IS_MOBILE } from "@/constants";
  import { toast } from "svelte-sonner";
  import { page } from "$app/state";
  import { exit } from "@tauri-apps/plugin-process";
  import { retroMode } from "@/states";
  import { type } from "@tauri-apps/plugin-os";
    import { Ssgoi, type SsgoiConfig } from "@ssgoi/svelte";
    import { fade, scroll } from "@ssgoi/svelte/view-transitions";

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

  const isInput = () => {
    return document.activeElement?.tagName === "INPUT";
  };

  function handleKeydown(e: KeyboardEvent) {
    const isCtrl = e.metaKey || e.ctrlKey;
    const key = e.key.toLowerCase();
    if (key === "f11" || (key === "f" && !isInput())) {
      toggleFullscreen();
    }

    if (key === "escape") {
      setFullscreen(false);
    }

    if (key === "z" && isCtrl && !isInput()) {
      const task = $undoTasks.pop();
      if (task === undefined) return;
      task.do();
      toast.info(task.message);
    }
    if (key === "k" && isCtrl && !isInput()) {
      const input = document.querySelector(
        `input[id="central-search"]`,
      ) as HTMLInputElement;
      input?.focus();
    }
    if (key === "p" && isCtrl && !isInput()) {
      openSearch.set(!$openSearch);
    }

    if (key === "r" && isCtrl && !isInput()) {
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
// const routeOrder = ['/home', '/favorites', '/library', '/panels'];
//    const createMiddleware = (routes: [string]) => {
//     return (from: string, to: string) => {
//       const fromIndex = routes.indexOf(from);
//       const toIndex = routes.indexOf(to);
//
//       if (fromIndex < toIndex) {
//         return { from: "/nav/prev", to: "/nav/next" };
//       } else {
//         return { from: "/nav/next", to: "/nav/prev" };
//       }
//     };
//   };
  const configTransitions: SsgoiConfig = {
    transitions: [
      {
        from: '/home',
        to: '/favorites',
        transition: scroll({ 
          direction: 'up',
          spring: { stiffness: 300, damping: 30 }
        })
      },
      {
        from: '/home',
        to: '/library',
        transition: scroll({ 
          direction: 'up',
          spring: { stiffness: 300, damping: 30 }
        })
      },
      {
        from: '/home',
        to: '/panels',
        transition: scroll({ 
          direction: 'up',
          spring: { stiffness: 300, damping: 30 }
        })
      },
      {
        from: '/favorites',
        to: '/home',
        transition: scroll({ 
          direction: 'down',
          spring: { stiffness: 300, damping: 30 }
        })
      },
      {
        from: '/favorites',
        to: '/library',
        transition: scroll({ 
          direction: 'up',
          spring: { stiffness: 300, damping: 30 }
        })
      },
      {
        from: '/favorites',
        to: '/panels',
        transition: scroll({ 
          direction: 'down',
          spring: { stiffness: 300, damping: 30 }
        })
      },
      {
        from: '/library',
        to: '/home',
        transition: scroll({ 
          direction: 'down',
          spring: { stiffness: 300, damping: 30 }
        })
      },
      {
        from: '/library',
        to: '/favorites',
        transition: scroll({ 
          direction: 'down',
          spring: { stiffness: 300, damping: 30 }
        })
      },
      {
        from: '/library',
        to: '/panels',
        transition: scroll({ 
          direction: 'up',
          spring: { stiffness: 300, damping: 30 }
        })
      },
      {
        from: '/panels',
        to: '/home',
        transition: scroll({ 
          direction: 'down',
          spring: { stiffness: 300, damping: 30 }
        })
      },
      {
        from: '/panels',
        to: '/favorites',
        transition: scroll({ 
          direction: 'down',
          spring: { stiffness: 300, damping: 30 }
        })
      },
      {
        from: '/panels',
        to: '/library',
        transition: scroll({ 
          direction: 'down',
          spring: { stiffness: 300, damping: 30 }
        })
      },
    ]
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

  $effect(() => {
    if (!page.route?.id?.startsWith("/reader"))
      window.setProgressBar({
        status: ProgressBarStatus.None,
      });
  });
</script>

<svelte:window onkeydown={handleKeydown} />
<link href="https://fonts.cdnfonts.com/css/minecraftia" rel="stylesheet" />

<Ssgoi config={configTransitions}>
<div
  class={cn(
    "relative text-primary border-background",
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
        "fixed z-999 pointer-events-none w-screen h-screen transition-colors duration-300",
        $useFilter &&
          (!$filterReader || page.route.id?.startsWith("/reader")) &&
          $filter,
      )}
    ></div>
    <div
      class={cn(
        "flex flex-col overflow-hidden transition-colors duration-300 group/webkit",
        !$windowEffects && "bg-background",
        page.route.id?.startsWith("/reader") && "dark:bg-black",
      )}
      data-webkit={!["linux", "macos"].includes(type())}
    >
    <!-- group-data-[retro=active]/theme:bg-red-500 --> 
      <div
        class={cn(
          "w-screen h-screen filter-effects",
          $blackWhiteMode && "grayscale!",
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
</Ssgoi>

<svelte:head>
  {@html retroMode.active
    ? "<style>* { border-radius: 0 !important; }</style>"
    : ""}
</svelte:head>

<style>
  .filter-effects {
    filter: contrast(var(--contrast)) brightness(var(--brightness))
      saturate(var(--saturation)) sepia(var(--sepia));
  }
</style>
