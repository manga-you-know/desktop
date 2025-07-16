<script lang="ts">
	import { ContextMenu as ContextMenuPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";
	import { theme } from "@/store";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: ContextMenuPrimitive.SubContentProps = $props();
</script>

<ContextMenuPrimitive.Portal>
	<ContextMenuPrimitive.SubContent
		bind:ref
		class={cn(
			"pointer-events-auto bg-secondary/60 backdrop-blur-sm text-popover-foreground z-50 w-[10rem] overflow-hidden rounded-xl border p-1 shadow-md focus:outline-none border-sidebar",
			className,
			$theme === "dark" && "dark",
		)}
		{...restProps}
	/>
</ContextMenuPrimitive.Portal>
