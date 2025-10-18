<script lang="ts">
  import { ContextMenu as ContextMenuPrimitive } from "bits-ui";
  import { cn } from "$lib/utils.js";
  import { theme } from "@/store";

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
      "bg-secondary/60 backdrop-blur-sm text-popover-foreground z-50 min-w-40 rounded-xl border border-sidebar p-1 shadow-md focus:outline-none",
      $theme === "dark" && "dark",
      className
    )}
    {...restProps}
  />
</ContextMenuPrimitive.Portal>
