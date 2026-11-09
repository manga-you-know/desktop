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
    "bg-sidebar/60 backdrop-blur-sm flex items-center justify-between relative w-full pl-2 !z-[80] h-10 translate-y-0 pointer-events-auto transition-all duration-300",
    page.route.id?.startsWith("/reader") &&
      $isFullscreen &&
      !$openMenuChapters &&
      "h-0 -translate-y-[3rem]",
  )}
  data-tauri-drag-region
>
  <div class="h-full flex items-center select-none">
    <img
      src="/icon.png"
      alt="logo"
      class="h-6"
      data-tauri-drag-region={!$isFullscreen}
    />
    <Label
      class="p-3 pr-5 z-20 font-extrabold text-md"
      data-tauri-drag-region={!$isFullscreen}
    >
      MangaYouKnow
    </Label>
    <Menubar.Root class="z-20 *:font-semibold">
      <Menubar.Menu>
        <Menubar.Trigger>Folders</Menubar.Trigger>
        <Menubar.Content class="z-[51]">
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
            <Icon class="!size-5" icon="mingcute:folder-download-fill" />
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
            <Icon class="!size-5" icon="ic:round-photo-library" />
          </Menubar.Item>
          <Menubar.Item
            class="pointer-events-auto"
            onclick={() => openPath(appPath)}
          >
            <Label>Appdata</Label>
            <Icon class="!size-5" icon="material-symbols:settings-rounded" />
          </Menubar.Item>
        </Menubar.Content>
      </Menubar.Menu>
      <Menubar.Menu>
        <Menubar.Trigger
          class={cn(page.route.id?.startsWith("/reader") && "hidden md:block")}
          >About</Menubar.Trigger
        >
        <Menubar.Content class="z-[51]">
          <Menubar.Item
            class="pointer-events-auto"
            onclick={() => openUrl("https://github.com/thiagovianav")}
          >
            <Label>Github</Label>
            <Icon class="!size-5" icon="mdi:github" />
          </Menubar.Item>
          <Menubar.Item
            class="pointer-events-auto"
            onclick={() => openUrl("https://discord.gg/uSxTyUwdQY")}
          >
            <Label>Discord</Label>
            <Icon class="!size-5" icon="ic:round-discord" />
          </Menubar.Item>
          <Menubar.Item
            class="pointer-events-auto"
            onclick={() =>
              openUrl("https://www.linkedin.com/in/thiagovianavargas/")}
          >
            <Label>Linkedin</Label>
            <Icon class="!size-5" icon="streamline:linkedin-solid" />
          </Menubar.Item>
          <Menubar.Separator />
          <Menubar.Item class="pointer-events-none">
            <Label>
              by Thiago Viana Vargas <br /> with: <br /><br />
              <span class="inline-flex items-center gap-1">
                <Icon icon="devicon-plain:tauri" /> Tauri &
                <Icon icon="devicon-plain:svelte" /> SvelteKit &
              </span>
              <br />
              <span class="inline-flex items-center gap-1">
                <Icon class="!size-3" icon="simple-icons:shadcnui" /> Shadcnui for
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
        "ml-8 dark!text-gray-400 hidden underline select-none text-nowrap",
        downloadingCount > 0 && "block",
      )}
      data-tauri-drag-region={!$isFullscreen}
      >{downloadingCount} downloading...
    </Label>
  </div>
  <div
    class="w-full flex justify-center z-10 items-center"
    data-tauri-drag-region={!$isFullscreen}
  ></div>
  <div class="inline-flex justify-center items-center gap-0.5 mt-0.5 pr-1">
    <Button
      class="size-9 z-20 rounded-lg pointer-events-auto"
      variant="ghost"
      onclick={() => window.minimize()}
    >
      <Icon class="!size-5" icon="ic:round-minus" />
    </Button>
    <Button
      class="size-9 z-20 rounded-lg pointer-events-auto"
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
        class="!size-5"
        icon={$isFullscreen
          ? "ic:round-fullscreen-exit"
          : $isMaximized
            ? "fluent:square-multiple-16-regular"
            : "fluent:square-12-regular"}
      />
    </Button>
    <Button
      class="size-9 z-20 rounded-lg pointer-events-auto hover:bg-red-900 transition-colors duration-300"
      variant="ghost"
      onclick={() => window.close()}
    >
      <Icon class="!size-5" icon="material-symbols:close-rounded" />
    </Button>
  </div>
</div>
