<script lang="ts">
  import {
    ContextMenu as ContextMenuPrimitive,
    type WithoutChild,
  } from "bits-ui";
  import ChevronRight from "lucide-svelte/icons/chevron-right";
  import { cn } from "$lib/utils.js";

  let {
    ref = $bindable(null),
    class: className,
    inset,
    children,
    ...restProps
  }: WithoutChild<ContextMenuPrimitive.SubTriggerProps> & {
    inset?: boolean;
  } = $props();
</script>

<ContextMenuPrimitive.SubTrigger
  bind:ref
  class={cn(
    "data-highlighted:bg-secondary/60 data-[state=open]:bg-secondary/80 data-disabled:text-primary/60 font-semibold data-highlighted:text-primary data-[state=open]:text-primary flex gap-2 cursor-default select-none items-center rounded-lg px-3 py-1.5 text-sm outline-none",
    inset && "pl-8",
    className,
  )}
  {...restProps}
>
  {@render children?.()}
  <ChevronRight class="ml-auto size-4" />
</ContextMenuPrimitive.SubTrigger>
