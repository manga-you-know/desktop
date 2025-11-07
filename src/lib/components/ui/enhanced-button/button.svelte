<script lang="ts" module>
  import { cn } from "$lib/utils";
  import { cva, type VariantProps } from "class-variance-authority";
  import type { HTMLButtonAttributes } from "svelte/elements";

  export const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none  disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 select-none !active:scale-75 cursor-pointer",
    {
      variants: {
        variant: {
          default: "bg-primary text-background hover:bg-primary/80",
          info: "bg-info text-white hover:bg-info/60",
          destructive:
            "bg-destructive text-destructive-foreground hover:bg-destructive/90",
          outline:
            "border border-secondary bg-background/30 hover:bg-secondary text-primary",
          secondary: "bg-secondary text-primary hover:bg-secondary/80",
          ghost: "hover:bg-secondary text-primary",
          link: "text-primary underline-offset-4 hover:underline",
          elevated:
            "bg-background shadow-md -translate-y-[3px] shadow-accent transition-all duration-200 border border-border/50 bg-accent text-accent-foreground text-slate-200",
          elevatedHover:
            "bg-background shadow-none hover:shadow-md hover:shadow-accent  hover:-translate-y-[3px] transition-all duration-200 border border-border/50 hover:bg-secondary/80 hover:text-accent-foreground dark:text-slate-200",
        },
        effect: {
          expandIcon: "group gap-0 relative",
          ringHover:
            "transition-all duration-300 hover:ring-2 hover:ring-primary/90 hover:ring-offset-2",
          ringHoverSecondary:
            "transition-all duration-300 hover:ring-2 hover:ring-secondary/90 hover:ring-offset-2 hover:ring-offset-background",
          ringHoverInfo:
            "transition-all duration-300 hover:ring-2 hover:ring-info/90 hover:ring-offset-2",
          ringHoverDestructive:
            "transition-all duration-300 hover:ring-2 hover:ring-destructive/90 hover:ring-offset-2",
          shine:
            "before:animate-shine relative overflow-hidden before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.5)_50%,transparent_75%,transparent_100%)] before:bg-size-[250%_250%,100%_100%] before:bg-no-repeat background-position_0s_ease",
          shineHover:
            "relative overflow-hidden before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.5)_50%,transparent_75%,transparent_100%)] before:bg-size-[250%_250%,100%_100%] before:bg-position-[200%_0,0_0] before:bg-no-repeat before:transition-[background-position_0s_ease] hover:before:bg-position-[-100%_0,0_0] before:duration-1000",
          gooeyRight:
            "relative z-0 overflow-hidden transition-all duration-500 before:absolute before:inset-0 before:-z-10 before:translate-x-[150%] before:translate-y-[150%] before:scale-[2.5] before:rounded-[100%] before:bg-linear-to-r from-white/40 before:transition-transform before:duration-1000  hover:before:translate-x-[0%] hover:before:translate-y-[0%]",
          gooeyLeft:
            "relative z-0 overflow-hidden transition-all duration-500 after:absolute after:inset-0 after:-z-10 after:translate-x-[-150%] after:translate-y-[150%] after:scale-[2.5] after:rounded-[100%] after:bg-linear-to-l from-white/40 after:transition-transform after:duration-1000  hover:after:translate-x-[0%] hover:after:translate-y-[0%]",
          underline:
            "relative no-underline! after:absolute after:bg-primary after:bottom-2 after:h-px after:w-2/3 after:origin-bottom-left after:scale-x-100 hover:after:origin-bottom-right hover:after:scale-x-0 after:transition-transform after:ease-in-out after:duration-300",
          hoverUnderline:
            "relative no-underline! after:absolute after:bg-primary after:bottom-2 after:h-px after:w-2/3 after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:ease-in-out after:duration-300",
          elevated:
            "shadow-lg hover:shadow-none hover:-translate-y-px transition-all duration-200",
          elevatedHover:
            "shadow-none hover:shadow-lg hover:-translate-y-px transition-all duration-200",
        },
        size: {
          default: "h-10 px-4 py-2",
          sm: "h-9 rounded-xl px-3",
          lg: "h-11 rounded-md px-8",
          icon: "h-10 w-10",
        },
      },
      defaultVariants: {
        variant: "default",
        size: "default",
      },
    },
  );

  export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
  export type ButtonEffect = VariantProps<typeof buttonVariants>["effect"];
  export type ButtonSize = VariantProps<typeof buttonVariants>["size"];
  export type ButtonProps = {
    variant?: ButtonVariant;
    effect?: ButtonEffect;
    size?: ButtonSize;
    icon?: any; // Replace with your icon type
    iconPlacement?: "left" | "right";
    class?: string;
    ref?: HTMLButtonElement;
  } & HTMLButtonAttributes;

  export let ref: HTMLButtonElement;
</script>

<script lang="ts">
  interface $$Props extends HTMLButtonAttributes {
    variant?: VariantProps<typeof buttonVariants>["variant"];
    effect?: VariantProps<typeof buttonVariants>["effect"];
    size?: VariantProps<typeof buttonVariants>["size"];
    icon?: any; // Replace with your icon type
    iconPlacement?: "left" | "right";
    class?: string;
    ref?: HTMLButtonElement;
  }

  export let variant: $$Props["variant"] = "default";
  export let effect: $$Props["effect"] = undefined;
  export let size: $$Props["size"] = "default";
  export let icon: $$Props["icon"] = undefined;
  export let iconPlacement: $$Props["iconPlacement"] = "left";
  export let ref: $$Props["ref"] = undefined;

  export { className as class };
  let className = "";
</script>

<button
  bind:this={ref}
  class={cn(buttonVariants({ variant, effect, size }), className)}
  {...$$restProps}
  tabindex={-1}
  onfocus={(e) => e.currentTarget.blur()}
>
  {#if icon && iconPlacement === "left"}
    {#if effect === "expandIcon"}
      <div
        class="w-0 translate-x-[0%] pr-0 opacity-0 transition-all duration-200 group-hover:w-5 group-hover:translate-x-100 group-hover:pr-2 group-hover:opacity-100"
      >
        <svelte:component this={icon} />
      </div>
    {:else}
      <svelte:component this={icon} />
    {/if}
  {/if}

  <slot />

  {#if icon && iconPlacement === "right"}
    {#if effect === "expandIcon"}
      <div
        class="w-0 translate-x-full pl-0 opacity-0 transition-all duration-200 group-hover:w-5 group-hover:translate-x-0 group-hover:pl-2 group-hover:opacity-100"
      >
        <svelte:component this={icon} />
      </div>
    {:else}
      <svelte:component this={icon} />
    {/if}
  {/if}
</button>
