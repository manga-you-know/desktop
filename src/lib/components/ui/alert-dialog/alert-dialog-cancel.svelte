<script lang="ts">
  import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
  import { buttonVariants } from "@/lib/components";
  import { cn } from "$lib/utils.js";

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: AlertDialogPrimitive.CancelProps = $props();
</script>

<AlertDialogPrimitive.Cancel
  bind:ref
  class={cn(buttonVariants({ variant: "outline" }), className)}
  {...restProps}
/>
