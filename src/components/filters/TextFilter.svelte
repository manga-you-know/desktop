<script lang="ts">
  import { Button, Input } from "@/lib/components";
  import type { TextFilter, FilterChange } from "@/types/server";
  import Icon from "@iconify/svelte";
  import { readText } from "@tauri-apps/plugin-clipboard-manager";

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

  let value = $state(filter.TextFilterDefault);
</script>

<div
  class="border-primary flex w-full items-center justify-center gap-1 border-b"
>
  <Input
    class="w-full hover:bg-transparent"
    divClass="w-full"
    placeholder={filter.name}
    floatingLabel
    variant="ghost"
    bind:value
    oninput={() => {
      changes = changes.filter((c) => c.position !== index);
      changes.push({
        position: index,
        textState: value,
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
  <Button
    class="rounded-lg"
    variant="ghost"
    onclick={async () => {
      value = await readText();
      changes = changes.filter((c) => c.position !== index);
      changes.push({
        position: index,
        //@ts-ignore
        textState: text,
      });
      onchange?.();
    }}
  >
    <Icon icon="lucide:clipboard-paste" />
  </Button>
</div>
