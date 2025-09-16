<script lang="ts">
  import type { Chapter, Favorite, Readed } from "@/types";
  import {
    Button,
    Command,
    Label,
    Popover,
    ScrollArea,
  } from "@/lib/components";
  import { ChevronsUpDown } from "lucide-svelte";
  import { cn } from "$lib/utils";
  import { ScrollingValue } from "svelte-ux";
  import { addReadedBelow, refreshReadeds } from "@/functions";
  import { globalChapters } from "@/store";

  interface Props {
    class?: string;
    favorite: Favorite;
    readeds: Readed[];
    chapters: Chapter[];
  }

  let open = $state(false);
  let { class: className, favorite, readeds, chapters }: Props = $props();
</script>

<Popover.Root bind:open>
  <Popover.Trigger>
    {#snippet child({ props })}
      <Button
        class={cn("rounded-xl justify-between", className)}
        {...props}
        variant="outline"
        role="combobox"
        aria-expanded={open}
      >
        <div class="w-full flex justify-center">
          <ScrollingValue value={readeds.length} axis="y" />
          /
          <ScrollingValue value={chapters.length} axis="y" />
        </div>
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="max-w-16 p-0">
    <Command.Root>
      <Command.Input />
      <Command.Empty>Nothing found.</Command.Empty>
      <ScrollArea class="h-36">
        <Command.Group>
          {#each chapters as chapter}
            <Command.Item
              class={cn(
                "flex justify-center hover:!bg-slate-300 dark:hover:!bg-background/40",
                readeds.find((r) => r.chapter_id === chapter.chapter_id)
                  ? "!bg-slate-400 dark:!bg-background/70"
                  : "aria-selected:bg-slate-400 dark:aria-selected:bg-background/20",
              )}
              value={chapter.chapter_id}
              onSelect={async () => {
                await addReadedBelow(
                  chapter,
                  $globalChapters,
                  favorite,
                  readeds,
                );
                await refreshReadeds(favorite);
                open = false;
              }}
            >
              <Label>{chapter.number}</Label>
            </Command.Item>
          {/each}
        </Command.Group>
      </ScrollArea>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
