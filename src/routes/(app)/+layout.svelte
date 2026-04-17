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

  // type PageId = "home" | "favorites" | "library" | "panels";
  //
  // const pageDirection: Record<PageId, number> = {
  //   home: 0,
  //   favorites: 1,
  //   library: 2,
  //   panels: 3,
  // };
  //
  // let runBoth = $state(0);
  //
  let { children } = $props();
  //
  // function getPageId(path: string | null): PageId {
  //   if (!path) return "home";
  //   return path as PageId;
  // }
  //
  // function getTransitionY(
  //   currentId: PageId,
  //   lastId: PageId,
  //   isEntering: boolean,
  // ): number {
  //   const currentPos = pageDirection[currentId];
  //   const lastPos = pageDirection[lastId];
  //   runBoth++;
  //   if (
  //     runBoth === 2 &&
  //     !(currentId.includes("reader") && currentId.includes("player"))
  //   ) {
  //     lastPage.set("/" + currentId);
  //     saveSettings();
  //     runBoth = 0;
  //   }
  //   if (currentPos > lastPos) {
  //     return isEntering ? 200 : -200;
  //   } else {
  //     return isEntering ? -200 : 200;
  //   }
  // }
  const isMobileInstance = new IsMobile();
  const isMobile = $derived(isMobileInstance.current);
</script>

{#if !isMobile}
  <div class="relative flex w-full overflow-hidden select-none">
    <SidebarProv.Provider
      class={cn("h-full", page.url.pathname === "/random" && "m-0")}
      open={$sidebarBehavior === "expand"}
    >
      <Sidebar variant="inset" />
      <SidebarProv.Inset class={cn("p-2")}>
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <div
          class={cn(
            "m-0 flex w-full justify-center overflow-hidden pb-5",
            $customTitlebar ? "h-[calc(100vh-2.5rem)]!" : "h-[99vh]!",
          )}
        >
          {@render children?.()}
        </div>
      </SidebarProv.Inset>
    </SidebarProv.Provider>
  </div>
{:else}
  <SidebarProv.Provider class="h-full!" open={false} controlledOpen>
    <Sidebar variant="floating" />
    <div
      class="dark:bg-background flex h-screen! max-h-screen! w-screen! flex-col justify-end overflow-hidden! select-none"
    >
      {#key page.route.id}
        <div class="absolute mb-20 h-[90vh]! max-h-[90vh]! max-w-screen! pb-5">
          {@render children?.()}
        </div>
      {/key}
      <BottomNavigation />
    </div>
  </SidebarProv.Provider>
{/if}
