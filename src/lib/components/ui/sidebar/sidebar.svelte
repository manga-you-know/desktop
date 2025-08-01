<script lang="ts">
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import { cn } from "$lib/utils.js";
  import type { WithElementRef } from "bits-ui";
  import type { HTMLAttributes } from "svelte/elements";
  import { SIDEBAR_WIDTH_MOBILE } from "./constants.js";
  import { useSidebar } from "./context.svelte.js";
  import { customTitlebar } from "@/store";

  let {
    ref = $bindable(null),
    side = "left",
    variant = "sidebar",
    collapsible = "offcanvas",
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
    side?: "left" | "right";
    variant?: "sidebar" | "floating" | "inset";
    collapsible?: "offcanvas" | "icon" | "none";
  } = $props();

  const sidebar = useSidebar();
</script>

{#if collapsible === "none"}
  <div
    class={cn(
      "bg-sidebar text-sidebar-foreground flex h-full w-[--sidebar-width] flex-col",
      className,
    )}
    bind:this={ref}
    {...restProps}
  >
    {@render children?.()}
  </div>
{:else if sidebar.isMobile}
  <Sheet.Root
    open={sidebar.openMobile}
    onOpenChange={sidebar.setOpenMobile}
    {...restProps}
  >
    <Sheet.Content
      data-sidebar="sidebar"
      data-mobile="true"
      class="bg-sidebar text-sidebar-foreground w-[--sidebar-width] p-0 [&>button]:hidden"
      style="--sidebar-width: {SIDEBAR_WIDTH_MOBILE};"
      {side}
    >
      <div class="flex h-full w-full flex-col">
        {@render children?.()}
      </div>
    </Sheet.Content>
  </Sheet.Root>
{:else}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    bind:this={ref}
    class="text-sidebar-foreground group peer hidden ssm:block"
    data-state={sidebar.state}
    data-collapsible={sidebar.state === "collapsed" ? collapsible : ""}
    data-variant={variant}
    data-side={side}
    onmouseenter={sidebar.handleMouseEnter}
    onmouseleave={sidebar.handleMouseLeave}
  >
    <!-- This is what handles the sidebar gap on desktop -->
    <div
      data-slot="sidebar-gap"
      class={cn(
        "relative w-[--sidebar-width] bg-transparent transition-[width] duration-200 ease-linear",
        $customTitlebar ? "min-h-[calc(100vh-2.5rem)]" : "h-svh",
        "group-data-[collapsible=offcanvas]:w-0",
        "group-data-[side=right]:!rotate-180",
        variant === "floating" || variant === "inset"
          ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]"
          : "group-data-[collapsible=icon]:w-[--sidebar-width-icon]",
      )}
    ></div>
    <div
      class={cn(
        "fixed inset-y-0 z-10 hidden w-[--sidebar-width] transition-[left,right,width] duration-200 ease-linear ssm:flex",
        $customTitlebar ? "min-h-[calc(100vh-2.5rem)]" : "h-svh",
        side === "left"
          ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
          : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
        // Adjust the padding for floating and inset variants.
        variant === "floating" || variant === "inset"
          ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+10px)]"
          : "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l",
        className,
      )}
      {...restProps}
    >
      <div
        data-sidebar="sidebar"
        class="bg-sidebar bg-group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow"
      >
        {@render children?.()}
      </div>
    </div>
  </div>
{/if}
