<script>
  import { Sidebar as SidebarProv } from "@/lib/components";
  import { Sidebar } from "@/components";
  let { children } = $props();
</script>

<div class="w-screen h-screen flex select-none overflow-hidden">
  <SidebarProv.Provider open={false}>
    <Sidebar />
    <SidebarProv.Inset class="p-2">
      {@render children?.()}
    </SidebarProv.Inset>
  </SidebarProv.Provider>
</div>
