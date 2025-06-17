<script lang="ts">
  import { Menubar as MenubarPrimitive } from "bits-ui";
  import { cn } from "$lib/utils.js";

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: MenubarPrimitive.RootProps = $props();
</script>

<MenubarPrimitive.Root
  bind:ref
  class={cn(
    "bg-sidebar flex h-10 items-center space-x-1 rounded-xl p-1",
    className
  )}
  {...restProps}
/>
