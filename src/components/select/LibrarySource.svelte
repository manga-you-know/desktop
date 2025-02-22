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
  import { FavoriteRepository } from "@/repositories";
  import Icon from "@iconify/svelte";
  import { onMount } from "svelte";

  let open = $state(false);
  let triggerRef = $state<HTMLButtonElement>(null!);
  let sources: string[] = $state([]);
  async function refreshSources() {
    sources = await FavoriteRepository.getFavoriteSources();
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
          class="w-36 justify-between focus:none"
          {...props}
          role="combobox"
          aria-expanded={open}
          disabled={sources.length === 0}
          tabindex={-1}
        >
          <Label
            class={`w-full text-sm text-center ml-[-4px] ${$librarySource === "" ? "dark:text-gray-400" : ""}`}
          >
            {$librarySource || "Filter by source..."}
          </Label>
        </Button>
      {/snippet}
    </Popover.Trigger>
    <Popover.Content class="w-36 p-0">
      <Command.Root class="dark:bg-black">
        <div class="flex">
          <Command.Input placeholder="Search source..." class="h-9" />
          <Command.Item
            class="hover:bg-slate-300 dark:hover:bg-slate-700"
            disabled={$librarySource === ""}
            onSelect={() => {
              open = false;
              librarySource.set("");
              refreshLibrary();
            }}
          >
            <Icon icon="lucide:x" />
          </Command.Item>
        </div>
        <Command.Empty class="mb-[-68px]">No source found.</Command.Empty>
        <ScrollArea class="h-36">
          <Command.Group>
            {#each sources as source}
              <Command.Item
                class={`w-full flex justify-between hover:!bg-slate-300 dark:hover:!bg-slate-800 ${source === $librarySource ? "!bg-slate-400 dark:!bg-gray-900" : "aria-selected:bg-slate-400 dark:aria-selected:bg-inherit"}`}
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
</div>
