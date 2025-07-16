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
  import { IS_MOBILE } from "@/constants";
  import { cn } from "@/lib/utils";

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

  let { class: className }: { class?: string } = $props();
</script>

<div class={cn("inline-flex relative", className)}>
  <Popover.Root bind:open>
    <Popover.Trigger bind:ref={triggerRef}>
      {#snippet child({ props })}
        <Button
          variant="outline"
          class="w-32 justify-between focus:none pr-2"
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
                    sources.findIndex((s) => s === $librarySource) + 1,
                  ) ?? "",
                );
              }
            } else {
              if ($librarySource === "") {
                librarySource.set(sources.at(-1) || "");
              } else {
                librarySource.set(
                  sources.at(
                    sources.findIndex((s) => s === $librarySource) - 1,
                  ) ?? "",
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
          <div class="inline-flex justify-between items-center w-full gap-0.5">
            <div class="flex w-full justify-center">
              <Label
                class="text-sm truncate flex items-center cursor-pointer {$librarySource ===
                ''
                  ? 'dark:text-gray-400'
                  : ''}"
              >
                {$librarySource || "Select source"}
              </Label>
            </div>
            <Icon class="!w-4 text-gray-500" icon="lucide:chevron-down" />
          </div>
        </Button>
      {/snippet}
    </Popover.Trigger>
    <Popover.Content class="w-[10rem] p-0">
      <Command.Root>
        <Command.Input
          placeholder="Search source..."
          tabindex={IS_MOBILE ? -1 : 1}
        />
        <Command.Empty class="-mb-[68px]">No source found.</Command.Empty>
        <ScrollArea class="h-36">
          <Command.Group>
            {#each sources.toReversed() as source}
              <Command.Item
                class="w-full rounded-xl flex justify-between hover:!bg-slate-300 dark:hover:!bg-secondary/50
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
    class={cn(
      "!size-6 px-0 absolute -top-0.5 right-0 transition-all duration-300 opacity-0",
      $librarySource !== "" ? "opacity-100" : "pointer-events-none",
    )}
    variant="outline"
    onclick={() => {
      open = false;
      librarySource.set("");
      refreshLibrary();
    }}
  >
    <Icon icon="lucide:x" />
  </Button>
</div>
