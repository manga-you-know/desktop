<script lang="ts">
  import { ContextMenu as ContextMenuPrimitive } from "bits-ui";
  import { cn } from "$lib/utils.js";
  import { theme } from "@/store";
  import { themeMode } from "@/states";

  let {
    ref = $bindable(null),
    portalProps,
    class: className,
    ...restProps
  }: ContextMenuPrimitive.ContentProps & {
    portalProps?: ContextMenuPrimitive.PortalProps;
  } = $props();
</script>

<ContextMenuPrimitive.Portal {...portalProps}>
  <ContextMenuPrimitive.Content
    bind:ref
    class={cn(
      "bg-secondary/60 text-popover-foreground border-sidebar z-50 min-w-40 rounded-xl border p-1 shadow-md backdrop-blur-sm focus:outline-none",
      themeMode.value === "dark" && "dark",
      className,
    )}
    {...restProps}
  />
</ContextMenuPrimitive.Portal>
