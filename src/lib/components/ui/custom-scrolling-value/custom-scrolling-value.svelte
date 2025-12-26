<script lang="ts">
  import { cn } from "@/lib/utils";
  import { ScrollingValue } from "svelte-ux";

  type Props = {
    value: number;
    axis?: "x" | "y";
    class?: string;
  };

  const { value = 0, axis = "y", class: className }: Props = $props();
</script>

<ScrollingValue
  class={cn(value === 9 && "-translate-x-1.5", className)}
  {value}
  {axis}
/>
