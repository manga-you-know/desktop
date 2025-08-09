<script lang="ts">
  import {
    AlertDialog as AlertDialogPrimitive,
    type WithoutChild,
  } from "bits-ui";
  import AlertDialogOverlay from "./alert-dialog-overlay.svelte";
  import { cn } from "$lib/utils.js";
  import {
    blackWhiteMode,
    brightness,
    contrast,
    customTitlebar,
    saturation,
    sepia,
    theme,
  } from "@/store";

  let {
    ref = $bindable(null),
    class: className,
    portalProps,
    overlay = true,
    overlayClass,
    ...restProps
  }: WithoutChild<AlertDialogPrimitive.ContentProps> & {
    portalProps?: AlertDialogPrimitive.PortalProps;
    overlay?: boolean;
    overlayClass?: string;
  } = $props();
</script>

<AlertDialogPrimitive.Portal {...portalProps}>
  {#if overlay}
    <AlertDialogOverlay
      class={cn(
        $customTitlebar && "mt-[2.5rem] max-h-[calc(100vh-2.5rem)]",
        overlayClass,
      )}
    />
  {/if}
  <AlertDialogPrimitive.Content
    onInteractOutside={(e) => {
      let el = e?.target as HTMLElement | null;
      if (
        el?.tagName === "BUTTON" ||
        el?.hasAttribute("data-tauri-drag-region")
      )
        e.preventDefault();
    }}
    interactOutsideBehavior="close"
    bind:ref
    class={cn(
      "filter-effects",
      "bg-accent/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-50 data-[state=open]:zoom-in-50 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg -translate-x-[50%] translate-y-[-50%] gap-4 border border-accent p-6 shadow-lg rounded-3xl outline-none ring-0 focus-visible:outline-none focus-visible:ring-0 duration-300 backdrop-blur-sm",
      $theme === "dark" && "dark",
      $blackWhiteMode && "grayscale",
      className,
    )}
    style="--contrast: {$contrast}; --brightness: {$brightness}; --saturation: {$saturation}; --sepia: {$sepia};"
    {...restProps}
  />
</AlertDialogPrimitive.Portal>

<style>
  :global(.filter-effects) {
    filter: contrast(var(--contrast)) brightness(var(--brightness))
      saturate(var(--saturation)) sepia(var(--sepia));
  }
</style>
