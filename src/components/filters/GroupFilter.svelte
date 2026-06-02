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

  const onchange = (change: FilterChange, remove: boolean) => {
    if (remove) {
      changes = changes.filter((c) =>
        "groupState" in c && c.position === index
          ? c.groupState.position !== change.position
          : true,
      );
    } else {
      const idx = changes.findIndex(
        (c) =>
          c.position === index &&
          ("groupState" in c
            ? c.groupState.position === change.position
            : false),
      );
      if (idx !== -1) {
        changes[idx] = {
          position: index,
          groupState: { position: change.position, state: change },
        };
      } else {
        changes.push({
          position: index,
          groupState: { position: change.position, state: change },
        });
      }
    }
  };
</script>

<Label>{filter.name}</Label>
<div class="flex max-h-30 flex-col gap-1 overflow-y-scroll">
  {#each filter.filters as f, i (i)}
    {#if f.type === "CheckBoxFilter"}
      <CheckboxFilter index={i} filter={f} changes={changesGroup} {onchange} />
    {:else if f.type === "TextFilter"}
      <TextFilter index={i} filter={f} changes={changesGroup} {onchange} />
    {/if}
  {/each}
</div>
