<script lang="ts">
  import {
    Dialog as DialogPrimitive,
    type WithoutChildrenOrChild,
  } from "bits-ui";
  import X from "lucide-svelte/icons/x";
  import type { Snippet } from "svelte";
  import * as Dialog from "./index.js";
  import { cn } from "$lib/utils.js";
  import { theme } from "@/store";

  let {
    ref = $bindable(null),
    class: className,
    portalProps,
    children,
    ...restProps
  }: WithoutChildrenOrChild<DialogPrimitive.ContentProps> & {
    portalProps?: DialogPrimitive.PortalProps;
    children: Snippet;
  } = $props();
</script>

<Dialog.Portal {...portalProps}>
  <Dialog.Overlay />
  <DialogPrimitive.Content
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
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-50 data-[state=open]:zoom-in-50 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] bg-secondary/40 dark:bg-accent/50 fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-0.5 border-accent outline-none ring-0 focus-visible:outline-none focus-visible:ring-0 p-6 shadow-lg rounded-3xl duration-300 backdrop-blur-sm",
      $theme === "dark" && "dark",
      className
    )}
    {...restProps}
  >
    {@render children?.()}
    <DialogPrimitive.Close
      class="ring-offset-background focus:ring-ring absolute right-4 top-4 rounded-xl opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none dark:text-white"
    >
      <X class="size-5" />
      <span class="sr-only">Close</span>
    </DialogPrimitive.Close>
  </DialogPrimitive.Content>
</Dialog.Portal>
