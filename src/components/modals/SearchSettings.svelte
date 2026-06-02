<script lang="ts">
  import {
    Badge,
    Button,
    Checkbox,
    Dialog,
    Input,
    Label,
  } from "@/lib/components";
  import { sourceFilterConfig } from "@/states";
  import type {
    FilterChange,
    SourceBrowse,
    SourceFilter,
  } from "@/types/server";
  import {
    CheckboxFilter,
    TextFilter,
    GroupFilter,
    HeadFilter,
    SelectFilter,
    SeparatorFilter,
    SortFilter,
    TriStateFilter,
  } from "../filters";

  type Props = {
    open: boolean;
    sourceBrowse: SourceBrowse | undefined;
    changes: FilterChange[];
  };

  let {
    open = $bindable(false),
    sourceBrowse,
    changes = $bindable([]),
  }: Props = $props();

  // let settingsPerfil = $state("auto")
  // let key = $derived(`${sourceBrowse?.id}-${settingsPerfil}` )

  $inspect(changes);
</script>

<Dialog.Root bind:open>
  <Dialog.Content
    class="slide-out-to-left-0! slide-in-from-left-0! data-[state=closed]:slide-out-to-bottom-full data-[state=open]:slide-in-from-bottom-full"
  >
    <Dialog.Header>
      <Dialog.Title>Source filters</Dialog.Title>
      <Dialog.Description></Dialog.Description>
    </Dialog.Header>
    <div class="scrollbar flex flex-col gap-1 overflow-y-scroll">
      {#if sourceBrowse}
        {#each sourceBrowse.filters as filter, index (index)}
          {#if filter.type === "CheckBoxFilter"}
            <CheckboxFilter {index} {filter} bind:changes />
          {:else if filter.type === "HeaderFilter"}
            <Label>{filter.name + filter.type}</Label>
          {:else if filter.type === "SelectFilter"}
            <Label>{filter.name + filter.type}</Label>
          {:else if filter.type === "TriStateFilter"}
            <Label>{filter.name + filter.type}</Label>
          {:else if filter.type === "TextFilter"}
            <TextFilter {index} {filter} bind:changes />
          {:else if filter.type === "SortFilter"}
            <Label>{filter.name + filter.type}</Label>
          {:else if filter.type === "SeparatorFilter"}
            <div class="bg-secondary/50 h-0.5 w-full rounded-xl"></div>
          {:else if filter.type === "GroupFilter"}
            <GroupFilter {index} {filter} bind:changes />
          {/if}
        {:else}
          <div class="w-full flex justify-center">
            <Badge
              class="text-base/5 w-60 whitespace-normal flex flex-col gap-2 p-4"
              variant="outline"
            >
              This source doesn't have search filters.
              <span class="text-3xl">┐(￣～￣)┌</span>
            </Badge>
          </div>
        {/each}
      {:else}
        <Badge>Failed fetching source search configs.</Badge>
      {/if}
    </div>
  </Dialog.Content>
</Dialog.Root>
