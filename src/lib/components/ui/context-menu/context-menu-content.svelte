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
      "bg-accent/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 text-popover-foreground border-sidebar z-50 min-w-50 rounded-xl border p-1 shadow-md backdrop-blur-sm focus:outline-none",
      themeMode.value === "dark" && "dark",
      className,
    )}
    {...restProps}
  />
</ContextMenuPrimitive.Portal>
