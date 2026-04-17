<script lang="ts">
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import { cn, type WithElementRef } from "$lib/utils.js";
  import type { HTMLAttributes } from "svelte/elements";
  import { SIDEBAR_WIDTH_MOBILE } from "./constants.js";
  import { useSidebar } from "./context.svelte.js";
  import { customTitlebar } from "@/store";
  import { page } from "$app/state";

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
      "text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col",
      variant === "inset" ? "bg-transparent" : "bg-sidebar/60",
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
      class="bg-sidebar/60 text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden"
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
    class={cn(
      "text-sidebar-foreground group peer ssm:block hidden bg-transparent! hover:bg-transparent! focus:bg-transparent!",
      side === "right" && "flex flex-row-reverse",
    )}
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
        "relative w-(--sidebar-width) transition-[width] duration-200 ease-linear",
        $customTitlebar ? "min-h-[calc(100vh-2.5rem)]" : "h-svh",
        "group-data-[collapsible=offcanvas]:w-0",
        // "group-data-[side=right]:rotate-180!",
        side === "right" && "translate-x-10!",
        page.url.pathname === "/random"
          ? "w-0 p-0"
          : variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
      )}
    ></div>
    <div
      class={cn(
        "ssm:flex fixed inset-y-0 z-10 hidden w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear",
        $customTitlebar ? "min-h-[calc(100vh-2.5rem)]" : "h-svh",
        side === "left"
          ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
          : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
        // Adjust the padding for floating and inset variants.
        variant === "floating" || variant === "inset"
          ? "bg-transparent p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+10px)]"
          : "bg-sidebar/60 group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
        className,
      )}
      {...restProps}
    >
      <div
        data-sidebar="sidebar"
        class="bg-group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow"
      >
        {@render children?.()}
      </div>
    </div>
  </div>
{/if}
