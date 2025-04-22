<script lang="ts">
  import { Button, Command, Popover, ScrollArea } from "@/lib/components";
  import { ChevronsUpDown } from "lucide-svelte";
  import { MANGASOURCES, ANIMESOURCES, COMICSOURCES } from "@/constants";
  import { selectedSource } from "@/store";
  import type { Source } from "@/interfaces";
  import Icon from "@iconify/svelte";
  import { saveSettings } from "@/functions";
  import { Select } from "@/components";
  import { cn } from "@/lib/utils";
  import { onMount } from "svelte";
  const mangaSourceNames = MANGASOURCES.map((source) => source.name);
  const animeSourceNames = ANIMESOURCES.map((source) => source.name);
  const comicSourceNames = COMICSOURCES.map((source) => source.name);
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
  const comicSources: { [languageKey: string]: Source[] } = {};
  for (const source of COMICSOURCES) {
    if (!comicSources[source.language]) {
      comicSources[source.language] = [];
    }
    comicSources[source.language].push(source);
  }

  const sourcesByType = {
    manga: mangaSources,
    comic: comicSources,
    anime: animeSources,
  };
  const sources = {
    manga: MANGASOURCES,
    comic: COMICSOURCES,
    anime: ANIMESOURCES,
  };
  let sourceType: "manga" | "comic" | "anime" = $state("manga");
  let open = $state(false);
  let triggerRef = $state<HTMLButtonElement>(null!);
  // function closeAndFocusTrigger() {
  //   open = false;
  //   tick().then(() => {
  //     triggerRef.focus();
  //   });
  // }
  selectedSource.subscribe(async (value) => {
    await saveSettings();
  });

  onMount(() => {
    sourceType = mangaSourceNames.includes($selectedSource)
      ? "manga"
      : comicSourceNames.includes($selectedSource)
        ? "comic"
        : animeSourceNames.includes($selectedSource)
          ? "anime"
          : "manga";
  });
</script>

<div class="inline-flex">
  <Popover.Root bind:open>
    <Popover.Trigger bind:ref={triggerRef}>
      {#snippet child({ props })}
        <Button
          class="min-w-[165px] max-w-[165px] justify-between select-none rounded-r-none "
          variant="outline"
          {...props}
          role="combobox"
          aria-expanded={open}
          tabindex={-1}
        >
          {$selectedSource || "Select a source..."}
          <ChevronsUpDown class="opacity-50" />
        </Button>
      {/snippet}
    </Popover.Trigger>
    <Popover.Content class="w-[165px] p-0">
      <Command.Root class="dark:bg-black">
        <Command.Input placeholder="Search source..." class="h-9" />
        <Command.Empty class="mb-[-68px]">No source found.</Command.Empty>
        <ScrollArea class="h-36 scroll-smooth select-none">
          {#each Object.keys(sourcesByType[sourceType]) as language}
            <Command.Group heading={language}>
              {#each sourcesByType[sourceType][language] as source}
                <Command.Item
                  class={cn(
                    "flex justify-between hover:!bg-slate-400 dark:hover:!bg-slate-800 ",
                    source.name === $selectedSource
                      ? "!bg-gray-300 dark:!bg-gray-900"
                      : "aria-selected:bg-gray-400 dark:aria-selected:bg-inherit"
                  )}
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
  <Select
    class="w-20 p-0 rounded-l-none"
    variant="secondary"
    bind:selected={sourceType}
    items={["manga", "comic", "anime"]}
    icons={{
      manga: "uil:letter-japanese-a",
      comic: "game-icons:spinning-sword",
      anime: "mage:play-square-fill",
    }}
    onselect={() => {
      selectedSource.set(sources[sourceType][0].name);
    }}
    openIcon={false}
  />
</div>
