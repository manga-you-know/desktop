<script lang="ts">
  import { Menubar as MenubarPrimitive } from "bits-ui";
  import { cn } from "$lib/utils.js";

  let {
    ref = $bindable(null),
    class: className,
    inset = undefined,
    ...restProps
  }: MenubarPrimitive.ItemProps & {
    inset?: boolean;
  } = $props();
</script>

<MenubarPrimitive.Item
  bind:ref
  class={cn(
    "data-[highlighted]:bg-accent dark:data-[highlighted]:bg-background/60 data-[highlighted]:text-primary relative flex cursor-default select-none items-center justify-between rounded-lg px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    inset && "pl-8",
    className,
  )}
  {...restProps}
/>
