<script lang="ts">
  import { cn } from "$lib/utils.js";
  import { customTitlebar, windowEffects } from "@/store";
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
    "relative flex flex-1 flex-col scrollbar",
    "ssm:peer-data-[variant=inset]:m-2 ssm:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 ssm:peer-data-[variant=inset]:rounded-xl",
    $customTitlebar
      ? "ssm:peer-data-[variant=inset]:ml-0 ssm:peer-data-[variant=inset]:mt-px ssm:peer-data-[state=collapsed]:peer-data-[variant=inset]:mt-px"
      : " ssm:peer-data-[variant=inset]:ml-2 peer-data-[variant=inset]:min-h-[calc(100svh-(--spacing(4)))]",
    $windowEffects ? "bg-transparent" : "bg-background",
    className,
  )}
  {...restProps}
>
  {@render children?.()}
</main>
