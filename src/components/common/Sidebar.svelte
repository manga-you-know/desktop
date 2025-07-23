<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { Badge } from "svelte-ux";
  import { Sidebar, Label, Avatar, Separator } from "@/lib/components";
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
  } from "@/store";
  import Icon from "@iconify/svelte";
  import type { Downloading } from "@/types";
  import { useSidebar } from "@/lib/components/ui/sidebar";
  import { IS_MOBILE } from "@/constants";
  import { saveSettings } from "@/functions";
  import { cn } from "@/lib/utils";

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
  let favoritesWithChapterCount = $derived(
    Object.values($favoritesLoaded)
      .map((fv) => (fv.nextChapter !== null ? 1 : 0))
      .reduce((a: number, b: number): number => a + b, 0),
  );

  function rotateImage(): void {
    if (isAnimating) return;
    isAnimating = true;

    let start: number | null = null;

    function animate(timestamp: number): void {
      if (start === null) start = timestamp;
      let progress: number = timestamp - start;

      let degrees: number = Math.min((progress / 500) * 360, 360);
      if (imgElement) {
        imgElement.style.transform = `rotate(${rotation + degrees}deg)`;
      }

      if (degrees < 360) {
        requestAnimationFrame(animate);
      } else {
        rotation += 360;
        isAnimating = false;
      }
    }

    requestAnimationFrame(animate);
  }

  let { variant }: { variant: "sidebar" | "inset" | "floating" } = $props();

  const sidebar = useSidebar();
</script>

<Sidebar.Root
  class={cn(
    "bg-sidebar pl-[2.5px] pb-0 pr-0 border-0",
    $customTitlebar && "pt-7",
  )}
  {variant}
  collapsible="icon"
>
  <Sidebar.Header></Sidebar.Header>
  <Sidebar.Content class="overflow-hidden">
    <Sidebar.Group>
      <!-- <Sidebar.GroupLabel>pages</Sidebar.GroupLabel> -->
      <Sidebar.GroupContent>
        <Sidebar.Menu class="flex flex-col gap-2">
          {#each items as item (item.name)}
            <Sidebar.MenuItem class="!min-w-16">
              <Sidebar.MenuButton
                variant={page.url.pathname === item.path
                  ? "secondary"
                  : "default"}
                onclick={(e) => {
                  e.currentTarget.blur();
                  goto(item.path);
                }}
                tabindex={-1}
              >
                {#if item.path !== "/favorites" || favoritesWithChapterCount === 0}
                  <Icon
                    icon={page.url.pathname === item.path
                      ? item.iconActive
                      : item.icon}
                    class="!size-7 -ml-[10px]"
                  />
                {:else}
                  <Badge
                    class={cn(
                      page.url.pathname === item.path
                        ? "bg-sidebar text-primary"
                        : "bg-primary text-sidebar",
                    )}
                    value={favoritesWithChapterCount}
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
                <Label class="cursor-pointer">{item.name}</Label>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          {/each}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
    <Separator class="bg-secondary w-[95%]" />
    <Sidebar.Group>
      <Sidebar.GroupContent>
        <Sidebar.Menu class="flex flex-col gap-2">
          <Sidebar.MenuItem>
            <Sidebar.MenuButton
              variant={$openSearch ? "outline" : "default"}
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
              <Label class="cursor-pointer">Search</Label>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton
              variant={$openTag ? "outline" : "default"}
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
              <Label class="cursor-pointer">Tags</Label>
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
              <Label class="cursor-pointer">Add</Label>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
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
            variant={$openInfo ? "outline" : "default"}
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
            <Label class="cursor-pointer">Info</Label>
          </Sidebar.MenuButton>
        </Sidebar.MenuItem> -->
        <Sidebar.MenuItem>
          <Sidebar.MenuButton
            class="size-10"
            variant={$openSettings ? "outline" : "default"}
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
            <Label class="cursor-pointer">Settings</Label>
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
        <Sidebar.MenuItem>
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
  <Sidebar.Footer class="flex items-center">
    <!-- <Avatar  src="/icon.png" fallbackText="MYK" /> -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <img
      bind:this={imgElement}
      draggable={false}
      onclick={rotateImage}
      class="w-24 min-w-10 -ml-[2px]"
      src="/icon.png"
      alt="icon"
    />
  </Sidebar.Footer>
</Sidebar.Root>
