<script lang="ts">
  import { Pagination as PaginationPrimitive } from "bits-ui";
  import { cn } from "$lib/utils.js";
  import { type Props } from "@/lib/components";
  import { buttonVariants } from "@/lib/components";

  let {
    ref = $bindable(null!),
    class: className,
    size = "icon",
    isActive = false,
    variant,
    page,
    children,
    ...restProps
  }: PaginationPrimitive.PageProps &
    Props & {
      isActive: boolean;
    } = $props();
</script>

{#snippet Fallback()}
  {page.value}
{/snippet}

<PaginationPrimitive.Page
  bind:ref
  {page}
  class={cn(
    buttonVariants({
      variant,
      size,
    }),
    className
  )}
  children={children || Fallback}
  {...restProps}
/>
