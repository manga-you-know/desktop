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
  } from "@/store";
  import { themeMode } from "@/states";

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
        $customTitlebar && "mt-10 max-h-[calc(100vh-2.5rem)]",
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
      "bg-accent/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0  data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 border-accent fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg -translate-x-[50%] translate-y-[-50%] gap-4 rounded-3xl border p-6 shadow-lg ring-0 backdrop-blur-sm duration-300 outline-none focus-visible:ring-0 focus-visible:outline-none",
      themeMode.value === "dark" && "dark",
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
