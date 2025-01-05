<script lang="ts">
  import { Button, Command, Popover, ScrollArea } from "@/lib/components";
  import { ChevronsUpDown } from "lucide-svelte";
  import { MANGASOURCES } from "@/constants";
  import { selectedSource } from "@/store";
  import type { Source } from "@/interfaces";
  const sources: { [languageKey: string]: Source[] } = {};
  for (const source of MANGASOURCES) {
    if (!sources[source.language]) {
      sources[source.language] = [];
    }
    sources[source.language].push(source);
  }
  let open = $state(false);
  let triggerRef = $state<HTMLButtonElement>(null!);
  // function closeAndFocusTrigger() {
  //   open = false;
  //   tick().then(() => {
  //     triggerRef.focus();
  //   });
  // }
</script>

<Popover.Root bind:open>
  <Popover.Trigger bind:ref={triggerRef}>
    {#snippet child({ props })}
      <Button
        variant="outline"
        class="min-w-[165px] max-w-[165px] justify-between"
        {...props}
        role="combobox"
        aria-expanded={open}
      >
        {$selectedSource || "Select a source..."}
        <ChevronsUpDown class="opacity-50" />
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="w-[165px] p-0">
    <Command.Root class="bg-black">
      <Command.Input placeholder="Search source..." class="h-9" />
      <Command.Empty class="mb-[-68px]">No source found.</Command.Empty>
      <ScrollArea class="h-36">
        {#each Object.keys(sources) as language}
          <Command.Group heading={language}>
            {#each sources[language] as source}
              <Command.Item
                class={`hover:!bg-slate-800 ${source.name === $selectedSource ? "!bg-gray-900" : "aria-selected:bg-inherit"}`}
                value={source.name}
                onSelect={() => {
                  selectedSource.set(source.name);
                  open = false;
                  // closeAndFocusTrigger();
                }}
              >
                {source.name}
              </Command.Item>
            {/each}
          </Command.Group>
        {/each}
      </ScrollArea>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
