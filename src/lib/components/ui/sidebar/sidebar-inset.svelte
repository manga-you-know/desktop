<script lang="ts">
  import { cn } from "$lib/utils.js";
  import { customTitlebar } from "@/store";
  import type { WithElementRef } from "bits-ui";
  import type { HTMLAttributes } from "svelte/elements";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLElement>> = $props();
</script>

<main
  bind:this={ref}
  class={cn(
    "bg-background relative flex flex-1 flex-col scrollbar",
    "ssm:peer-data-[variant=inset]:m-2 ssm:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 ssm:peer-data-[variant=inset]:rounded-xl ssm:peer-data-[variant=inset]:shadow",
    $customTitlebar
      ? "ssm:peer-data-[variant=inset]:ml-0 ssm:peer-data-[variant=inset]:mt-[1px] ssm:peer-data-[state=collapsed]:peer-data-[variant=inset]:mt-[1px]"
      : " ssm:peer-data-[variant=inset]:ml-2 peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))]",
    className
  )}
  {...restProps}
>
  {@render children?.()}
</main>
