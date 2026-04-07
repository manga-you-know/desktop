<script lang="ts">
  import { LinkPreview as HoverCardPrimitive } from "bits-ui";
  import { cn } from "$lib/utils.js";
  import { theme } from "@/store";
  import { themeMode } from "@/states";

  let {
    ref = $bindable(null),
    class: className,
    align = "center",
    sideOffset = 4,
    portalProps,
    ...restProps
  }: HoverCardPrimitive.ContentProps & {
    portalProps?: HoverCardPrimitive.PortalProps;
  } = $props();
</script>

<HoverCardPrimitive.Portal {...portalProps}>
  <HoverCardPrimitive.Content
    bind:ref
    {align}
    {sideOffset}
    class={cn(
      "bg-popover text-popover-foreground z-50 mt-3 w-64 rounded-md border p-4 shadow-md outline-none",
      themeMode.value === "dark" && "dark",
      className,
    )}
    {...restProps}
  />
</HoverCardPrimitive.Portal>
