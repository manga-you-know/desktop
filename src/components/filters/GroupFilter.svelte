<script lang="ts">
  import { Badge, Button, Label } from "@/lib/components";
  import type { GroupFilter, FilterChange } from "@/types/server";
  import { CheckboxFilter, TextFilter } from ".";
  import Icon from "@iconify/svelte";
  import { cn } from "@/lib/utils";
  import { slide } from "svelte/transition";

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
  let expanded = $state(false);

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

<Button
  class="bg-secondary/70 group/extension hover:bg-secondary/40 mr-2 flex h-8 w-full items-center justify-between gap-2 rounded-lg p-2 hover:no-underline!"
  variant="link"
  onclick={() => {
    expanded = !expanded;
  }}
>
  <Label class="cursor-pointer text-wrap whitespace-normal">
    {filter.name}
  </Label>
  <div class="flex items-center justify-center gap-2">
    <Badge class="h-7 w-24 rounded-lg text-sm" variant="outline">
      {filter.filters.length} filters
    </Badge>
    <Icon
      class={cn(
        "size-5! transition-all duration-400",
        !expanded && "-rotate-180",
      )}
      icon="lucide:chevron-up"
    />
  </div>
</Button>
<div class="flex flex-col pl-1">
  {#each expanded ? filter.filters : [] as f, i (i)}
    <div
      class="pb-0.5"
      in:slide={{ duration: filter.filters.length < 100 ? 400 : 0 }}
      out:slide={{ duration: filter.filters.length < 100 ? 400 : 0 }}
    >
      {#if f.type === "CheckBoxFilter"}
        <CheckboxFilter
          index={i}
          filter={f}
          bind:changes={changesGroup}
          {onchange}
        />
      {:else if f.type === "TextFilter"}
        <TextFilter
          index={i}
          filter={f}
          bind:changes={changesGroup}
          {onchange}
        />
      {/if}
    </div>
  {/each}
</div>
