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
  import { openSettings, themeMode } from "@/states";

  const items = [
    {
      name: "Favorites",
      path: "/favorites",
      icon: "lucide:star",
    },
    {
      name: "Library",
      path: "/library",
      icon: "lucide:book-open-text",
    },
    {
      name: "Browse",
      path: "/browse",
      icon: "lucide:compass",
    },
    {
      name: "Panels",
      path: "/panels",
      icon: "lucide:image",
    },
    {
      name: "Random",
      path: "/random",
      icon: "lucide:book",
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
  class={cn(
    "border-0 px-0 pb-0",
    $customTitlebar && "pt-7",
    page.url.pathname === "/random" && "w-0!",
  )}
  style="view-transition-name: sidebar"
  {variant}
  side={$sidebarSide}
  collapsible="icon"
>
  <Sidebar.Header class="px-0 group-data-[side=left]:-ml-0.5">
    <Sidebar.Group>
      <!-- <Sidebar.GroupLabel>Pages</Sidebar.GroupLabel> -->
      <Sidebar.GroupContent>
        <Sidebar.Menu class="relative flex flex-col gap-2">
          <Sidebar.MenuButton
            class={cn(
              "transition-translate absolute duration-300",
              page.url.pathname === "/favorites" && "translate-y-0",
              page.url.pathname === "/library" && "translate-y-14",
              page.url.pathname === "/browse" && "translate-y-28",
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
                      "mr-1 -ml-1.5 size-5! transition-transform duration-500",
                      item.path === "/favorites" &&
                        page.url.pathname === item.path &&
                        "rotate-290",
                    )}
                    icon={item.icon}
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
                        "-ml-2.5 size-7! transition-transform duration-400",
                        page.url.pathname === item.path && "rotate-290",
                      )}
                      icon={item.icon}
                    />
                  </Badge>
                {/if}
                <Label
                  class={cn(
                    "cursor-pointer transition-all",
                    page.url.pathname === item.path && "text-sidebar!",
                  )}
                >
                  {item.name}
                </Label>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          {/each}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  </Sidebar.Header>
  <Separator class="bg-secondary w-[95%]" />
  <Sidebar.Content
    class="scrollbar -ml-0.5 group-data-[collapsible=icon]:overflow-y-auto [&::-webkit-scrollbar]:w-2 group-data-[collapsible=icon]:[&::-webkit-scrollbar]:w-0.5"
  >
    <Sidebar.Group>
      <Sidebar.GroupContent>
        <Sidebar.Menu class="flex flex-col gap-2">
          <Sidebar.MenuItem>
            <Sidebar.MenuButton
              variant={$openTag ? "secondary" : "default"}
              onclick={(e) => {
                e.currentTarget.blur();
                openSearch.set(false);
                openTag.set(true);
                openInfo.set(false);
                openAdd.set(false);
                // openSettings.set(false);
                openDownloads.set(false);
                if (IS_MOBILE) sidebar.toggle();
              }}
              tabindex={-1}
            >
              <Icon class="mr-1 -ml-1.5 size-5!" icon="lucide:tags" />
              <Label
                class={cn(
                  "cursor-pointer transition-all",
                  $openTag && "text-sidebar!",
                )}
              >
                Tags
              </Label>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
          <Sidebar.MenuItem class="hidden">
            <Sidebar.MenuButton
              onclick={(e) => {
                e.currentTarget.blur();
                openSearch.set(false);
                openTag.set(false);
                // openSettings.set(false);
                openAdd.set(true);
                openInfo.set(false);
                openDownloads.set(false);
                if (IS_MOBILE) sidebar.toggle();
              }}
              tabindex={-1}
            >
              <Icon
                icon={$openAdd ? "typcn:plus" : "typcn:plus-outline"}
                class="-ml-0.5 size-7! "
              />
              <Label
                class={cn(
                  "cursor-pointer transition-all",
                  $openAdd && "text-sidebar!",
                )}
              >
                Add
              </Label>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
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
              // openSettings.set(false);
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
            variant={openSettings.active ? "secondary" : "default"}
            onclick={(e) => {
              e.currentTarget.blur();
              openSearch.set(false);
              openTag.set(false);
              openSettings.active = true;
              openAdd.set(false);
              openInfo.set(false);
              openDownloads.set(false);
              if (IS_MOBILE) sidebar.toggle();
            }}
            tabindex={-1}
          >
            <Icon
              class={cn(
                "mr-1 -ml-2.5 size-5! transition-all duration-500 group-data-[collapsible=icon]:-ml-1.5",
                openSettings.active && "rotate-180",
              )}
              icon="lucide:settings"
            />
            <Label
              class={cn(
                "cursor-pointer transition-all",
                openSettings.active && "text-sidebar!",
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
                "absolute left-2.5 size-5! transition-all duration-500 group-data-[collapsible=icon]:left-3.5",
                themeMode.value === "dark"
                  ? "opacity-100"
                  : "scale-0 rotate-180 opacity-0",
              )}
              icon="lucide:sun"
            />
            <Icon
              class={cn(
                "absolute left-2.5 size-5! transition-all duration-500 group-data-[collapsible=icon]:left-3.5",
                themeMode.value === "light"
                  ? "opacity-100"
                  : "scale-0 -rotate-180 opacity-0",
              )}
              icon="lucide:moon"
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
