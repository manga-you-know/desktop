<script lang="ts">
  import { Command as CommandPrimitive } from "bits-ui";
  import { cn } from "$lib/utils.js";

  let {
    ref = $bindable(null),
    value = $bindable(""),
    class: className,
    ...restProps
  }: CommandPrimitive.RootProps = $props();
</script>

<CommandPrimitive.Root
  class={cn(
    "bg-background/30 backdrop-blur-sm text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-2xl",
    className
  )}
  bind:value
  bind:ref
  {...restProps}
/>
