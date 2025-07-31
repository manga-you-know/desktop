<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { Badge } from "svelte-ux";
  import { Tooltip } from "@/components";
  import {
    Sidebar,
    Label,
    Avatar,
    Separator,
    ScrollArea,
    Button,
  } from "@/lib/components";
  import {
    openSearch,
    openSettings,
    openAdd,
    openTag,
    openDownloads,
    favoritesLoaded,
    theme,
    openInfo,
    customTitlebar,
    globalChapters,
    chaptersCache,
    downloadManager,
    preferableLanguage,
    keepReading,
  } from "@/store";
  import Icon from "@iconify/svelte";
  import type { Downloading, FavoriteLoaded } from "@/types";
  import { useSidebar } from "@/lib/components/ui/sidebar";
  import { IS_MOBILE } from "@/constants";
  import { refreshCache, removeCache, saveSettings } from "@/functions";
  import { cn } from "@/lib/utils";
  import { toast } from "svelte-sonner";
  import { ReadedDB } from "@/repositories";
  import { get } from "svelte/store";
  import { onMount } from "svelte";

  const items = [
    {
      name: "Home",
      path: "/home",
      iconActive: "heroicons:home-20-solid",
      icon: "heroicons:home",
    },
    {
      name: "Favorites",
      path: "/favorites",
      iconActive: "heroicons:star-solid",
      icon: "heroicons:star",
    },
    {
      name: "Library",
      path: "/library",
      iconActive: "material-symbols:book-ribbon-rounded",
      icon: "material-symbols:book-ribbon-outline-rounded",
    },
    {
      name: "Panels",
      path: "/panels",
      iconActive: "ion:images",
      icon: "ion:images-outline",
    },
    // {
    //   name: "Search",
    //   path: "/search",
    //   iconActive: "mingcute:search-fill",
    //   icon: "mingcute:search-line",
    // },
    // {
    //   name: "Settings",
    //   path: "/settings",
    //   iconActive: "heroicons:cog-6-tooth-solid",
    //   icon: "heroicons:cog-6-tooth",
    // },
  ];

  let rotation: number = 0;
  let imgElement: HTMLImageElement | null = null;
  let isAnimating: boolean = false;
  let favoritesWithChapters: FavoriteLoaded[] = $derived(
    Object.values($favoritesLoaded).filter((fv) =>
      fv.nextChapter !== null ? 1 : 0,
    ),
  );

  function rotateImage(): void {
    if (isAnimating) return;
    isAnimating = true;

    let start: number | null = null;
    const totalRotation = 4 * 360;
    const duration = 1000;

    function animate(timestamp: number): void {
      if (start === null) start = timestamp;
      let progress: number = timestamp - start;

      let degrees: number = Math.min(
        (progress / duration) * totalRotation,
        totalRotation,
      );
      if (imgElement) {
        imgElement.style.transform = `rotate(${rotation + degrees}deg)`;
      }

      if (degrees < totalRotation) {
        requestAnimationFrame(animate);
      } else {
        rotation += totalRotation;
        isAnimating = false;
      }
    }

    requestAnimationFrame(animate);
  }

  let { variant }: { variant: "sidebar" | "inset" | "floating" } = $props();
  onMount(() => refreshCache());

  const sidebar = useSidebar();
</script>

<Sidebar.Root
  class={cn("bg-sidebar  px-[2.5px] pb-0 border-0", $customTitlebar && "pt-7")}
  {variant}
  side="left"
  collapsible="icon"
>
  <Sidebar.Header class="px-0">
    <Sidebar.Group>
      <!-- <Sidebar.GroupLabel>Pages</Sidebar.GroupLabel> -->
      <Sidebar.GroupContent>
        <Sidebar.Menu class="flex flex-col gap-2 relative">
          <Sidebar.MenuButton
            class={cn(
              "absolute transition-translate duration-300",
              page.url.pathname === "/home" && "translate-y-0",
              page.url.pathname === "/favorites" && "translate-y-12",
              page.url.pathname === "/library" && "translate-y-24",
              page.url.pathname === "/panels" && "translate-y-36",
            )}
            variant="secondary"
          />
          {#each items as item (item.name)}
            <Sidebar.MenuItem class="!min-w-16">
              <Sidebar.MenuButton
                class={cn(
                  "bg-transparent",
                  page.url.pathname === item.path &&
                    "hover:ring-2 hover:ring-primary/90 hover:ring-offset-2",
                )}
                variant={page.url.pathname === item.path
                  ? "secondary"
                  : "default"}
                onclick={(e) => {
                  e.currentTarget.blur();
                  goto(item.path);
                }}
                tabindex={-1}
              >
                {#if item.path !== "/favorites" || favoritesWithChapters.length === 0}
                  <Icon
                    class="!size-7 -ml-[10px]"
                    icon={page.url.pathname === item.path
                      ? item.iconActive
                      : item.icon}
                  />
                {:else}
                  <Badge
                    class={cn(
                      page.url.pathname === item.path
                        ? "bg-sidebar text-primary"
                        : "bg-primary text-sidebar",
                    )}
                    value={favoritesWithChapters.length}
                    small
                  >
                    <Icon
                      icon={page.url.pathname === item.path
                        ? item.iconActive
                        : item.icon}
                      class="!size-7 -ml-[10px]"
                    />
                  </Badge>
                {/if}
                <Label
                  class={cn(
                    "cursor-pointer transition-all",
                    page.url.pathname === item.path && "!text-sidebar",
                  )}>{item.name}</Label
                >
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          {/each}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  </Sidebar.Header>
  <Separator class="bg-secondary w-[95%]" />
  <Sidebar.Content
    class="group-data-[collapsible=icon]:overflow-y-auto scrollbar group-data-[collapsible=icon]:[&::-webkit-scrollbar]:w-0.5 [&::-webkit-scrollbar]:w-2"
  >
    <Sidebar.Group>
      <Sidebar.GroupContent>
        <Sidebar.Menu class="flex flex-col gap-2">
          <Sidebar.MenuItem>
            <Sidebar.MenuButton
              variant={$openSearch ? "secondary" : "default"}
              onclick={(e) => {
                e.currentTarget.blur();
                openSearch.set(true);
                openTag.set(false);
                openDownloads.set(false);
                openSettings.set(false);
                openAdd.set(false);
                openInfo.set(false);
                if (IS_MOBILE) sidebar.toggle();
              }}
              tabindex={-1}
            >
              <Icon
                icon={$openSearch
                  ? "mingcute:search-3-fill"
                  : "mingcute:search-3-line"}
                class="!size-7 -ml-[10px]"
              />
              <Label
                class={cn(
                  "cursor-pointer transition-all",
                  $openSearch && "!text-sidebar",
                )}
              >
                Search
              </Label>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton
              variant={$openTag ? "secondary" : "default"}
              onclick={(e) => {
                e.currentTarget.blur();
                openSearch.set(false);
                openTag.set(true);
                openInfo.set(false);
                openAdd.set(false);
                openSettings.set(false);
                openDownloads.set(false);
                if (IS_MOBILE) sidebar.toggle();
              }}
              tabindex={-1}
            >
              <Icon
                class="!size-7 -ml-[10px]"
                icon={$openTag ? "ion:bookmarks" : "ion:bookmarks-outline"}
              />
              <Label
                class={cn(
                  "cursor-pointer transition-all",
                  $openTag && "!text-sidebar",
                )}>Tags</Label
              >
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
          <Sidebar.MenuItem class="hidden">
            <Sidebar.MenuButton
              onclick={(e) => {
                e.currentTarget.blur();
                openSearch.set(false);
                openTag.set(false);
                openSettings.set(false);
                openAdd.set(true);
                openInfo.set(false);
                openDownloads.set(false);
                if (IS_MOBILE) sidebar.toggle();
              }}
              tabindex={-1}
            >
              <Icon
                icon={$openAdd ? "typcn:plus" : "typcn:plus-outline"}
                class="!size-7 -ml-[2px] "
              />
              <Label
                class={cn(
                  "cursor-pointer transition-all",
                  $openAdd && "!text-sidebar",
                )}>Add</Label
              >
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
    <Sidebar.Group>
      <Sidebar.GroupContent class="flex flex-col gap-2">
        {#if $chaptersCache.length > 0 && $keepReading}
          <Sidebar.Menu
            class="bg-background/30 rounded-xl border border-background"
          >
            <Sidebar.MenuItem
              class={cn(
                "max-h-56 smh:max-h-40 transition-all overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar-thumb]:bg-transparent rounded-xl",
                favoritesWithChapters.length === 0 && "max-h-88 smh:max-h-96",
              )}
            >
              <ScrollArea class="gap-0">
                {#each $chaptersCache as cache}
                  <Tooltip
                    class="h-7 font-bold items-center flex -ml-1 "
                    text={`${cache?.currentPage}/${cache?.totalPage} ~ ${cache?.chapter?.number} # ${cache?.favorite.name}`}
                    placement="right"
                    delay={200}
                  >
                    <Sidebar.MenuButton
                      class="rounded-md group-data-[collapsible=icon]:!h-4 !h-4 hover:bg-transparent hover:underline relative group/cache"
                      onclick={async () => {
                        if (cache.chapters.length === 0) {
                          toast.loading("Loading chapters...", {
                            duration: 200,
                          });
                          let chapters = [];
                          const isMulti = $downloadManager.isMultiLanguage(
                            cache.favorite.source,
                          );
                          if (isMulti) {
                            const lastReaded = await ReadedDB.getLastReaded(
                              cache.favorite,
                            );
                            if (lastReaded) {
                              chapters = await $downloadManager.getChapters(
                                cache.favorite,
                                lastReaded.language,
                              );
                            } else {
                              chapters = await $downloadManager.getChapters(
                                cache.favorite,
                                get(preferableLanguage).id,
                              );
                            }
                            if (chapters.length === 0) {
                              const languages =
                                await $downloadManager.getFavoriteLanguages(
                                  cache.favorite,
                                );
                              chapters = await $downloadManager.getChapters(
                                cache.favorite,
                                languages[0].id,
                              );
                            }
                          } else {
                            chapters = await $downloadManager.getChapters(
                              cache.favorite,
                            );
                          }
                          cache.chapters = chapters;
                        }
                        globalChapters.set(cache.chapters);
                        const chapter = $globalChapters.find(
                          (c) => c.chapter_id === cache.chapter.chapter_id,
                        );
                        goto(
                          `/reader/${cache.favorite.id}/${$globalChapters.indexOf(
                            chapter ?? $globalChapters[0],
                          )}`,
                        );
                      }}
                    >
                      <Label
                        class="w-2 mr-3 flex justify-center cursor-pointer"
                      >
                        {cache.chapter?.number ?? ""}
                      </Label>
                      <Label class="cursor-pointer truncate">
                        {cache.favorite.name}
                      </Label>
                      <Button
                        class="absolute size-0 m-0 p-0 group-hover/cache:size-5 top-0 -left-2 group-hover/cache:-left-1 group-hover/cache:p-2 rounded-full transition-all duration-300"
                        variant="outline"
                        onclick={async (e) => {
                          e.stopPropagation();
                          await removeCache(cache.favorite.id.toString());
                          toast.info("Chapter cache removed!");
                        }}
                      >
                        <Icon
                          class="group-hover/cache:!size-4"
                          icon="lucide:x"
                        />
                      </Button>
                    </Sidebar.MenuButton>
                  </Tooltip>
                {/each}
              </ScrollArea>
            </Sidebar.MenuItem>
          </Sidebar.Menu>
        {/if}

        {#if favoritesWithChapters.length > 0}
          <Sidebar.Menu
            class="bg-background/30 rounded-xl border border-primary"
          >
            <Sidebar.MenuItem
              class={cn(
                "max-h-56 smh:max-h-40 transition-all overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar-thumb]:bg-transparent rounded-xl",
                ($chaptersCache.length === 0 || !$keepReading) &&
                  "max-h-88 smh:max-h-96",
              )}
            >
              <ScrollArea class="gap-0">
                {#each favoritesWithChapters as fav}
                  <Tooltip
                    class="h-7 font-bold items-center flex -ml-1 "
                    text={fav.self.name}
                    placement="right"
                    delay={200}
                  >
                    <Sidebar.MenuButton
                      class="group-data-[collapsible=icon]:!h-4 !h-4 hover:bg-transparent hover:underline"
                      onclick={() => {
                        globalChapters.set(fav.chapters);
                        goto(
                          `/reader/${fav.self.id}/${$globalChapters.indexOf(
                            fav.nextChapter ?? fav.chapters[0],
                          )}`,
                        );
                      }}
                    >
                      <Label
                        class="w-2 mr-3 flex justify-center cursor-pointer"
                      >
                        {fav?.nextChapter?.number ?? ""}
                      </Label>
                      <Label class="cursor-pointer truncate">
                        {fav.self.name}
                      </Label>
                    </Sidebar.MenuButton>
                  </Tooltip>
                {/each}
              </ScrollArea>
            </Sidebar.MenuItem>
          </Sidebar.Menu>
        {/if}
      </Sidebar.GroupContent>
    </Sidebar.Group>
  </Sidebar.Content>
  <Sidebar.Group>
    <Sidebar.GroupContent>
      <Sidebar.Menu
        class="flex flex-row-reverse justify-center gap-1 transition-[gap] duration-300 ease-in-out
	       group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-2"
      >
        <!-- <Sidebar.MenuItem>
          <Sidebar.MenuButton
            class="size-10"
            variant={$openInfo ? "secondary" : "default"}
            onclick={(e) => {
              e.currentTarget.blur();
              openSearch.set(false);
              openTag.set(false);
              openSettings.set(false);
              openAdd.set(false);
              openInfo.set(true);
              openDownloads.set(false);
              if (IS_MOBILE) sidebar.toggle();
            }}
            tabindex={-1}
          >
            <Icon
              icon={$openInfo
                ? "material-symbols:info-rounded"
                : "material-symbols:info-outline-rounded"}
              class="!size-7 -ml-[10px]"
            />
            <Label class={cn("cursor-pointer transition-all", $openInfo && "!text-sidebar")}>Info</Label>
          </Sidebar.MenuButton>
        </Sidebar.MenuItem> -->
        <Sidebar.MenuItem>
          <Sidebar.MenuButton
            class="size-10"
            variant={$openSettings ? "secondary" : "default"}
            onclick={(e) => {
              e.currentTarget.blur();
              openSearch.set(false);
              openTag.set(false);
              openSettings.set(true);
              openAdd.set(false);
              openInfo.set(false);
              openDownloads.set(false);
              if (IS_MOBILE) sidebar.toggle();
            }}
            tabindex={-1}
          >
            <Icon
              icon={$openSettings
                ? "heroicons:cog-6-tooth-solid"
                : "heroicons:cog-6-tooth"}
              class="!size-7 -ml-[10px]"
            />
            <Label
              class={cn(
                "cursor-pointer transition-all",
                $openSettings && "!text-sidebar",
              )}
            >
              Settings
            </Label>
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
        <Sidebar.MenuItem class="group-data-[collapsible=icon]:ssmh:hidden">
          <Sidebar.MenuButton
            class="size-10"
            onclick={(e) => {
              e.currentTarget.blur();
              $theme = $theme === "dark" ? "light" : "dark";
              saveSettings();
            }}
            tabindex={-1}
          >
            <Icon
              icon={$theme === "dark"
                ? "material-symbols:sunny-outline-rounded"
                : "material-symbols:dark-mode-outline"}
              class="!size-7 -ml-[10px]"
            />
            <Label class="cursor-pointer">Theme</Label>
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
      </Sidebar.Menu>
    </Sidebar.GroupContent>
  </Sidebar.Group>
  <Sidebar.Footer class="flex items-center overflow-hidden mt-0 ssmh:-mt-3">
    <!-- <Avatar  src="/icon.png" fallbackText="MYK" /> -->
    <Sidebar.MenuItem>
      <Sidebar.MenuButton
        onclick={rotateImage}
        onwheel={rotateImage}
        class="hover:bg-transparent"
      >
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <img
          bind:this={imgElement}
          class="min-w-9 max-w-9 -ml-[14px]"
          draggable={false}
          src="/icon.png"
          alt="icon"
        />
        <Label class="text-nowrap cursor-pointer">漫画君知る</Label>
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  </Sidebar.Footer>
</Sidebar.Root>
