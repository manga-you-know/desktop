<script lang="ts">
  import { Accordion as AccordionPrimitive, type WithoutChild } from "bits-ui";
  import ChevronDown from "lucide-svelte/icons/chevron-down";
  import { cn } from "$lib/utils.js";

  let {
    ref = $bindable(null),
    class: className,
    level = 2,
    endText = "",
    children,
    ...restProps
  }: WithoutChild<AccordionPrimitive.TriggerProps> & {
    level?: AccordionPrimitive.HeaderProps["level"];
    endText?: string;
  } = $props();
</script>

<AccordionPrimitive.Header {level} class="flex">
  <AccordionPrimitive.Trigger
    bind:ref
    class={cn(
      "flex flex-1 items-between justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>div>svg]:rotate-180",
      className
    )}
    {...restProps}
  >
    {@render children?.()}
    <div class="flex items-center gap-1">
      {endText}
      <ChevronDown class="size-5 shrink-0 transition-transform duration-200" />
    </div>
  </AccordionPrimitive.Trigger>
</AccordionPrimitive.Header>
