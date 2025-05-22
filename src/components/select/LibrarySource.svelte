<script lang="ts">
  import {
    Button,
    Command,
    Label,
    Popover,
    ScrollArea,
  } from "@/lib/components";
  import { libraryFavorites, librarySource } from "@/store";
  import { refreshLibrary } from "@/functions";
  import { FavoriteDB } from "@/repositories";
  import Icon from "@iconify/svelte";
  import { onMount } from "svelte";

  let open = $state(false);
  let triggerRef = $state<HTMLButtonElement>(null!);
  let sources: string[] = $state([]);
  async function refreshSources() {
    sources = await FavoriteDB.getFavoriteSources();
  }
  libraryFavorites.subscribe(async (_) => {
    await refreshSources();
  });
  onMount(async () => {
    await refreshSources();
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
          disabled={sources.length === 0}
          tabindex={-1}
          onwheel={(e) => {
            if (e.deltaY < 0) {
              if ($librarySource === "") {
                librarySource.set(sources.at(0) || "");
              } else {
                librarySource.set(
                  sources.at(
                    sources.findIndex((s) => s === $librarySource) + 1
                  ) ?? ""
                );
              }
            } else {
              if ($librarySource === "") {
                librarySource.set(sources.at(-1) || "");
              } else {
                librarySource.set(
                  sources.at(
                    sources.findIndex((s) => s === $librarySource) - 1
                  ) ?? ""
                );
              }
            }
            refreshLibrary();
          }}
          onmouseup={(e) => {
            if (e.button === 1) {
              open = false;
              librarySource.set("");
              refreshLibrary();
            }
          }}
        >
          <Label
            class="w-full text-sm text-center ml-[-4px] cursor-pointer {$librarySource ===
            ''
              ? 'dark:text-gray-400'
              : ''}"
          >
            {$librarySource || "Filter by source..."}
          </Label>
        </Button>
      {/snippet}
    </Popover.Trigger>
    <Popover.Content class="w-[11rem] ml-7 p-0">
      <Command.Root class="dark:bg-background">
        <Command.Input placeholder="Search source..." />
        <Command.Empty class="mb-[-68px]">No source found.</Command.Empty>
        <ScrollArea class="h-36">
          <Command.Group>
            {#each sources.toReversed() as source}
              <Command.Item
                class="w-full flex justify-between hover:!bg-slate-300 dark:hover:!bg-secondary/50
                {source === $librarySource
                  ? '!bg-slate-400 dark:!bg-secondary'
                  : 'aria-selected:bg-slate-400 dark:aria-selected:bg-inherit'}"
                value={source}
                onSelect={async () => {
                  librarySource.set(source);
                  open = false;
                  await refreshLibrary();
                }}
              >
                <Label class="w-full text-center text-sm">{source}</Label>
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
    disabled={$librarySource === ""}
    onclick={() => {
      open = false;
      librarySource.set("");
      refreshLibrary();
    }}
  >
    <Icon icon="lucide:x" />
  </Button>
</div>
