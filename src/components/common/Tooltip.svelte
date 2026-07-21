<script lang="ts">
  import { Label } from "@/lib/components";
  import { cn } from "@/lib/utils";
  import { themeMode } from "@/states";
  import { Tooltip } from "svelte-ux";

  interface Props {
    text?: string;
    subtext?: string;
    class?: string;
    placement?: "left" | "top" | "bottom" | "right";
    delay?: number;
    disabled?: boolean;
    children?: any;
  }

  let {
    text,
    subtext,
    class: className,
    placement = "top",
    delay,
    disabled = false,
    children,
  }: Props = $props();
</script>

<Tooltip
  classes={{
    title: cn(
      "rounded-xl border border-secondary bg-sidebar text-primary",
      themeMode.value,
      className,
    ),
  }}
  {placement}
  {delay}
  title={text}
>
  <div
    class={cn(
      "bg-secondary/60 dark:bg-accent/50 flex flex-col rounded-xl border-2 px-2 py-1 backdrop-blur-md",
      themeMode.value,
      (disabled || text?.length === 0) && "hidden",
    )}
    slot="title"
  >
    <Label class="max-w-80 text-sm text-clip">
      {text}
    </Label>
    {#if subtext}
      <span class="text-xs text-gray-500">
        {subtext}
      </span>
    {/if}
  </div>
  {@render children?.()}
</Tooltip>
