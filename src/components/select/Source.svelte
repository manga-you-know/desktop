<script lang="ts">
  import { Button, Command, Popover, ScrollArea } from "@/lib/components";
  import { ChevronsUpDown } from "lucide-svelte";
  import { MANGASOURCES, ANIMESOURCES } from "@/constants";
  import { selectedSource } from "@/store";
  import type { Source } from "@/interfaces";
  import Icon from "@iconify/svelte";
  const mangaSourceNames = MANGASOURCES.map((source) => source.name);
  const animeSourceNames = ANIMESOURCES.map((source) => source.name);
  const mangaSources: { [languageKey: string]: Source[] } = {};
  for (const source of MANGASOURCES) {
    if (!mangaSources[source.language]) {
      mangaSources[source.language] = [];
    }
    mangaSources[source.language].push(source);
  }
  const animeSources: { [languageKey: string]: Source[] } = {};
  for (const source of ANIMESOURCES) {
    if (!animeSources[source.language]) {
      animeSources[source.language] = [];
    }
    animeSources[source.language].push(source);
  }
  let sourceType: "manga" | "anime" = $derived(
    mangaSourceNames.includes($selectedSource) ? "manga" : "anime"
  );
  let displayedSources = $derived(
    sourceType === "manga" ? mangaSources : animeSources
  );
  let open = $state(false);
  let triggerRef = $state<HTMLButtonElement>(null!);
  // function closeAndFocusTrigger() {
  //   open = false;
  //   tick().then(() => {
  //     triggerRef.focus();
  //   });
  // }
</script>

<div class="inline-flex">
  <Popover.Root bind:open>
    <Popover.Trigger bind:ref={triggerRef}>
      {#snippet child({ props })}
        <Button
          variant="outline"
          class="min-w-[165px] max-w-[165px] justify-between rounded-r-none "
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
          {#each Object.keys(displayedSources) as language}
            <Command.Group heading={language}>
              {#each displayedSources[language] as source}
                <Command.Item
                  class={`flex justify-between hover:!bg-slate-800 ${source.name === $selectedSource ? "!bg-gray-900" : "aria-selected:bg-inherit"}`}
                  value={source.name}
                  onSelect={() => {
                    selectedSource.set(source.name);
                    open = false;
                    // closeAndFocusTrigger();
                  }}
                >
                  {source.name}
                  {#if source.isRecommended}
                    <Icon
                      icon="lucide:circle-check"
                      class="w-4 h-4 text-green-500"
                    />
                  {/if}
                  {#if source.isProblem}
                    <Icon icon="lucide:circle-x" class="w-4 h-4 text-red-500" />
                  {/if}
                </Command.Item>
              {/each}
            </Command.Group>
          {/each}
        </ScrollArea>
      </Command.Root>
    </Popover.Content>
  </Popover.Root>
  <Button
    class="w-8 rounded-l-none ml-[-2px]"
    variant="outline"
    onclick={() => {
      selectedSource.set(
        sourceType === "anime" ? MANGASOURCES[0].name : ANIMESOURCES[0].name
      );
    }}
  >
    <Icon
      icon={sourceType === "manga"
        ? "heroicons:book-open"
        : "lucide:tv-minimal-play"}
    />
  </Button>
</div>
