<script lang="ts">
  import { goto, preloadData } from "$app/navigation";
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
    sidebarSide,
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
  import { themeMode } from "@/states";

  const items = [
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
      name: "Search",
      path: "/search",
      iconActive: "mingcute:search-3-fill",
      icon: "mingcute:search-3-line",
    },
    {
      name: "Panels",
      path: "/panels",
      iconActive: "ion:images",
      icon: "ion:images-outline",
    },
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
  class={cn("border-0 px-0 pb-0", $customTitlebar && "pt-7")}
  style="view-transition-name: sidebar"
  {variant}
  side={$sidebarSide}
  collapsible="icon"
>
  <Sidebar.Header class="px-0 group-data-[side=left]:-ml-[2px]">
    <Sidebar.Group>
      <!-- <Sidebar.GroupLabel>Pages</Sidebar.GroupLabel> -->
      <Sidebar.GroupContent>
        <Sidebar.Menu class="relative flex flex-col gap-2">
          <Sidebar.MenuButton
            class={cn(
              "transition-translate absolute duration-300",
              page.url.pathname === "/favorites" && "translate-y-0",
              page.url.pathname === "/library" && "translate-y-14",
              page.url.pathname === "/search" && "translate-y-28",
              page.url.pathname === "/panels" && "translate-y-42",
            )}
            variant="secondary"
          />
          {#each items as item (item.name)}
            <Sidebar.MenuItem class="min-w-16!">
              <Sidebar.MenuButton
                class={cn(
                  "parent bg-transparent transition-all",
                  page.url.pathname === item.path &&
                    "hover:ring-primary/90 hover:ring-2 hover:ring-offset-2",
                )}
                variant={page.url.pathname === item.path
                  ? "secondary"
                  : "default"}
                onclick={(e) => {
                  e.currentTarget.blur();
                  goto(item.path);
                }}
                onmouseenter={() => preloadData(item.path)}
                tabindex={-1}
              >
                {#if item.path !== "/favorites" || favoritesWithChapters.length === 0}
                  <Icon
                    class={cn(
                      "-ml-[10px] size-7! transition-transform duration-500",
                      item.path === "/favorites" &&
                        page.url.pathname === item.path &&
                        "rotate-[calc(145deg*2)]",
                    )}
                    icon={page.url.pathname === item.path
                      ? item.iconActive
                      : item.icon}
                  />
                {:else}
                  <Badge
                    class={cn(
                      "fixed -mt-8 ml-2.5",
                      page.url.pathname === item.path
                        ? "bg-sidebar text-primary"
                        : "bg-primary text-sidebar",
                    )}
                    value={favoritesWithChapters.length}
                    small
                  >
                    <Icon
                      class={cn(
                        "-ml-[10px] size-7! transition-transform duration-400",
                        page.url.pathname === item.path &&
                          "rotate-[calc(145deg*2)]",
                      )}
                      icon={page.url.pathname === item.path
                        ? item.iconActive
                        : item.icon}
                    />
                  </Badge>
                {/if}
                <Label
                  class={cn(
                    "cursor-pointer transition-all",
                    page.url.pathname === item.path && "text-sidebar!",
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
    class="scrollbar -ml-[2px] group-data-[collapsible=icon]:overflow-y-auto [&::-webkit-scrollbar]:w-2 group-data-[collapsible=icon]:[&::-webkit-scrollbar]:w-0.5"
  >
    <Sidebar.Group>
      <Sidebar.GroupContent>
        <Sidebar.Menu class="flex flex-col gap-2">
          <!-- <Sidebar.MenuItem> -->
          <!--   <Sidebar.MenuButton -->
          <!--     variant={$openSearch ? "secondary" : "default"} -->
          <!--     onclick={(e) => { -->
          <!--       e.currentTarget.blur(); -->
          <!--       openSearch.set(true); -->
          <!--       openTag.set(false); -->
          <!--       openDownloads.set(false); -->
          <!--       openSettings.set(false); -->
          <!--       openAdd.set(false); -->
          <!--       openInfo.set(false); -->
          <!--       if (IS_MOBILE) sidebar.toggle(); -->
          <!--     }} -->
          <!--     tabindex={-1} -->
          <!--   > -->
          <!--     <Icon -->
          <!--       icon={$openSearch -->
          <!--         ? "mingcute:search-3-fill" -->
          <!--         : "mingcute:search-3-line"} -->
          <!--       class="size-7! -ml-[10px]" -->
          <!--     /> -->
          <!--     <Label -->
          <!--       class={cn( -->
          <!--         "cursor-pointer transition-all", -->
          <!--         $openSearch && "text-sidebar!", -->
          <!--       )} -->
          <!--     > -->
          <!--       Search -->
          <!--     </Label> -->
          <!--   </Sidebar.MenuButton> -->
          <!-- </Sidebar.MenuItem> -->
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
                class="-ml-[10px] size-7!"
                icon={$openTag ? "ion:bookmarks" : "ion:bookmarks-outline"}
              />
              <Label
                class={cn(
                  "cursor-pointer transition-all",
                  $openTag && "text-sidebar!",
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
                class="-ml-[2px] size-7! "
              />
              <Label
                class={cn(
                  "cursor-pointer transition-all",
                  $openAdd && "text-sidebar!",
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
            class="bg-background/30 border-primary rounded-xl border"
          >
            <Sidebar.MenuItem
              class={cn(
                "smh:max-h-40 max-h-56 overflow-x-hidden overflow-y-auto rounded-xl transition-all [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar-thumb]:bg-transparent",
                favoritesWithChapters.length === 0 && "smh:max-h-96 max-h-88",
              )}
            >
              <ScrollArea class="gap-0">
                {#each $chaptersCache as cache}
                  <Tooltip
                    class="-ml-1 flex h-7 items-center font-bold "
                    text={`${cache?.currentPage}/${cache?.totalPage} ~ ${cache?.chapter?.number} # ${cache?.favorite.name}`}
                    placement="right"
                    delay={200}
                  >
                    <Sidebar.MenuButton
                      class="group/cache relative h-4! rounded-md group-data-[collapsible=icon]:h-4! hover:bg-transparent hover:underline"
                      onclick={async () => {
                        if (cache.chapters.length === 0) {
                          toast.loading("Loading chapters...", {
                            duration: 700,
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
                        class="mr-3 flex w-2 cursor-pointer justify-center"
                      >
                        {cache.chapter?.number ?? ""}
                      </Label>
                      <Label class="cursor-pointer truncate">
                        {cache.favorite.name}
                      </Label>
                      <Button
                        class="absolute top-0 -left-2 m-0 size-0 rounded-full p-0 transition-all duration-300 group-hover/cache:-left-1 group-hover/cache:size-5 group-hover/cache:p-2"
                        variant="outline"
                        onclick={async (e) => {
                          e.stopPropagation();
                          await removeCache(cache.favorite.id.toString());
                          toast.info("Chapter cache removed!");
                        }}
                      >
                        <Icon
                          class="group-hover/cache:size-4!"
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
            class="bg-background/30 border-background rounded-xl border"
          >
            <Sidebar.MenuItem
              class={cn(
                "smh:max-h-40 max-h-56 overflow-x-hidden overflow-y-auto rounded-xl transition-all [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar-thumb]:bg-transparent",
                ($chaptersCache.length === 0 || !$keepReading) &&
                  "smh:max-h-96 max-h-88",
              )}
            >
              <ScrollArea class="gap-0">
                {#each favoritesWithChapters as fav}
                  <Tooltip
                    class="-ml-1 flex h-7 items-center font-bold "
                    text={fav.self.name}
                    placement="right"
                    delay={200}
                  >
                    <Sidebar.MenuButton
                      class="h-4! group-data-[collapsible=icon]:h-4! hover:bg-transparent hover:underline"
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
                        class="mr-3 flex w-2 cursor-pointer justify-center"
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
  <Sidebar.Group class="group-data-[side=left]:-ml-[1.5px]">
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
              class="size-7! -ml-[10px]"
            />
            <Label class={cn("cursor-pointer transition-all", $openInfo && "text-sidebar!")}>Info</Label>
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
              class={cn(
                " -ml-[14px] size-7! transition-all duration-500 group-data-[collapsible=icon]:-ml-[10px]",
                $openSettings && "rotate-180",
              )}
              icon={$openSettings
                ? "heroicons:cog-6-tooth-solid"
                : "heroicons:cog-6-tooth"}
            />
            <Label
              class={cn(
                "cursor-pointer transition-all",
                $openSettings && "text-sidebar!",
              )}
            >
              Settings
            </Label>
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
        <Sidebar.MenuItem class="group-data-[collapsible=icon]:ssmh:hidden">
          <Sidebar.MenuButton
            class="relative size-10"
            onclick={(e) => {
              e.currentTarget.blur();
              themeMode.toggle();
            }}
            tabindex={-1}
          >
            <Icon
              class={cn(
                "absolute left-1.5 size-7! transition-all duration-500 group-data-[collapsible=icon]:left-2.5",
                themeMode.value === "dark"
                  ? "opacity-100"
                  : "scale-0 rotate-180 opacity-0",
              )}
              icon="material-symbols:sunny-outline-rounded"
            />
            <Icon
              class={cn(
                "absolute left-1.5 size-7! transition-all duration-500 group-data-[collapsible=icon]:left-2.5",
                themeMode.value === "light"
                  ? "opacity-100"
                  : "scale-0 -rotate-180 opacity-0",
              )}
              icon="material-symbols:dark-mode-outline"
            />
            <Label class="ml-8 cursor-pointer">Theme</Label>
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
      </Sidebar.Menu>
    </Sidebar.GroupContent>
  </Sidebar.Group>
  <Sidebar.Footer
    class="ssmh:-mt-3 mt-0 ml-1 flex items-center overflow-hidden"
  >
    <!-- <Avatar  src="/icon.png" fallbackText="MYK" /> -->
    <Sidebar.MenuItem>
      <Sidebar.MenuButton
        onclick={rotateImage}
        onwheel={rotateImage}
        class="transition-all hover:bg-transparent"
      >
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <img
          bind:this={imgElement}
          class="ml-0 size-9! min-w-9 rounded-md group-data-[collapsible=icon]:-ml-4"
          draggable={false}
          src="/square-icon.png"
          alt="icon"
        />
        <Label class="cursor-pointer text-nowrap">漫画君知る</Label>
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  </Sidebar.Footer>
</Sidebar.Root>
