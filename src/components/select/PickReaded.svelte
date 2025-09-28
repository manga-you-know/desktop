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
  import { VList } from "virtua/svelte";

  interface Props {
    class?: string;
    favorite: Favorite;
    readedLenght: number;
    readeds: Readed[];
    chapters: Chapter[];
  }

  let open = $state(false);
  let {
    class: className,
    favorite,
    readeds,
    readedLenght,
    chapters,
  }: Props = $props();
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
          <ScrollingValue value={readedLenght} axis="y" />
          /
          <ScrollingValue value={chapters.length} axis="y" />
        </div>
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="max-w-24 p-0">
    <Command.Root>
      <Command.Input placeholder="Chapter..." />
      <Command.Empty>Nothing found.</Command.Empty>
      <Command.Group>
        <VList
          class="min-h-36 scrollbar-chapters"
          data={chapters}
          getKey={(_, i) => i}
          overscan={20}
          tabindex={-1}
        >
          {#snippet children(chapter, _)}
            <Command.Item
              class={cn(
                "flex rounded-xl justify-center hover:!bg-secondary/50",
                readeds.find((r) => r.chapter_id === chapter.chapter_id) &&
                  "border-[1px] border-primary",
              )}
              value={chapter.number}
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
          {/snippet}
        </VList>
      </Command.Group>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
