<script lang="ts">
  import { ContextMenu as ContextMenuPrimitive } from "bits-ui";
  import { cn } from "$lib/utils.js";
  import { themeMode } from "@/states";

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: ContextMenuPrimitive.SubContentProps = $props();
</script>

<ContextMenuPrimitive.Portal>
  <ContextMenuPrimitive.SubContent
    bind:ref
    class={cn(
      "bg-secondary/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 text-popover-foreground border-sidebar pointer-events-auto z-50 min-w-40 overflow-hidden rounded-xl border p-1 shadow-md backdrop-blur-sm focus:outline-none",
      className,
      themeMode.value === "dark" && "dark",
    )}
    {...restProps}
  />
</ContextMenuPrimitive.Portal>
