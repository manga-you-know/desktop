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
  import { MarkDB } from "@/repositories";
  import Icon from "@iconify/svelte";
  import { onMount } from "svelte";
  import type { Mark } from "@/types";
  import { limitStr } from "@/utils";

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
          onwheel={(e) => {
            if (e.deltaY < 0) {
              if ($libraryCollection === undefined) {
                libraryCollection.set($collections.at(0));
              } else {
                libraryCollection.set(
                  $collections.at(
                    $collections.findIndex(
                      (c) => c.id === $libraryCollection.id
                    ) + 1
                  )
                );
              }
            } else {
              if ($libraryCollection === undefined) {
                libraryCollection.set($collections.at(-1));
              } else {
                libraryCollection.set(
                  $collections.at(
                    $collections.findIndex(
                      (c) => c.id === $libraryCollection.id
                    ) - 1
                  )
                );
              }
            }
            refreshLibrary();
          }}
          onmouseup={(e) => {
            if (e.button === 1) {
              open = false;
              libraryCollection.set(undefined);
              refreshLibrary();
            }
          }}
        >
          <Label
            class="!w-36 text-sm text-center ml-[-4px] text-ellipsis    
            {$libraryCollection === undefined ? 'dark:text-gray-400' : ''}"
          >
            {limitStr(
              $libraryCollection?.name ?? "Filter by collection...",
              16
            )}
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
                class="w-full flex justify-between hover:!bg-slate-300 dark:hover:!bg-slate-800 {collection ===
                $libraryCollection
                  ? '!bg-slate-400 dark:!bg-gray-900'
                  : 'aria-selected:bg-slate-400 dark:aria-selected:bg-inherit'}"
                value={collection.name}
                onSelect={async () => {
                  libraryCollection.set(collection);
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
    disabled={$libraryCollection === undefined}
    onclick={() => {
      open = false;
      libraryCollection.set(undefined);
      refreshLibrary();
    }}
  >
    <Icon icon="lucide:x" />
  </Button>
</div>
