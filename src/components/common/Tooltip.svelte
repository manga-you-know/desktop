<script lang="ts">
  import { cn } from "@/lib/utils";
  import { theme } from "@/store";
  import { Tooltip } from "svelte-ux";

  interface Props {
    text?: string;
    class?: string;
    placement?: "left" | "top" | "bottom" | "right";
    delay?: number;
    disabled?: boolean;
    children?: any;
  }

  let {
    text,
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
      $theme === "dark" && "dark",
      className,
    ),
  }}
  {placement}
  {delay}
  title={text}
>
  {@render children?.()}
</Tooltip>
