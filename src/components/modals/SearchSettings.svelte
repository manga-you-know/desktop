<script lang="ts">
  import { Button, Checkbox, Dialog, Input, Label } from "@/lib/components";
  import type { SourceBrowse, SourceFilter } from "@/types/server";

  type Props = {
    open: boolean;
    sourceBrowse: SourceBrowse | undefined;
  };

  let { open = $bindable(false), sourceBrowse }: Props = $props();
</script>

{#snippet sourceFilter(filter: SourceFilter)}
  {#if filter.type === "CheckBoxFilter"}
    {let checkboxValue = $state(filter.CheckBoxFilterDefault)}
    <Button
      class="h-fit w-full justify-start gap-2 rounded-xl px-2"
      variant="ghost"
      onclick={() => {
        checkboxValue = !checkboxValue
        if (checkboxValue != filter.CheckBoxFilterDefault) {

        }
      }}
    >
      <Checkbox
        class="pointer-events-none"
        checked={checkboxValue}
      />
      <Label>{filter.name}</Label>
    </Button>
  {:else if filter.type === "HeaderFilter"}
    <Label>{filter.name + filter.type}</Label>
  {:else if filter.type === "SelectFilter"}
    <Label>{filter.name + filter.type}</Label>
  {:else if filter.type === "TriStateFilter"}
    {let checkboxValue = $state(filter.TriStateFilterDefault)}
    <Button
      class="h-fit w-full justify-start gap-2 rounded-xl px-2"
      variant="ghost"
      onclick={() => {
        // checkboxValue = !checkboxValue
        // if (checkboxValue != filter.CheckBoxFilterDefault) {
        //
        // }
      }}
    >
      <Checkbox
      indeterminate
      checked={checkboxValue}
        // class="pointer-events-none"
      />
      <Label>{filter.name}</Label>
    </Button>
  {:else if filter.type === "TextFilter"}
    <Input
      class="w-full"
      divClass="w-full"
      placeholder={filter.name}
      floatingLabel
      variant="outline"
      value={filter.TextFilterDefault}
      oninput={(e) => {
        if (e.currentTarget.value !== filter.TextFilterDefault) {
          
        }
      }}
      ondelete={() => {
        
      }}
    />
  {:else if filter.type === "SortFilter"}
    <Label>{filter.name + filter.type}</Label>
  {:else if filter.type === "SeparatorFilter"}
    <Label>{filter.name + filter.type}</Label>
  {:else if filter.type === "GroupFilter"}
    <Label>{filter.name}</Label>
    <div class="flex max-h-30 flex-col gap-1 overflow-y-scroll">
      {#each filter.filters as f}
        {@render sourceFilter(f)}
      {/each}
    </div>
  {/if}
{/snippet}

<Dialog.Root bind:open>
  <Dialog.Content
    class="slide-out-to-left-0! slide-in-from-left-0! data-[state=closed]:slide-out-to-bottom-full data-[state=open]:slide-in-from-bottom-full"
  >
    <Dialog.Header>
      <Dialog.Title>Search options</Dialog.Title>
      <Dialog.Description></Dialog.Description>
    </Dialog.Header>
    <div class="scrollbar flex flex-col gap-1 overflow-y-scroll">
      {#if sourceBrowse}
        {#each sourceBrowse.filters as filter (filter.name)}
          {@render sourceFilter(filter)}
        {/each}
      {:else}{/if}
    </div>
  </Dialog.Content>
</Dialog.Root>
