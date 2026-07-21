<script lang="ts">
  import "@/app.css";
  import { Sidebar as SidebarProv, Toaster } from "@/lib/components";
  import { onMount, onDestroy } from "svelte";
  import {
    AddCustom,
    Downloads,
    EditTags,
    ManageExtensions,
    PatchNotes,
    Search,
    SearchFilters,
    SetExtension,
    Settings,
    Sidebar,
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
    sidebarBehavior,
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
  import { get } from "svelte/store";
  import { cn } from "@/lib/utils";
  import { IS_MOBILE } from "@/constants";
  import { toast } from "svelte-sonner";
  import { page } from "$app/state";
  import { exit } from "@tauri-apps/plugin-process";
  import {
    colorTheme,
    lastPage,
     crEvent,
    squareBorders,
    themeMode,
  } from "@/states";
  import { type } from "@tauri-apps/plugin-os";
  import { Child, Command } from "@tauri-apps/plugin-shell";
  import { delay } from "@/utils";
  import { afterNavigate, goto, onNavigate } from "$app/navigation";
  import { suwaManager } from "@/lib/helpers";
  import { addCollection } from "@iconify/svelte";
  import lucide from "@iconify-json/lucide/icons.json";
  import lineMd from "@iconify-json/line-md/icons.json";
  import tabler from "@iconify-json/tabler/icons.json";
  import mingcute from "@iconify-json/mingcute/icons.json";
  import { fly } from "svelte/transition";
  import type { RouteId } from "$app/types";

  let { children } = $props();
  const window = getCurrentWindow();

  // add icons to use
  addCollection(lucide);
  addCollection(lineMd);
  addCollection(tabler);
  addCollection(mingcute);

  // const interval = setInterval(
  //   async () => {
  //     try {
  //       loadFavoritesChapters();
  //       if (!IS_MOBILE && $autoSearchUpdates && !$updateInfo.updateAvailable) {
  //         checkForAppUpdates();
  //       }
  //     } catch (e) {
  //       console.log(e);
  //     }
  //   },
  //   1000 * 60 * 10,
  // );

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

  async function loadDatabase() {
    await initDatabase();
    await migrateDatabase();
  }

  async function loadScreenState() {
    isMaximized.set(await window.isMaximized());
    isFullscreen.set(await window.isFullscreen());
  }

  const close = async () => {
    //await child.kill()
    exit();
  };

  $effect.pre(() => {
    // loadSidecar()
    crEvent.val["page-change"] = false;
    goto(lastPage.value);
    crEvent.val["page-change"] = true;
    suwaManager.startSuwayomi();
    // loadDatabase();
    // logNewUser();
    // showPatchNotes();
    createTray();
    loadSettings();
    loadAppIcons();
    // refreshLibrary();
    // refreshPanels();
    // loadScreenState();
    // refreshFavorites();
    // loadFavoritesChapters();
    if (!IS_MOBILE && $autoSearchUpdates) {
      checkForAppUpdates();
    }
  });

  // onNavigate((navigation) => {
  //   if (!document.startViewTransition) return
  //   return new Promise((resolve) => {
  //     document.startViewTransition(async () => {
  //       resolve()
  //       await navigation.complete
  //     })
  //   })
  // })

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

  window.onCloseRequested((e) => {
    if (get(closeTray)) {
      e.preventDefault();
      window.hide();
    } else {
      close();
    }
  });
  // onDestroy(() => {
  //   clearInterval(interval);
  // });

  window.onThemeChanged(({ payload: theme }) => {
    console.log("something changfed in themess!!");
    console.log(theme);
    themeMode.value = theme;
  });

  afterNavigate(({ to }) => {
    if (to?.route.id) {
      lastPage.value = to.route.id;
    }
  });

  $effect(() => {
    if (!page.route?.id?.startsWith("/reader"))
      window.setProgressBar({
        status: ProgressBarStatus.None,
      });
  });

  const pageIndex = {
    "/favorites": 0,
    "/library": 1,
    "/browse": 2,
    "/panels": 3,
  } satisfies Partial<Record<RouteId, number>>;

  const getPageIndex = (route: RouteId) => {
    if (route in pageIndex) {
      return pageIndex[route as keyof typeof pageIndex];
    } else {
      return -1;
    }
  };

  const getY = (routeTo: RouteId | null, routeFrom: RouteId | null) => {
    if (
      routeTo &&
      routeTo in pageIndex &&
      routeFrom &&
      routeFrom in pageIndex
    ) {
      const isDown = getPageIndex(routeTo) - getPageIndex(routeFrom) >= 0;
      return isDown ? 200 : -200;
    } else {
      return 0;
    }
  };
</script>

<svelte:window onkeydown={handleKeydown} />
<link href="https://fonts.cdnfonts.com/css/minecraftia" rel="stylesheet" />

<div class={cn("relative text-primary border-background", themeMode.value)}>
  <Toaster
    theme={themeMode.value}
    toastOptions={{ classes: { toast: "rounded-2xl" } }}
    richColors
    duration={2700}
  />
  <!-- <Search /> -->
  <Update />
  <Settings />
  <EditTags />
  <AddCustom />
  <Downloads />
  <PatchNotes />
  <ManageExtensions />
  <SetExtension />
  <SearchFilters />
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
        <div class="relative flex w-full overflow-hidden select-none">
          <SidebarProv.Provider
            class={cn("h-full", page.url.pathname === "/random" && "m-0")}
            open={$sidebarBehavior === "expand"}
          >
            <Sidebar variant="inset" />
            <SidebarProv.Inset class={cn("p-2")}>
              {#key page.route.id}
                <div
                  class={cn(
                    "m-0 flex w-full justify-center overflow-hidden pb-5",
                    $customTitlebar ? "h-[calc(100vh-2.5rem)]!" : "h-[99vh]!",
                  )}
                  in:fly={{
                    y: getY(page.route.id, lastPage.value),
                    duration: crEvent.val["page-change"] ? 300 : 0,
                  }}
                  out:fly={{
                    y: getY(page.route.id, lastPage.value) * -1,
                    duration: crEvent.val["page-change"] ? 300 : 0,
                  }}
                >
                  {@render children?.()}
                </div>
              {/key}
            </SidebarProv.Inset>
          </SidebarProv.Provider>
        </div>
      </div>
    </div>
  </div>
</div>

<svelte:head>
  {@html squareBorders.value
    ? "<style>* { border-radius: 0 !important; }</style>"
    : ""}
<!-- {@html `<style> -->
<!--   :root { --primary: ${colorTheme.value.primary}; } -->
<!--   .dark { --primary: ${colorTheme.value.primary}; } -->
<!-- </style>`} -->
</svelte:head>
<style>
  .filter-effects {
    filter: contrast(var(--contrast)) brightness(var(--brightness))
      saturate(var(--saturation)) sepia(var(--sepia));
  }
</style>
