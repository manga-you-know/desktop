<script lang="ts">
  import { Input } from "@/lib/components";
  import type { TextFilter, FilterChange } from "@/types/server";

  type Props = {
    index: number;
    filter: TextFilter;
    changes: FilterChange[];
    onchange?: () => void;
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
    changes = changes.filter((c) => c.position !== index);
    changes.push({
      position: index,
      textState: e.currentTarget.value,
    });
    onchange?.();
  }}
  ondelete={() => {
    changes = changes.filter((c) => c.position !== index);
    onchange?.();
  }}
  oncopy={(text) => {
    changes = changes.filter((c) => c.position !== index);
    changes.push({
      position: index,
      //@ts-ignore
      textState: text,
    });
    onchange?.();
  }}
/>
