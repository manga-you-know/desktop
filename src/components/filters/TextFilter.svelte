<script lang="ts">
  import { Input } from "@/lib/components";
  import type { TextFilter, FilterChange } from "@/types/server";

  type Props = {
    index: number;
    filter: TextFilter;
    changes: FilterChange[];
    onchange?: (change: FilterChange, remove: boolean) => void;
  };

  let {
    index,
    filter = $bindable(),
    changes = $bindable([]),
    onchange,
  }: Props = $props();
</script>

<Input
  class="w-full"
  divClass="w-full"
  placeholder={filter.name}
  floatingLabel
  variant="link"
  value={filter.TextFilterDefault}
  oninput={(e) => {
    const value = {
      position: index,
      textState: e.currentTarget.value,
    };
    const idx = changes.findIndex((c) => c.position === index);
    if (e.currentTarget.value !== filter.TextFilterDefault) {
      if (idx === -1) {
        changes.push(value);
      } else {
        changes[idx] = value;
      }
      onchange?.(value, false);
    } else {
      changes = changes.filter((c) => c.position !== index);
      onchange?.(value, true);
    }
  }}
  ondelete={() => {}}
/>
