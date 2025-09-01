<script lang="ts">
  import { Sidebar as SidebarProv } from "@/lib/components";
  import { Sidebar, BottomNavigation } from "@/components";
  import {
    customTitlebar,
    lastPage,
    sidebarBehavior,
    sidebarSide,
  } from "@/store";
  import { page } from "$app/state";
  import { fly } from "svelte/transition";
  import { saveSettings } from "@/functions";
  import { IS_MOBILE } from "@/constants";
  import { IsMobile } from "@/lib/hooks";
  import { cn } from "@/lib/utils";

  type PageId = "home" | "favorites" | "library" | "panels";

  const pageDirection: Record<PageId, number> = {
    home: 0,
    favorites: 1,
    library: 2,
    panels: 3,
  };

  let runBoth = $state(0);

  let { children } = $props();

  function getPageId(path: string | null): PageId {
    if (!path) return "home";
    return path as PageId;
  }

  function getTransitionY(
    currentId: PageId,
    lastId: PageId,
    isEntering: boolean,
  ): number {
    const currentPos = pageDirection[currentId];
    const lastPos = pageDirection[lastId];
    runBoth++;
    if (
      runBoth === 2 &&
      !(currentId.includes("reader") && currentId.includes("player"))
    ) {
      lastPage.set("/" + currentId);
      saveSettings();
      runBoth = 0;
    }
    if (currentPos > lastPos) {
      return isEntering ? 200 : -200;
    } else {
      return isEntering ? -200 : 200;
    }
  }
  const isMobileInstance = new IsMobile();
  const isMobile = $derived(isMobileInstance.current);
</script>

{#if !isMobile}
  <div class="w-full flex select-none overflow-hidden relative">
    <SidebarProv.Provider class="h-full" open={$sidebarBehavior === "expand"}>
      <Sidebar variant="inset" />
      <SidebarProv.Inset class={cn("p-2")}>
        {#key page.route.id}
          <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
          <div
            class={cn(
              "w-full absolute pb-5",
              $customTitlebar ? "h-[calc(100vh-2.8rem)]" : "h-[99vh]",
            )}
            in:fly={{
              y: getTransitionY(
                getPageId(page.route.id?.replace("/(root)/(app)/", "") ?? ""),
                getPageId($lastPage.replace("/", "")),
                true,
              ),
              duration: 300,
            }}
            out:fly={{
              y: getTransitionY(
                getPageId(page.route.id?.replace("/(root)/(app)/", "") ?? ""),
                getPageId($lastPage.replace("/", "")),
                false,
              ),
              duration: 300,
            }}
          >
            {@render children?.()}
          </div>
        {/key}
      </SidebarProv.Inset>
    </SidebarProv.Provider>
  </div>
{:else}
  <SidebarProv.Provider class="h-full!" open={false} controlledOpen>
    <Sidebar variant="floating" />
    <div
      class="dark:bg-background !w-screen !h-screen !max-h-screen flex flex-col justify-end select-none !overflow-hidden"
    >
      {#key page.route.id}
        <div
          class="!h-[90vh] !max-h-[90vh] !max-w-screen absolute pb-5 mb-20"
          in:fly={{
            x: getTransitionY(
              getPageId(page.route.id?.replace("/(app)/", "") ?? ""),
              getPageId($lastPage.replace("/", "")),
              true,
            ),
            duration: 300,
          }}
          out:fly={{
            x: getTransitionY(
              getPageId(page.route.id?.replace("/(app)/", "") ?? ""),
              getPageId($lastPage.replace("/", "")),
              false,
            ),
            duration: 300,
          }}
        >
          {@render children?.()}
        </div>
      {/key}
      <BottomNavigation />
    </div>
  </SidebarProv.Provider>
{/if}
