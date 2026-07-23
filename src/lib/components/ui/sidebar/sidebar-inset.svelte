<script lang="ts">
  import { page } from "$app/state";
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
    "scrollbar relative flex flex-1 flex-col transition-all duration-400",
    page.url.pathname !== "/random" &&
      "peer-data-[variant=inset]:m-2 peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 peer-data-[variant=inset]:rounded-xl",
    $customTitlebar
      ? "peer-data-[variant=inset]:ml-0 peer-data-[variant=inset]:mt-px peer-data-[state=collapsed]:peer-data-[variant=inset]:mt-px"
      : "peer-data-[variant=inset]:ml-2 peer-data-[variant=inset]:min-h-[calc(100svh-(--spacing(4)))]",
    $windowEffects ? "bg-transparent" : "bg-background",
    className,
  )}
  {...restProps}
>
  {@render children?.()}
</main>
