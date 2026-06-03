<script lang="ts">
  import { Label } from "@/lib/components";
  import type { GroupFilter, FilterChange } from "@/types/server";
  import { CheckboxFilter, TextFilter } from ".";

  type Props = {
    index: number;
    filter: GroupFilter;
    changes: FilterChange[];
  };

  let {
    index,
    filter = $bindable(),
    changes = $bindable([]),
  }: Props = $props();

  let changesGroup: FilterChange[] = $state([]);

  const onchange = () => {
    changes = changes.filter((c) => c.position != index);
    changesGroup.forEach((c) => {
      changes.push({
        position: index,
        groupChange: c,
      });
    });
  };
</script>

<Label>{filter.name}</Label>
<div class="flex max-h-30 flex-col gap-1 overflow-y-scroll">
  {#each filter.filters as f, i (i)}
    {#if f.type === "CheckBoxFilter"}
      <CheckboxFilter
        index={i}
        filter={f}
        bind:changes={changesGroup}
        {onchange}
      />
    {:else if f.type === "TextFilter"}
      <TextFilter index={i} filter={f} bind:changes={changesGroup} {onchange} />
    {/if}
  {/each}
</div>
