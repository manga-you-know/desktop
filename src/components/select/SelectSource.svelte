<script lang="ts">
  import { Button, Command, Popover, ScrollArea } from "@/lib/components";
  import { ChevronsUpDown } from "lucide-svelte";
  import { MANGASOURCES } from "@/constants";
  import { selectedSource } from "@/store";
  import Icon from "@iconify/svelte";
  import { saveSettings } from "@/functions";
  import { cn } from "@/lib/utils";
  import { onMount } from "svelte";
  import Image from "../common/Image.svelte";
  import type { MSource } from "@/types/source";
  const mangaSourceNames = MANGASOURCES.map((source) => source.name);
  const mangaSources: { [languageKey: string]: MSource[] } = {};
  for (const source of MANGASOURCES) {
    if (!mangaSources[source.languageLabel]) {
      mangaSources[source.languageLabel] = [];
    }
    mangaSources[source.languageLabel].push(source);
  }

  const sourceIcon = Object.fromEntries(
    MANGASOURCES.map((m) => [m.name, m.iconPath]),
  );

  let open = $state(false);
  let triggerRef = $state<HTMLButtonElement>(null!);
  // function closeAndFocusTrigger() {
  //   open = false;
  //   tick().then(() => {
  //     triggerRef.focus();
  //   });
  // }

  selectedSource.subscribe(saveSettings);

  onMount(() => {
    if (!mangaSourceNames.includes($selectedSource)) {
      $selectedSource = mangaSourceNames[0];
    }
  });
</script>

<div class="inline-flex">
  <Popover.Root bind:open>
    <Popover.Trigger bind:ref={triggerRef}>
      {#snippet child({ props })}
        <Button
          class="h-11 font-bold bg-background/60 border-secondary/70 hover-secondary/70 min-w-[180px] max-w-[180px] justify-between px-2 select-none"
          variant="outline"
          {...props}
          role="combobox"
          aria-expanded={open}
          tabindex={-1}
          onwheel={(e) => {
            if (e.deltaY < 0) {
            } else {
            }
          }}
          onmouseup={(e) => {
            if (e.button === 1) {
              selectedSource.set(
                MANGASOURCES.at(
                  MANGASOURCES.findIndex((s) => s.name === $selectedSource) + 1,
                )?.name ?? MANGASOURCES[0].name,
              );
            }
          }}
        >
          <div class="flex gap-2 items-center">
            <img
              class="size-8"
              src={sourceIcon[$selectedSource]}
              alt="{$selectedSource} logo"
            />
            {$selectedSource || "Select a source..."}
          </div>
          <ChevronsUpDown class="opacity-50" />
        </Button>
      {/snippet}
    </Popover.Trigger>
    <Popover.Content class="w-[200px] p-0">
      <Command.Root>
        <!-- <Command.Input placeholder="Search source..." class="h-9" /> -->
        <!-- <Command.Empty class="-mb-[68px]">No source found.</Command.Empty> -->
        <ScrollArea class="h-44 scroll-smooth select-none">
          {#each Object.entries(mangaSources) as [lang, mSources]}
            <Command.Group heading={lang}>
              {#each mSources as source}
                <Command.Item
                  class={cn(
                    "flex justify-between gap-1 font-semibold hover:!bg-slate-400 pr-4 dark:hover:!bg-secondary/50 ",
                    /* source.name === $selectedSource
                      ? "!bg-gray-300 dark:!bg-secondary"
                      : "aria-selected:bg-gray-400 dark:aria-selected:bg-inherit", */
                  )}
                  value={source.name}
                  onSelect={() => {
                    selectedSource.set(source.name);
                    open = false;
                    // closeAndFocusTrigger();
                  }}
                >
                  <div class="flex items-center gap-2">
                    <img
                      class="size-7"
                      src={source.iconPath}
                      alt="{source.name} logo"
                    />
                    {source.name}
                  </div>
                  <Icon
                    class={cn(source.name !== $selectedSource && "opacity-0")}
                    icon="lucide:check"
                  />
                </Command.Item>
              {/each}
            </Command.Group>
          {/each}
        </ScrollArea>
      </Command.Root>
    </Popover.Content>
  </Popover.Root>
</div>
