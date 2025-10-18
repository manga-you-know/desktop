<script lang="ts">
  import { themeMode } from "@/states";
  import {
    Toaster as Sonner,
    type ToasterProps as SonnerProps,
  } from "svelte-sonner";

  let { ...restProps }: SonnerProps = $props();
</script>

<!---->
<!-- <Sonner -->
<!--   class="toaster group" -->
<!--   toastOptions={{ -->
<!--     classes: { -->
<!--       toast: -->
<!--         "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg", -->
<!--       description: "group-[.toast]:text-muted-foreground", -->
<!--       actionButton: -->
<!--         "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground", -->
<!--       cancelButton: -->
<!--         "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground", -->
<!--     }, -->
<!--   }} -->
<!--   {...restProps} -->
<!-- /> -->
<!---->

<Sonner
  theme={themeMode.value}
  class="toaster group"
  style="--normal-bg: var(--color-popover); --normal-text: var(--color-popover-foreground); --normal-border: var(--color-border);"
  {...restProps}
/>
