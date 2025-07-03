<script lang="ts">
  import { Menubar as MenubarPrimitive } from "bits-ui";
  import { cn } from "$lib/utils.js";
  import { theme } from "@/store";

  let {
    ref = $bindable(null),
    class: className,
    sideOffset = 8,
    alignOffset = -4,
    align = "start",
    side = "bottom",
    portalProps,
    ...restProps
  }: MenubarPrimitive.ContentProps & {
    portalProps?: MenubarPrimitive.PortalProps;
  } = $props();
</script>

<MenubarPrimitive.Portal {...portalProps}>
  <MenubarPrimitive.Content
    bind:ref
    {sideOffset}
    {align}
    {alignOffset}
    {side}
    class={cn(
      "bg-secondary/50 backdrop-blur-sm border border-accent text-popover-foreground z-50 min-w-[12rem] rounded-xl p-1 shadow-md focus:outline-none",
      $theme === "dark" && "dark",
      className
    )}
    {...restProps}
  />
</MenubarPrimitive.Portal>
