<script lang="ts">
  import { ContextMenu as ContextMenuPrimitive } from "bits-ui";
  import { cn } from "$lib/utils.js";

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
      "bg-[#18191b] text-popover-foreground z-50 min-w-32 rounded-md border p-1 shadow-md focus:outline-none",
      className
    )}
    {...restProps}
  />
</ContextMenuPrimitive.Portal>
