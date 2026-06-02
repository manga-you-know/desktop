<script lang="ts">
  import { Button, Checkbox, Label } from "@/lib/components";
  import type { CheckBoxFilter, FilterChange } from "@/types/server";

  type Props = {
    index: number;
    filter: CheckBoxFilter;
    changes: FilterChange[];
    onchange?: (change: FilterChange, remove: boolean) => void;
  };

  let {
    index,
    filter = $bindable(),
    changes = $bindable([]),
    onchange,
  }: Props = $props();

  let checked = $derived(
    changes.find((e) => e.position === index)?.checkBoxState ??
      filter.CheckBoxFilterDefault,
  );
</script>

<Button
  class="h-fit w-full justify-start gap-2 rounded-xl px-2"
  variant="ghost"
  onclick={() => {
    const change = {
      position: index,
      checkBoxState: !checked,
    };
    if (checked === filter.CheckBoxFilterDefault) {
      changes.push(change);
      onchange?.(change, false);
    } else {
      changes = changes.filter((c) => c.position !== index);
      onchange?.(change, true);
    }
  }}
>
  <Checkbox class="pointer-events-none" {checked} />
  <Label class="cursor-pointer">{filter.name}</Label>
</Button>
