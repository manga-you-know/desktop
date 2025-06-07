<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { Sidebar, Label, Avatar, Separator } from "@/lib/components";
  import { Badge } from "svelte-ux";
  import {
    openSearch,
    openSettings,
    openAdd,
    openTag,
    openDownloads,
    downloadings,
    favoritesLoaded,
    theme,
  } from "@/store";
  import Icon from "@iconify/svelte";
  import type { Downloading } from "@/types";
  import { useSidebar } from "@/lib/components/ui/sidebar";
  import { IS_MOBILE } from "@/constants";
  import { saveSettings } from "@/functions";

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
      iconActive: "solar:book-2-bold",
      icon: "solar:book-2-outline",
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
  let downloadingCount = $derived(
    Object.values<Downloading>($downloadings).reduce(
      (a1, a2) => a1 + a2.downloading.length,

      0
    )
  );
  let favoritesWithChapterCount = $derived(
    Object.values($favoritesLoaded)
      .map((fv) => (fv.nextChapter !== null ? 1 : 0))
      .reduce((a: number, b: number): number => a + b, 0)
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
  class="pl-[2.5px] hover:bg-sidebar pr-0"
  {variant}
  collapsible="icon"
  onmouseenter={() => {}}
  onmouseleave={() => {}}
>
  <Sidebar.Header></Sidebar.Header>
  <Sidebar.Content class="!overflow-hidden">
    <Sidebar.Group>
      <!-- <Sidebar.GroupLabel>pages</Sidebar.GroupLabel> -->
      <Sidebar.GroupContent>
        <Sidebar.Menu class="flex flex-col gap-2">
          {#each items as item (item.name)}
            <Sidebar.MenuItem class="!min-w-16">
              <Sidebar.MenuButton
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
                    class="!w-5 !h-5 ml-[-2px]"
                  />
                {:else}
                  <Badge
                    class="dark:text-black"
                    value={favoritesWithChapterCount}
                    small
                  >
                    <Icon
                      icon={page.url.pathname === item.path
                        ? item.iconActive
                        : item.icon}
                      class="!w-5 !h-5 ml-[-2px]"
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
              onclick={(e) => {
                e.currentTarget.blur();
                openSearch.set(true);
                openTag.set(false);
                openDownloads.set(false);
                openSettings.set(false);
                openAdd.set(false);
                if (IS_MOBILE) sidebar.toggle();
              }}
              tabindex={-1}
            >
              <Icon
                icon={$openSearch
                  ? "mingcute:search-3-fill"
                  : "mingcute:search-3-line"}
                class="!w-5 !h-5 ml-[-2px]"
              />
              <Label class="cursor-pointer">Search</Label>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton
              onclick={(e) => {
                e.currentTarget.blur();
                openSearch.set(false);
                openTag.set(true);
                openDownloads.set(false);
                openSettings.set(false);
                openAdd.set(false);
                if (IS_MOBILE) sidebar.toggle();
              }}
            >
              <Icon
                class="!w-6 !h-5 mx-[-3px]"
                icon={$openTag ? "ion:bookmarks" : "ion:bookmarks-outline"}
              />
              <Label class="cursor-pointer">Tags</Label>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton
              class="flex justify-start "
              onclick={(e) => {
                e.currentTarget.blur();
                openSearch.set(false);
                openTag.set(false);
                openDownloads.set(true);
                openSettings.set(false);
                openAdd.set(false);
                if (IS_MOBILE) sidebar.toggle();
              }}
              tabindex={-1}
            >
              {#if downloadingCount > 0}
                <Badge class="dark:text-black" value={downloadingCount} small>
                  <Icon
                    icon={$openDownloads
                      ? "basil:download-solid"
                      : "basil:download-outline"}
                    class="!size-6 ml-[-3px]"
                  />
                </Badge>
              {:else}
                <Icon
                  icon={$openDownloads
                    ? "basil:download-solid"
                    : "basil:download-outline"}
                  class="!w-6 !h-6 ml-[-3px]"
                />
              {/if}
              <Label class="cursor-pointer">Downloads</Label>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton
              onclick={(e) => {
                e.currentTarget.blur();
                openSearch.set(false);
                openTag.set(false);
                openSettings.set(true);
                openAdd.set(false);
                openDownloads.set(false);
                if (IS_MOBILE) sidebar.toggle();
              }}
              tabindex={-1}
            >
              <Icon
                icon={$openSettings
                  ? "heroicons:cog-6-tooth-solid"
                  : "heroicons:cog-6-tooth"}
                class="!w-5 !h-5 ml-[-2px]"
              />
              <Label class="cursor-pointer">Settings</Label>
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
                openDownloads.set(false);
                if (IS_MOBILE) sidebar.toggle();
              }}
              tabindex={-1}
            >
              <Icon
                icon={$openAdd ? "typcn:plus" : "typcn:plus-outline"}
                class="!w-5 !h-5 ml-[-2px] "
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
      <Sidebar.Menu class="flex flex-col gap-2">
        <Sidebar.MenuItem>
          <Sidebar.MenuButton
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
              class="!size-5 ml-[-2px]"
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
      class="w-24 min-w-10 ml-[2px]"
      src="/icon.png"
      alt="icon"
    />
  </Sidebar.Footer>
</Sidebar.Root>
