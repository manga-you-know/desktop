<script lang="ts">
  import { Sidebar as SidebarProv } from "@/lib/components";
  import { Sidebar, BottomNavigation } from "@/components";
  import { lastPage } from "@/store";
  import { page } from "$app/state";
  import { fly } from "svelte/transition";
  import { saveSettings } from "@/functions";
  import { IS_MOBILE } from "@/constants";

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
    isEntering: boolean
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
</script>

{#if !IS_MOBILE}
  <div class="w-full h-screen flex select-none overflow-hidden relative">
    <SidebarProv.Provider class="h-full!" open={false}>
      <Sidebar />
      <SidebarProv.Inset class="p-2">
        {#key page.route.id}
          <div
            class="h-[99vh] absolute pb-5"
            in:fly={{
              y: getTransitionY(
                getPageId(page.route.id?.replace("/(app)/", "") ?? ""),
                getPageId($lastPage.replace("/", "")),
                true
              ),
              duration: 300,
            }}
            out:fly={{
              y: getTransitionY(
                getPageId(page.route.id?.replace("/(app)/", "") ?? ""),
                getPageId($lastPage.replace("/", "")),
                false
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
  <div
    class="dark:bg-background w-screen h-screen flex flex-col select-none overflow-hidden"
  >
    {@render children?.()}
    <BottomNavigation />
  </div>
{/if}
