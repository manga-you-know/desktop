<script lang="ts" module>
  import type { HTMLInputAttributes } from "svelte/elements";
  import type { WithElementRef } from "bits-ui";
  import { type VariantProps, tv } from "tailwind-variants";
  import { cn } from "$lib/utils.js";
  import { readText } from "tauri-plugin-clipboard-api";

  export const inputVariants = tv({
    base: "flex h-10 text-sm font-medium rounded-2xl px-3 py-1 text-base shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 md:text-sm autofill:none dark:text-white peer",
    variants: {
      variant: {
        default:
          "border border-input bg-primary text-primary-foreground dark:text-black placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary",
        destructive:
          "border border-destructive bg-destructive text-destructive-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-destructive",
        outline:
          "border border-secondary bg-background/30 hover:bg-secondary text-primary placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary",
        secondary:
          "border border-secondary bg-secondary text-secondary-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-secondary",
        ghost:
          "bg-transparent text-primary hover:bg-accent hover:text-accent-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-accent",
        link: "bg-transparent text-primary underline-offset-4 hover:underline underline-primary placeholder:text-muted-foreground focus-visible:ring-0 ring-0 shadow-none ",
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

  export type InputVariant = VariantProps<typeof inputVariants>["variant"];
  export type InputBorderFocus = VariantProps<
    typeof inputVariants
  >["borderFocus"];

  export type InputProps = WithElementRef<HTMLInputAttributes> & {
    variant?: InputVariant;
    borderFocus?: InputBorderFocus;
    floatingLabel?: boolean;
    rightToCopy?: boolean;
    labelClass?: string;
    divClass?: string;
    onenter?: VoidFunction;
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
    rightToCopy = true,
    required = false,
    onenter,
    disabled,
    placeholder,
    ...restProps
  }: InputProps = $props();

  export function clear() {
    value = "";
  }

  const inputId = `input-${Math.random().toString(36).substring(2, 11)}`;
</script>

<button
  class={cn(
    divClass,
    "relative focus-visible:ring-0 ring-0",
    disabled ? "cursor-default" : "cursor-text!",
    variant === "link" && value !== "" && "underline decoration-primary",
    variant === "outline" && "bg-transparent",
  )}
  onclick={() => {
    if (!disabled) {
      ref?.focus();
    }
  }}
  oncontextmenu={async () => {
    if (rightToCopy) value = await readText();
  }}
  tabindex={-1}
>
  <input
    bind:this={ref}
    id={inputId}
    class={cn(
      inputVariants({
        variant: !required || value.length > 0 ? variant : "destructive",
        borderFocus,
        className,
      }),
    )}
    bind:value
    {...restProps}
    {disabled}
    placeholder={floatingLabel ? "" : placeholder}
    autocomplete="off"
    onkeydown={(e) => {
      if (e.key === "Enter") {
        onenter?.();
      }
    }}
  />
  {#if floatingLabel && placeholder}
    <label
      for={inputId}
      class={cn(
        labelClass,
        disabled ? "cursor-not-allowed" : "cursor-text",
        value === "" && "translate-y-0! top-[25%]! scale-100!",
        "text-sm font-medium absolute select-none text-gray-800 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-left px-2 peer-focus:px-2 peer-focus:text-gray-900 peer-focus:dark:text-gray-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1",
      )}
      >{placeholder}
    </label>
  {/if}
</button>
