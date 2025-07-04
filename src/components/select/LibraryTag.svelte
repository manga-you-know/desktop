<script lang="ts">
  import {
    Button,
    Command,
    Label,
    Popover,
    ScrollArea,
  } from "@/lib/components";
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

<div class={cn("inline-flex", className)}>
  <Popover.Root bind:open>
    <Popover.Trigger bind:ref={triggerRef}>
      {#snippet child({ props })}
        <Button
          variant="outline"
          class="w-36 justify-between rounded-r-none focus:none"
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
                  $tags.at($tags.findIndex((c) => c.id === $libraryTag.id) + 1)
                );
              }
            } else {
              if ($libraryTag === undefined) {
                libraryTag.set($tags.at(-1));
              } else {
                libraryTag.set(
                  $tags.at($tags.findIndex((c) => c.id === $libraryTag.id) - 1)
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
          {#if $libraryTag?.icon}
            <Icon icon={$libraryTag.icon} />
          {/if}
          <Label
            class="!w-36 cursor-pointer text-sm text-center -ml-[4px] text-ellipsis    
            {$libraryTag === undefined ? 'dark:text-gray-400' : ''}"
          >
            {limitStr($libraryTag?.name ?? "Filter by tag...", 16)}
          </Label>
        </Button>
      {/snippet}
    </Popover.Trigger>
    <Popover.Content class="w-[11rem] max-h-44 ml-7 p-0">
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
              <Command.Item
                class={cn(
                  "w-full rounded-xl flex justify-center hover:!bg-slate-300 dark:hover:!bg-secondary/50",
                  tag === $libraryTag
                    ? "!bg-slate-400 dark:!bg-secondary"
                    : "aria-selected:bg-slate-400 dark:aria-selected:bg-inherit"
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
            {/each}
          </Command.Group>
        </ScrollArea>
      </Command.Root>
    </Popover.Content>
  </Popover.Root>
  <Button
    variant="secondary"
    class="w-8 rounded-l-none"
    disabled={$libraryTag === undefined}
    onclick={() => {
      open = false;
      libraryTag.set(undefined);
      refreshLibrary();
    }}
  >
    <Icon icon="lucide:x" />
  </Button>
</div>
