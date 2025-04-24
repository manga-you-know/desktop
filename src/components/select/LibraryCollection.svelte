<script lang="ts">
  import {
    Button,
    Command,
    Label,
    Popover,
    ScrollArea,
  } from "@/lib/components";
  import { libraryFavorites, libraryCollection, collections } from "@/store";
  import { refreshCollections, refreshLibrary } from "@/functions";
  import { MarkRepository } from "@/repositories";
  import Icon from "@iconify/svelte";
  import { onMount } from "svelte";
  import type { Mark } from "@/types";

  let open = $state(false);
  let triggerRef = $state<HTMLButtonElement>(null!);
  onMount(async () => {
    await refreshCollections();
  });
</script>

<div class="inline-flex">
  <Popover.Root bind:open>
    <Popover.Trigger bind:ref={triggerRef}>
      {#snippet child({ props })}
        <Button
          variant="outline"
          class="w-36 justify-between rounded-r-none focus:none "
          {...props}
          role="combobox"
          aria-expanded={open}
          disabled={$collections.length === 0}
          tabindex={-1}
        >
          <Label
            class="w-full text-sm text-center ml-[-4px] 
            {$libraryCollection === '' ? 'dark:text-gray-400' : ''}"
          >
            {$libraryCollection || "Filter by collection..."}
          </Label>
        </Button>
      {/snippet}
    </Popover.Trigger>
    <Popover.Content class="w-[11rem] ml-7 p-0">
      <Command.Root class="dark:bg-black">
        <Command.Input placeholder="Search collection..." />
        <Command.Empty class="mb-[-68px]">No collection found.</Command.Empty>
        <ScrollArea class="h-36">
          <Command.Group>
            {#each $collections.reverse() as collection}
              <Command.Item
                class="w-full flex justify-between hover:!bg-slate-300 dark:hover:!bg-slate-800 {collection.name ===
                $libraryCollection
                  ? '!bg-slate-400 dark:!bg-gray-900'
                  : 'aria-selected:bg-slate-400 dark:aria-selected:bg-inherit'}"
                value={collection.name}
                onSelect={async () => {
                  libraryCollection.set(collection.name);
                  open = false;
                  await refreshLibrary();
                }}
              >
                <Label class="w-full text-center text-sm"
                  >{collection.name}</Label
                >
              </Command.Item>
            {/each}
          </Command.Group>
        </ScrollArea>
      </Command.Root>
    </Popover.Content>
  </Popover.Root>
  <Button
    variant="secondary"
    class="w-8 rounded-l-none"
    disabled={$libraryCollection === ""}
    onclick={() => {
      open = false;
      libraryCollection.set("");
      refreshLibrary();
    }}
  >
    <Icon icon="lucide:x" />
  </Button>
</div>
