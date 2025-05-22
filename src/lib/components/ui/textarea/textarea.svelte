<script lang="ts" module>
  import type { WithElementRef, WithoutChildren } from "bits-ui";
  import type { HTMLTextareaAttributes } from "svelte/elements";
  import { type VariantProps, tv } from "tailwind-variants";
  import { cn } from "$lib/utils.js";

  export const textareaVariants = tv({
    base: "flex min-h-[60px] w-full rounded-xl px-3 py-2 text-base shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 md:text-sm autofill:none dark:text-white peer",
    variants: {
      variant: {
        default:
          "border border-input bg-primary text-primary-foreground dark:text-black placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary",
        destructive:
          "border border-destructive bg-destructive text-destructive-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-destructive",
        outline:
          "border border-input bg-transparent text-primary placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary",
        secondary:
          "border border-secondary bg-secondary text-secondary-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-secondary",
        ghost:
          "bg-transparent text-primary hover:bg-accent hover:text-accent-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-accent",
        link: "bg-transparent text-primary underline-offset-4 hover:underline placeholder:text-muted-foreground focus-visible:ring-0 ring-0 shadow-none",
      },
      borderFocus: {
        true: "focus-visible:outline-none",
        false: "focus-visible:outline-none focus-visible:ring-0",
      },
    },
    defaultVariants: {
      variant: "default",
      borderFocus: false,
    },
  });

  export type TextareaVariant = VariantProps<
    typeof textareaVariants
  >["variant"];
  export type TextareaBorderFocus = VariantProps<
    typeof textareaVariants
  >["borderFocus"];

  export type TextareaProps = WithoutChildren<
    WithElementRef<HTMLTextareaAttributes>
  > & {
    variant?: TextareaVariant;
    borderFocus?: TextareaBorderFocus;
    floatingLabel?: boolean;
    labelClass?: string;
    divClass?: string;
  };
</script>

<script lang="ts">
  let {
    ref = $bindable(null),
    value = $bindable(),
    class: className,
    labelClass,
    divClass,
    variant = "default",
    borderFocus = false,
    floatingLabel = false,
    placeholder,
    ...restProps
  }: TextareaProps = $props();

  const textareaId = `textarea-${Math.random().toString(36).substring(2, 11)}`;

  export function clear() {
    value = "";
  }
</script>

<div class={cn(divClass, "relative")}>
  <textarea
    bind:this={ref}
    id={textareaId}
    class={cn(textareaVariants({ variant, borderFocus, className }))}
    bind:value
    {...restProps}
    placeholder={floatingLabel ? "" : placeholder}
    autocomplete="off"
  ></textarea>
  {#if floatingLabel && placeholder}
    <label
      for={textareaId}
      class={cn(
        labelClass,
        value?.toString().length === 0
          ? "!translate-y-0 !top-[10%] !scale-100 "
          : "bg-white dark:bg-background",
        "absolute select-none text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 peer-focus:px-2 peer-focus:text-gray-500 peer-focus:dark:text-gray-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 peer-focus:bg-white peer-focus:dark:bg-background rounded-xl"
      )}
      >{placeholder}
    </label>
  {/if}
</div>
