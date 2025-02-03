<script lang="ts">
  import { Tooltip as TooltipPrimitive } from "@/lib/components";

  interface Props {
    text: string;
    disabled?: boolean;
    width?: string;
    height?: string;
    children?: any;
  }

  let { text, disabled = $bindable(false), children }: Props = $props();
</script>

<TooltipPrimitive.Root delayDuration={200} {disabled}>
  <TooltipPrimitive.Trigger tabindex={-1}>
    {@render children?.()}
  </TooltipPrimitive.Trigger>
  <TooltipPrimitive.Content sideOffset={5}>
    {text}
  </TooltipPrimitive.Content>
</TooltipPrimitive.Root>
