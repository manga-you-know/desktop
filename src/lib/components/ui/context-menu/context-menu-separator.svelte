<script lang="ts">
  import { ContextMenu as ContextMenuPrimitive } from "bits-ui";
  import { cn } from "$lib/utils.js";

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: ContextMenuPrimitive.SeparatorProps = $props();
</script>

<ContextMenuPrimitive.Separator
  bind:ref
  class={cn("bg-sidebar -mx-1 my-1 h-px", className)}
  {...restProps}
/>
