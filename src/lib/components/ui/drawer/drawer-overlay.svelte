<script lang="ts">
  import { Drawer as DrawerPrimitive } from "vaul-svelte";
  import { cn } from "$lib/utils.js";

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: DrawerPrimitive.OverlayProps = $props();
</script>

<DrawerPrimitive.Overlay
  bind:ref
  class={cn(
    "fixed inset-0 z-50 bg-background/80 outline-none ring-0 focus-visible:outline-none focus-visible:ring-0",
    className,
  )}
  {...restProps}
/>
