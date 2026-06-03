<script lang="ts">
  import { Button, Checkbox, Label } from "@/lib/components";
  import type { CheckBoxFilter, FilterChange } from "@/types/server";

  type Props = {
    index: number;
    filter: CheckBoxFilter;
    changes: FilterChange[];
    onchange?: () => void;
  };

  let {
    index,
    filter = $bindable(),
    changes = $bindable([]),
    onchange,
  }: Props = $props();

  let checked = $derived(
    changes.find(
      (c): c is Extract<FilterChange, { checkBoxState: boolean }> =>
        "checkBoxState" in c && c.position === index,
    )?.checkBoxState ?? filter.CheckBoxFilterDefault,
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
    } else {
      changes = changes.filter((c) => c.position !== index);
    }
    onchange?.();
  }}
>
  <Checkbox class="pointer-events-none" {checked} />
  <Label class="cursor-pointer">{filter.name}</Label>
</Button>
