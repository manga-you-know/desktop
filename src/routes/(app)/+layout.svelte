<script>
  import { Sidebar as SidebarProv } from "@/lib/components";
  import { Sidebar, BottomNavigation } from "@/components";
  import { isMobile } from "@/store";
  let { children } = $props();
</script>

{#if !$isMobile}
  <div class="w-full h-screen flex select-none overflow-hidden">
    <SidebarProv.Provider class="!h-full" open={false}>
      <Sidebar />
      <SidebarProv.Inset class="p-2">
        {@render children?.()}
      </SidebarProv.Inset>
    </SidebarProv.Provider>
  </div>
{:else}
  <div class="w-screen h-screen flex flex-col select-none overflow-hidden">
    {@render children?.()}
    <BottomNavigation />
  </div>
{/if}
