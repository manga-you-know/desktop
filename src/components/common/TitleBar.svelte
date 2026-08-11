<script lang="ts">
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { openPath, openUrl } from "@tauri-apps/plugin-opener";
  import {
    Badge,
    Button,
    Input,
    Label,
    Popover,
    ScrollArea,
    Menubar,
  } from "@/lib/components";
  import Icon from "@iconify/svelte";
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { getVersion } from "@tauri-apps/api/app";
  import {
    appDataDir,
    documentDir,
    downloadDir,
    join,
  } from "@tauri-apps/api/path";
  import { exists } from "@tauri-apps/plugin-fs";
  import { cn } from "@/lib/utils";
  import {
    isFullscreen,
    extraTitle,
    downloadings,
    openMenuChapters,
    isMaximized,
    favoritesLoaded,
    globalChapters,
    openPatchNotes,
    openFeedback,
    downloadPath,
    rawFavorites,
    selectedSource,
    downloadManager,
    activatedSources,
    isAscending,
  } from "@/store";
  import {
    refreshFavorites,
    refreshLibrary,
    refreshRawFavorites,
    setFullscreen,
  } from "@/functions";
  import type { Downloading, Favorite, FavoriteLoaded } from "@/types";
  import Tooltip from "./Tooltip.svelte";
  import { goto } from "$app/navigation";
  import { toast } from "svelte-sonner";
  import { getBool, limitStr } from "@/utils";
  import {
    AskDelete,
    FavoriteContext,
    ReadFavorite,
    WatchFavorite,
  } from "@/components";
  import { VList } from "virtua/svelte";
  import { ANIMESOURCES, COMICSOURCES, MANGASOURCES } from "@/constants";
  import { FavoriteDB } from "@/repositories";

  const window = getCurrentWindow();
  let version = $state("0.0.0");
  let appPath = $state("");
  let dlDir = $state("");
  let documentsPath = $state("");
  let divFavs: HTMLDivElement = $state(null!);
  let favoritesWithChapters: FavoriteLoaded[] = $derived(
    Object.values($favoritesLoaded).filter((fv) =>
      fv.nextChapter !== null ? 1 : 0,
    ),
  );
  let downloadingCount = $derived(
    Object.values<Downloading>($downloadings).reduce(
      (a1, a2) => a1 + a2.downloading.length,
      0,
    ),
  );
  let isSearching = $state(false);
  let showSearch = $state(false);
  let query = $state("");
  let libraryResults: Favorite[] = $derived(
    query === ""
      ? []
      : $isAscending
        ? $rawFavorites.filter(
            (f) =>
              f.name.toLowerCase().includes(query.toLowerCase()) ||
              f.folder_name.toLowerCase().includes(query.toLowerCase()) ||
              f.extra_name?.toLowerCase().includes(query.toLowerCase()) ||
              f.author?.toLowerCase().includes(query.toLowerCase()),
          )
        : $rawFavorites
            .filter(
              (f) =>
                f.name.toLowerCase().includes(query.toLowerCase()) ||
                f.folder_name.toLowerCase().includes(query.toLowerCase()) ||
                f.extra_name?.toLowerCase().includes(query.toLowerCase()) ||
                f.author?.toLowerCase().includes(query.toLowerCase()),
            )
            .toReversed(),
  );
  let searchResults: Record<string, Favorite[]> = $state({});
  let foundSources: string[] = $derived(
    Object.keys(searchResults).sort((a, b) => {
      if (a === $selectedSource) return -1;
      if (b === $selectedSource) return 1;
      return 0;
    }),
  );
  let collapsibles: Record<string, boolean> = $state({});
  let favoriteOpen: Favorite | null = $state(null);
  let isFavoriteOpen = $state(false);
  let showPopSearch = $state(false);
  let isDeleteOpen = $state(false);

  async function searchBySource(nowQuery: string, source: string) {
    delete searchResults[source];
    const results = await $downloadManager.search(nowQuery, source);
    if (nowQuery === query && results.length > 0) {
      searchResults[source] = results;
    }
  }

  async function search() {
    if (query === "") {
      isSearching = false;
      searchResults = {};
      return;
    }
    searchResults = {};
    showPopSearch = true;
    isSearching = true;
    if ($rawFavorites.length === 0) {
      refreshRawFavorites();
    }
    const nowQuery = query;
    for (let source of MANGASOURCES) {
      if (
        source.name === $selectedSource ||
        !$activatedSources.includes(source.name)
      )
        continue;
      searchBySource(nowQuery, source.name);
    }
    for (let source of COMICSOURCES) {
      if (
        source.name === $selectedSource ||
        !$activatedSources.includes(source.name)
      )
        continue;
      searchBySource(nowQuery, source.name);
    }
    for (let source of ANIMESOURCES) {
      if (
        source.name === $selectedSource ||
        !$activatedSources.includes(source.name)
      )
        continue;
      searchBySource(nowQuery, source.name);
    }
    if (!$activatedSources.includes($selectedSource)) {
      isSearching = false;
      return;
    }
    await searchBySource(nowQuery, $selectedSource);
    if (nowQuery === query) isSearching = false;
  }

  function isFavorite(favorite: Favorite) {
    return $rawFavorites.find(
      (f) => f.source_id === favorite.source_id && f.source === favorite.source,
    );
  }

  async function saveResult(result: Favorite) {
    if (isFavorite(result)) {
      const favorite = await FavoriteDB.getFavoriteBySource(
        result.source_id,
        result.source,
      );
      await FavoriteDB.deleteFavorite(favorite);
    } else {
      await FavoriteDB.createFavorite(result);
    }
    refreshRawFavorites();
    refreshLibrary();
    refreshFavorites();
  }

  onMount(async () => {
    version = await getVersion();
    appPath = await appDataDir();
    dlDir = await downloadDir();
    documentsPath = await documentDir();
  });
</script>

{#if favoriteOpen !== null}
  <AskDelete bind:open={isDeleteOpen} favorite={favoriteOpen} />
  {#if favoriteOpen?.type === "anime"}
    <WatchFavorite favorite={favoriteOpen} bind:open={isFavoriteOpen} />
  {:else}
    <ReadFavorite favorite={favoriteOpen} bind:open={isFavoriteOpen} />
  {/if}
{/if}
<div
  class={cn(
    "bg-sidebar/60 pointer-events-auto relative z-80! flex h-10 w-full translate-y-0 items-center justify-between pl-2 backdrop-blur-sm transition-all duration-300",
    page.route.id?.startsWith("/reader") &&
      $isFullscreen &&
      !$openMenuChapters &&
      "h-0 -translate-y-12",
  )}
  style="view-transition-name: titlebar"
  data-tauri-drag-region={!$isFullscreen}
>
  <div class="flex h-full items-center select-none">
    <img
      src="/square-icon.png"
      alt="logo"
      class="h-6 rounded-sm"
      data-tauri-drag-region={!$isFullscreen}
    />
    <Label class="z-20 p-3" data-tauri-drag-region={!$isFullscreen}>
      MangaYouKnow
    </Label>
    <Menubar.Root class="z-20">
      <Menubar.Menu>
        <Menubar.Trigger>Folders</Menubar.Trigger>
        <Menubar.Content class="z-51">
          <Menubar.Item
            class="pointer-events-auto"
            onclick={async () => {
              let path = "";
              if ($downloadPath === "Mangas/") {
                path = await join(dlDir, "Mangas");
              } else {
                path = $downloadPath;
              }
              if (await exists(path)) {
                openPath(path);
              } else {
                toast.warning("There's no downloadings");
              }
            }}
          >
            <Label>Downloads</Label>
            <Icon class="size-5!" icon="mingcute:folder-download-fill" />
          </Menubar.Item>
          <Menubar.Item
            class="pointer-events-auto"
            onclick={async () => {
              const pathToGo = await join(documentsPath, "favorite-panels");
              if (await exists(pathToGo)) {
                openPath(pathToGo);
              } else {
                toast.warning("There's no favorited panels");
              }
            }}
          >
            <Label>Panels</Label>
            <Icon class="size-5!" icon="ic:round-photo-library" />
          </Menubar.Item>
          <Menubar.Item
            class="pointer-events-auto"
            onclick={() => openPath(appPath)}
          >
            <Label>Appdata</Label>
            <Icon class="size-5!" icon="material-symbols:settings-rounded" />
          </Menubar.Item>
        </Menubar.Content>
      </Menubar.Menu>
      <Menubar.Menu>
        <Menubar.Trigger
          class={cn(page.route.id?.startsWith("/reader") && "hidden md:block")}
        >
          About
        </Menubar.Trigger>
        <Menubar.Content class="z-51">
          <Menubar.Item
            class="pointer-events-auto"
            onclick={() => openPatchNotes.set(true)}
          >
            <Label>Patch notes</Label>
            <Icon
              class="-my-0.5 size-6!"
              icon="material-symbols-light:stylus-note-rounded"
            />
          </Menubar.Item>
          <!--
          <Menubar.Item
            class="pointer-events-auto"
            onclick={() => openFeedback.set(true)}
          >
            <Label>Give feedback</Label>
            <Icon class="size-5!" icon="mdi:github" />
          </Menubar.Item> -->
          <Menubar.Item
            class="pointer-events-auto"
            onclick={() => openUrl("https://github.com/thiagovianav")}
          >
            <Label>Github</Label>
            <Icon class="size-5!" icon="mdi:github" />
          </Menubar.Item>
          <Menubar.Item
            class="pointer-events-auto"
            onclick={() => openUrl("https://discord.gg/bGrqtHsGgs")}
          >
            <Label>Discord</Label>
            <Icon class="size-5!" icon="ic:round-discord" />
          </Menubar.Item>
          <Menubar.Item
            class="pointer-events-auto"
            onclick={() =>
              openUrl("https://www.linkedin.com/in/thiagovianavargas/")}
          >
            <Label>Linkedin</Label>
            <Icon class="size-5!" icon="streamline:linkedin-solid" />
          </Menubar.Item>
          <Menubar.Separator />
          <Menubar.Item class="pointer-events-none">
            <Label>
              Made by ReiLoko4 with: <br />
              <br />
              <span class="inline-flex items-center gap-1">
                <Icon icon="devicon-plain:tauri" /> Tauri &
                <Icon icon="devicon-plain:svelte" /> SvelteKit &
              </span>
              <br />
              <span class="inline-flex items-center gap-1">
                <Icon class="size-3!" icon="simple-icons:shadcnui" /> Shadcnui for
                Svelte
              </span>
              <br />
              <br />
              Version -> v{version}
            </Label>
          </Menubar.Item>
        </Menubar.Content>
      </Menubar.Menu>
    </Menubar.Root>
    <Label
      class={cn(
        "dark!text-gray-400 ml-8 hidden text-nowrap underline select-none",
        downloadingCount > 0 && "block",
      )}
      data-tauri-drag-region={!$isFullscreen}
    >
      {downloadingCount} downloading...
    </Label>
  </div>
  <div
    class="z-10 flex w-full items-center justify-center"
    data-tauri-drag-region={!$isFullscreen}
  ></div>
  <div class="mt-0.5 inline-flex items-center justify-center gap-0.5 pr-1">
    <Button
      class="pointer-events-auto z-20 size-9 rounded-lg"
      variant="ghost"
      onclick={() => window.minimize()}
    >
      <Icon class="size-6!" icon="ic:round-minus" />
    </Button>
    <Button
      class="pointer-events-auto z-20 size-9 rounded-lg"
      variant="ghost"
      onclick={async () => {
        if ($isFullscreen) {
          await setFullscreen(false);
          return;
        }
        if (await window.isMaximized()) {
          await window.unmaximize();
        } else {
          await window.maximize();
        }
      }}
    >
      <Icon
        class="size-6!"
        icon={$isFullscreen
          ? "ic:round-fullscreen-exit"
          : $isMaximized
            ? "fluent:square-multiple-16-regular"
            : "fluent:square-12-regular"}
      />
    </Button>
    <Button
      class="pointer-events-auto z-20 size-9 rounded-lg transition-colors duration-300 hover:bg-red-900"
      variant="ghost"
      onclick={() => window.close()}
    >
      <Icon class="size-6!" icon="material-symbols:close-rounded" />
    </Button>
  </div>
</div>
