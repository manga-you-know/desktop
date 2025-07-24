<script lang="ts">
  import {
    Button,
    Command,
    Label,
    Popover,
    ScrollArea,
    ContextMenu,
  } from "@/lib/components";
  import { AskSure } from "@/components";
  import { libraryFavorites, libraryTag, tags } from "@/store";
  import { refreshTags, refreshLibrary } from "@/functions";
  import { MarkDB } from "@/repositories";
  import Icon from "@iconify/svelte";
  import { onMount } from "svelte";
  import type { Mark } from "@/types";
  import { limitStr } from "@/utils";
  import { cn } from "@/lib/utils";
  import { IS_MOBILE } from "@/constants";

  let open = $state(false);
  let openDelete = $state(false);
  let markToDelete: Mark = $state(null!);
  let searchTag = $state("");
  let shouldAdd = $state(false);
  let triggerRef = $state<HTMLButtonElement>(null!);

  onMount(async () => {
    await refreshTags();
  });

  async function createTag() {
    if (shouldAdd) {
      await MarkDB.addMark(searchTag);
      searchTag = "";
      await refreshTags();
    }
  }

  let { class: className }: { class?: string } = $props();
</script>

<AskSure
  bind:open={openDelete}
  message="This will permanently delete the tag {markToDelete?.name}"
  onokay={async () => {
    openDelete = false;
    await MarkDB.deleteMark(markToDelete);
    await refreshTags();
    if ($libraryTag?.id === markToDelete.id) {
      libraryTag.set(undefined);
      await refreshLibrary();
    }
  }}
/>
<div class={cn("inline-flex relative", className)}>
  <Popover.Root bind:open>
    <Popover.Trigger bind:ref={triggerRef}>
      {#snippet child({ props })}
        <Button
          class="w-32 pr-2 focus:none"
          variant="outline"
          {...props}
          role="combobox"
          aria-expanded={open}
          tabindex={-1}
          onwheel={(e) => {
            if (e.deltaY < 0) {
              if ($libraryTag === undefined) {
                libraryTag.set($tags.at(0));
              } else {
                libraryTag.set(
                  $tags.at($tags.findIndex((c) => c.id === $libraryTag.id) + 1),
                );
              }
            } else {
              if ($libraryTag === undefined) {
                libraryTag.set($tags.at(-1));
              } else {
                libraryTag.set(
                  $tags.at($tags.findIndex((c) => c.id === $libraryTag.id) - 1),
                );
              }
            }
            refreshLibrary();
          }}
          onmouseup={(e) => {
            if (e.button === 1) {
              open = false;
              libraryTag.set(undefined);
              refreshLibrary();
            }
          }}
        >
          <div class="inline-flex justify-between items-center w-full gap-0.5">
            <div class="inline-flex w-full justify-center items-center gap-2">
              {#if $libraryTag?.icon}
                <Icon icon={$libraryTag.icon} />
              {/if}
              <Label
                class="max-w-20 cursor-pointer text-sm text-center truncate    
            {$libraryTag === undefined ? 'dark:text-gray-400' : ''}"
              >
                {$libraryTag?.name ?? "Select tag"}
              </Label>
            </div>
            <Icon class="!w-4 text-gray-500" icon="lucide:chevron-down" />
          </div>
        </Button>
      {/snippet}
    </Popover.Trigger>
    <Popover.Content class="w-[10rem] max-h-48 p-0">
      <Command.Root onValueChange={(v) => (shouldAdd = v.length === 0)}>
        <Command.Input
          bind:value={searchTag}
          class="text-sm"
          placeholder="Search tag..."
          onkeydown={(e) => {
            if (e.key === "Enter") createTag();
          }}
          tabindex={IS_MOBILE ? -1 : 1}
        />
        <Command.Empty class="-mb-[68px] p-2 text-sm text-wrap">
          {#if searchTag.length > 0}
            Press enter to create <span class="font-bold">{searchTag}</span>
          {:else}
            Nothing here... try typing.
          {/if}
        </Command.Empty>
        <ScrollArea class="h-36 rounded-b-2xl">
          <Command.Group>
            {#each [{ id: -1, user_id: 1, name: "Favorites", icon: "heroicons:star-solid" }, ...$tags.reverse()] as tag}
              <ContextMenu.Root>
                <ContextMenu.Trigger>
                  <Command.Item
                    class={cn(
                      "w-full rounded-xl flex justify-center hover:!bg-slate-300 dark:hover:!bg-secondary/50",
                      tag === $libraryTag
                        ? "!bg-slate-400 dark:!bg-secondary"
                        : "aria-selected:bg-slate-400 dark:aria-selected:bg-inherit",
                    )}
                    value={tag.name}
                    onSelect={async () => {
                      libraryTag.set(tag);
                      open = false;
                      await refreshLibrary();
                    }}
                  >
                    {#if tag.icon}
                      <Icon icon={tag.icon} />
                    {/if}
                    <Label class="text-center text-sm">{tag.name}</Label>
                  </Command.Item>
                </ContextMenu.Trigger>
                <ContextMenu.Content>
                  <ContextMenu.Item
                    class="flex justify-between"
                    onclick={() => {
                      markToDelete = tag;
                      openDelete = true;
                      open = false;
                    }}
                  >
                    <Label>Delete</Label>
                    <Icon class="!size-4" icon="lucide:trash" />
                  </ContextMenu.Item>
                </ContextMenu.Content>
              </ContextMenu.Root>
            {/each}
          </Command.Group>
        </ScrollArea>
      </Command.Root>
    </Popover.Content>
  </Popover.Root>
  <Button
    class={cn(
      "!size-6 px-0 absolute -top-0.5 right-0 transition-all duration-300 opacity-0",
      $libraryTag !== undefined ? "opacity-100" : "pointer-events-none",
    )}
    variant="outline"
    onclick={() => {
      open = false;
      libraryTag.set(undefined);
      refreshLibrary();
    }}
  >
    <Icon icon="lucide:x" />
  </Button>
</div>
