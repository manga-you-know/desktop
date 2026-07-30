<script lang="ts">
  import {
    ContextMenu as ContextMenuPrimitive,
    type WithoutChildrenOrChild,
  } from "bits-ui";
  import Check from "lucide-svelte/icons/check";
  import Minus from "lucide-svelte/icons/minus";
  import { cn } from "$lib/utils.js";
  import type { Snippet } from "svelte";

  let {
    ref = $bindable(null),
    checked = $bindable(false),
    indeterminate = $bindable(false),
    class: className,
    children: childrenProp,
    ...restProps
  }: WithoutChildrenOrChild<ContextMenuPrimitive.CheckboxItemProps> & {
    children?: Snippet;
  } = $props();
</script>

<ContextMenuPrimitive.CheckboxItem
  bind:ref
  bind:checked
  bind:indeterminate
  class={cn(
    "data-highlighted:bg-accent data-highlighted:text-accent-foreground relative flex cursor-default items-center justify-start rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none select-none data-disabled:pointer-events-none data-disabled:opacity-50",
    className,
  )}
  {...restProps}
>
  {#snippet children({ checked, indeterminate })}
    {@render childrenProp?.()}
    <span class="absolute right-2 flex size-3.5 items-center justify-center">
      {#if indeterminate}
        <Minus class="size-3.5" />
      {:else}
        <Check class={cn("size-3.5", !checked && "text-transparent")} />
      {/if}
    </span>
  {/snippet}
</ContextMenuPrimitive.CheckboxItem>
