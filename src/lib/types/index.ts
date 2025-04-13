import type {
  InputVariant,
  InputBorderFocus,
} from "@/lib/components/ui/input/input.svelte";
import type { SvelteComponent } from "svelte";
import type { HTMLInputAttributes } from "svelte/elements";

export type {
  InputVariant,
  InputBorderFocus,
} from "@/lib/components/ui/input/input.svelte";
export type SvelteInput = SvelteComponent<
  HTMLInputAttributes & { ref?: HTMLElement | null | undefined } & {
    variant?: InputVariant;
    borderFocus?: InputBorderFocus;
  }
> & { $$bindings: "ref" | "value" };
