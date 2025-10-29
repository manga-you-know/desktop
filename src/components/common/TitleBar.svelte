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
    "bg-sidebar/60 backdrop-blur-sm flex items-center justify-between relative w-full pl-2 z-80! h-10 translate-y-0 pointer-events-auto transition-all duration-300",
    page.route.id?.startsWith("/reader") &&
      $isFullscreen &&
      !$openMenuChapters &&
      "h-0 -translate-y-12",
  )}
  data-tauri-drag-region={!$isFullscreen}
>
  <div class="h-full flex items-center select-none">
    <img
      src="/square-icon.png"
      alt="logo"
      class="h-6 rounded-sm"
      data-tauri-drag-region={!$isFullscreen}
    />
    <Label class="p-3 z-20" data-tauri-drag-region={!$isFullscreen}>
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
          >About</Menubar.Trigger
        >
        <Menubar.Content class="z-51">
          <Menubar.Item
            class="pointer-events-auto"
            onclick={() => openPatchNotes.set(true)}
          >
            <Label>Patch notes</Label>
            <Icon
              class="size-6! -my-0.5"
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
            onclick={() => openUrl("https://github.com/ReiLoko4")}
          >
            <Label>Github</Label>
            <Icon class="size-5!" icon="mdi:github" />
          </Menubar.Item>
          <Menubar.Item
            class="pointer-events-auto"
            onclick={() => openUrl("https://discord.gg/EVqHFtP2r8")}
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
              Made by ReiLoko4 with: <br /><br />
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
  >
    <div
      class="absolute w-full h-full flex justify-center items-center pointer-events-none"
    >
      <button
        class="flex w-screen justify-center items-center transition-all pointer-events-none duration-500 gap-2 md:gap-3 xl:gap-10 ml-32 md:ml-12 lg:ml-0"
        onfocusout={() => {
          showSearch = false;
          if (query.length === 0) showPopSearch = false;
        }}
      >
        {#if page.route.id?.startsWith("/reader")}
          <Label
            class={cn(
              "select-none text-nowrap text-primary/70! z-3 max-w-0 overflow-x-hidden truncate transition-all duration-500",
              !(showSearch || showPopSearch || query.length > 0) &&
                "max-w-[40vw]",
            )}
            data-tauri-drag-region={!$isFullscreen}
          >
            {$extraTitle}
          </Label>
        {/if}
        <Popover.Root
          bind:open={showPopSearch}
          onOpenChange={refreshRawFavorites}
        >
          <Popover.Trigger
            class={cn(
              "outline-none focus:outline-none max-w-12 transition-all duration-500",
              (!page.route.id?.startsWith("/reader") ||
                showSearch ||
                query.length > 0) &&
                "max-w-152 px-2",
            )}
            onclick={() => {
              showSearch = true;
              const input = document.querySelector(
                `input[id="central-search"]`,
              ) as HTMLInputElement;
              input?.focus();
            }}
            onkeydown={(e) => {
              if (e.key === " " || e.code === "Space") {
                e.preventDefault();
                query += " ";
                search();
              }
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
            tabindex={-1}
          >
            <div
              class={cn(
                "flex items-center px-2 rounded-xl border border-secondary bg-background/30 hover:bg-secondary overflow-x-hidden",
                // (!page.route.id?.startsWith("/reader") ||
                //   showSearch ||
                //   query.length > 0) &&
                //   "ml-32 md:ml-12 lg:ml-0",
              )}
            >
              <Icon
                class="size-5! text-primary pointer-events-auto"
                icon={isSearching
                  ? "eos-icons:bubble-loading"
                  : query.length > 0
                    ? "lucide:x"
                    : "mingcute:search-2-fill"}
                onclick={() => {
                  query = "";
                  searchResults = {};
                  isSearching = false;
                  const input = document.querySelector(
                    `input[id="central-search"]`,
                  ) as HTMLInputElement;
                  input?.focus();
                }}
              />
              <Input
                class={cn(
                  "w-[20vw] sm:w-[30vw] md:w-[32vw] lg:w-[40vw] h-8 pointer-events-auto max-w-[0] px-0 outline-none border-none transition-all duration-300",
                  (!page.route.id?.startsWith("/reader") ||
                    showSearch ||
                    query.length > 0) &&
                    "max-w-132 px-2",
                )}
                id="central-search"
                bind:value={query}
                oninput={search}
                variant="link"
                placeholder="Search..."
              />
            </div>
          </Popover.Trigger>
          <Popover.Content
            class={cn(
              "max-w-142 w-[42.5vw] h-56 p-1 rounded-xl transition-all duration-300 backdrop-blur-sm transition-all overflow-x-hidden overflow-y-scroll scrollbar",
              // libraryResults.length > 0 && "min-h-32",
            )}
            trapFocus={false}
          >
            <!--   <div class="flex flex-col overflow-x-hidden scrollbar"> -->
            {#if libraryResults.length === 0 && foundSources.length === 0}
              <Badge class="flex items-center w-full h-6 rounded-lg"
                >{query === ""
                  ? "Type anything..."
                  : isSearching
                    ? "Searching..."
                    : "No results found."}</Badge
              >
            {/if}
            {#if libraryResults.length > 0}
              <Button
                class="w-full h-6 flex justify-between items-center rounded-lg p-2 focus:outline-none"
                variant="ghost"
                onclick={() => {
                  if (collapsibles["library"] !== undefined) {
                    collapsibles["library"] = !collapsibles["library"];
                  } else {
                    collapsibles["library"] = true;
                  }
                }}
              >
                <Label
                  class="flex items-center gap-2 cursor-pointer text-primary/80!"
                  >Library <Badge class="h-5 flex justify-center px-1"
                    >{libraryResults.length}</Badge
                  >
                </Label>
                <Icon
                  class={cn(
                    "mr-4 transition-all duration-300",
                    collapsibles["library"] && "rotate-180",
                  )}
                  icon="lucide:chevron-down"
                />
              </Button>
              <VList
                class={cn(
                  "max-h-35 mr-2 transition-transform scrollbar [&::-webkit-scrollbar]:w-2 overflow-y-scroll!",
                  libraryResults.length === 1 && "max-h-7",
                  libraryResults.length === 2 && "max-h-14",
                  libraryResults.length === 3 && "max-h-21",
                  libraryResults.length === 4 && "max-h-28",
                  collapsibles["library"] && "hidden!",
                )}
                data={libraryResults}
                getKey={(_, i) => i}
                tabindex={-1}
              >
                {#snippet children(result, _)}
                  <div
                    class="w-full h-7 inline-flex transition-all duration-300 overflow-hidden"
                  >
                    <Button
                      class="h-7 w-full flex truncate justify-between rounded-l-xl rounded-r-none"
                      variant="ghost"
                      onclick={() => {
                        const toOpen = isFavorite(result);
                        favoriteOpen = toOpen ? toOpen : result;
                        isFavoriteOpen = true;
                        showPopSearch = false;
                      }}
                    >
                      {result.name}
                    </Button>
                    <Tooltip
                      text={getBool(result.is_ultra_favorite)
                        ? "Remove favorite"
                        : "Add favorite"}
                    >
                      <Button
                        class="size-7 rounded-none relative"
                        variant="ghost"
                        onclick={async () => {
                          result.is_ultra_favorite = !getBool(
                            result.is_ultra_favorite,
                          );
                          result.is_ultra_favorite =
                            await FavoriteDB.toggleUltraFavorite(result);
                          refreshRawFavorites();
                        }}
                      >
                        <Icon
                          class={cn(
                            "absolute left-2 transition-all duration-400",
                            getBool(result.is_ultra_favorite) &&
                              "opacity-0 scale-0 rotate-180",
                          )}
                          icon="heroicons:star"
                        />
                        <Icon
                          class={cn(
                            "absolute left-2 transition-all duration-400",
                            !getBool(result.is_ultra_favorite) &&
                              "opacity-0 scale-0 -rotate-180",
                          )}
                          icon="heroicons:star-solid"
                        />
                      </Button>
                    </Tooltip>
                    <Tooltip text="Delete">
                      <Button
                        class="size-7 rounded-l-none rounded-r-xl"
                        variant="ghost"
                        onclick={() => {
                          const toOpen = isFavorite(result);
                          favoriteOpen = toOpen ? toOpen : result;
                          isDeleteOpen = true;
                          showPopSearch = false;
                        }}><Icon icon="lucide:x" /></Button
                      >
                    </Tooltip>
                  </div>
                {/snippet}
              </VList>
            {/if}
            {#if foundSources.length > 0}
              {#each foundSources as source (source)}
                {#if $activatedSources.includes(source)}
                  <Button
                    class="w-full h-6 flex justify-between items-center rounded-lg p-2 focus:outline-none"
                    variant="ghost"
                    onclick={() => {
                      if (collapsibles[source] !== undefined) {
                        collapsibles[source] = !collapsibles[source];
                      } else {
                        collapsibles[source] = true;
                      }
                    }}
                  >
                    <Label
                      class="flex items-center gap-2 cursor-pointer text-primary/80!"
                      >{source}
                      <Badge class="h-5 flex justify-center px-1"
                        >{searchResults[source].length}</Badge
                      >
                    </Label>
                    <Icon
                      class={cn(
                        "mr-4 transition-all duration-300",
                        collapsibles[source] && "rotate-180",
                      )}
                      icon="lucide:chevron-down"
                    />
                  </Button>
                  <VList
                    class={cn(
                      "max-h-28 transition-transform scrollbar [&::-webkit-scrollbar]:w-2 overflow-y-scroll!",
                      searchResults[source].length === 1 && "max-h-7",
                      searchResults[source].length === 2 && "max-h-14",
                      searchResults[source].length === 3 && "max-h-21",
                      collapsibles[source] && "hidden!",
                    )}
                    data={searchResults[source]}
                    getKey={(_, i) => i}
                    tabindex={-1}
                  >
                    {#snippet children(result, _)}
                      <div
                        class="w-full h-7 inline-flex transition-all duration-300 overflow-hidden"
                      >
                        <Button
                          class="h-7 w-full flex truncate justify-between rounded-l-xl rounded-r-none"
                          variant="ghost"
                          onclick={() => {
                            const toOpen = isFavorite(result);
                            favoriteOpen = toOpen ? toOpen : result;
                            isFavoriteOpen = true;
                            showPopSearch = false;
                          }}
                        >
                          {result.name}
                        </Button>
                        <Tooltip
                          text={isFavorite(result)
                            ? "Remove saved"
                            : "Save to library"}
                        >
                          <Button
                            class="w-10 h-7 rounded-l-none rounded-r-xl"
                            variant="ghost"
                            onclick={() => saveResult(result)}
                            ><Icon
                              icon={isFavorite(result)
                                ? "tabler:bookmark-filled"
                                : "tabler:bookmark"}
                            />
                          </Button>
                        </Tooltip>
                      </div>
                    {/snippet}
                  </VList>
                {/if}
              {/each}
            {/if}
            <!-- </div> -->
            <!-- <ScrollArea class="flex flex-col max-h-40 select-none"> -->
            <!--   {#if libraryResults.length > 0} -->
            <!--     <Button -->
            <!--       class="w-full h-6 flex justify-between items-center p-2 focus:outline-none" -->
            <!--       variant="link" -->
            <!--       onclick={() => { -->
            <!--         if (collapsibles["library"] !== undefined) { -->
            <!--           collapsibles["library"] = !collapsibles["library"]; -->
            <!--         } else { -->
            <!--           collapsibles["library"] = true; -->
            <!--         } -->
            <!--       }} -->
            <!--     > -->
            <!--       <Label -->
            <!--         class="flex items-center gap-2 cursor-pointer text-primary/80!" -->
            <!--         >Library <Badge class="flex justify-center px-2 " -->
            <!--           >{libraryResults.length}</Badge -->
            <!--         > -->
            <!--       </Label> -->
            <!--       <Icon -->
            <!--         class={cn( -->
            <!--           "mr-4 transition-all duration-300", -->
            <!--           collapsibles["library"] && "rotate-180", -->
            <!--         )} -->
            <!--         icon="lucide:chevron-down" -->
            <!--       /> -->
            <!--     </Button> -->
            <!---->
            <!--   {/if} -->
            <!--   {#if foundSources.length > 0} -->
            <!--     {#each foundSources as source (source)} -->
            <!--       {#each searchResults[source] as result (result.source_id + result.source)}{/each} -->
            <!--     {/each} -->
            <!--   {/if} -->
            <!-- </ScrollArea> -->
          </Popover.Content>
        </Popover.Root>
      </button>
      <div class="w-[calc(2.25rem*3+0.25rem)]"></div>
    </div>
    <!-- {#if favoritesWithChapters.length > 0 && page.route.id?.startsWith("/reader")} -->
    <!--   <div -->
    <!--     bind:this={divFavs} -->
    <!--     onwheel={(e) => { -->
    <!--       const scrollLeft = divFavs.scrollLeft; -->
    <!--       if (e.deltaY < 0) { -->
    <!--         divFavs.scroll({ left: scrollLeft - 50, behavior: "smooth" }); -->
    <!--       } else { -->
    <!--         divFavs.scrollTo({ left: scrollLeft + 50, behavior: "smooth" }); -->
    <!--       } -->
    <!--     }} -->
    <!--     class="flex max-w-36! md:max-w-52! lg:max-w-96! 2xl:max-w-120! 2xl:ml-16! transition-all duration-400 overflow-x-scroll overflow-y-hidden bg-background/30 rounded-xl border border-secondary [&::-webkit-scrollbar]:size-0 [&::-webkit-scrollbar-thumb]:bg-transparent" -->
    <!--   > -->
    <!--     {#each favoritesWithChapters as fav} -->
    <!--       {#if fav.self.id.toString() !== page.params?.favoriteId} -->
    <!--         <Tooltip class="font-bold" text={fav.self.name} delay={200}> -->
    <!--           <Button -->
    <!--             class="w-10 h-8 rounded-xl" -->
    <!--             variant="link" -->
    <!--             onclick={() => { -->
    <!--               openMenuChapters.set(false); -->
    <!--               globalChapters.set(fav.chapters); -->
    <!--               goto( -->
    <!--                 `/reader/${fav.self.id}/${$globalChapters.indexOf( -->
    <!--                   fav.nextChapter ?? fav.chapters[0], -->
    <!--                 )}`, -->
    <!--               ); -->
    <!--             }} -->
    <!--           > -->
    <!--             {fav?.nextChapter?.number} -->
    <!--           </Button> -->
    <!--         </Tooltip> -->
    <!--       {/if} -->
    <!--     {/each} -->
    <!--   </div> -->
    <!-- {/if} -->
  </div>
  <div class="inline-flex justify-center items-center gap-0.5 mt-0.5 pr-1">
    <Button
      class="size-9 z-20 rounded-lg pointer-events-auto"
      variant="ghost"
      onclick={() => window.minimize()}
    >
      <Icon class="size-6!" icon="ic:round-minus" />
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
        class="size-6!"
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
      <Icon class="size-6!" icon="material-symbols:close-rounded" />
    </Button>
  </div>
</div>
