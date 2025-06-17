<script lang="ts">
  import { Menubar as MenubarPrimitive } from "bits-ui";
  import { cn } from "$lib/utils.js";

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: MenubarPrimitive.TriggerProps = $props();
</script>

<MenubarPrimitive.Trigger
  bind:ref
  class={cn(
    "data-[state=open]:bg-secondary hover:bg-secondary/80 dark:text-white flex cursor-default select-none items-center rounded-lg px-3 py-1.5 text-sm font-medium outline-none",
    className
  )}
  {...restProps}
/>
