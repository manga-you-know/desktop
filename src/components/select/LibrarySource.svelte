<script lang="ts">
  import { Button, Command, Label, Popover } from "@/lib/components";
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
          class="w-36 rounded-r-none justify-between focus:none"
          {...props}
          role="combobox"
          aria-expanded={open}
          disabled={sources.length === 0}
          tabindex={-1}
        >
          <Label
            class={`w-full text-sm text-center ml-[-4px] ${$librarySource === "" ? "text-gray-400" : ""}`}
          >
            {$librarySource || "Filter by source..."}
          </Label>
        </Button>
      {/snippet}
    </Popover.Trigger>
    <Popover.Content class="w-36 p-0">
      <Command.Root class="bg-black">
        <Command.List>
          <Command.Group>
            {#each sources as source}
              <Command.Item
                class={`w-full flex justify-between hover:!bg-slate-800 ${source === $librarySource ? "!bg-gray-900" : "aria-selected:bg-inherit"}`}
                value={source}
                onSelect={async () => {
                  librarySource.set(source);
                  open = false;
                  await refreshLibrary();
                }}
              >
                <Label class="w-full text-center text-sm ml-[-4px]"
                  >{source}</Label
                >
              </Command.Item>
            {/each}
          </Command.Group>
        </Command.List>
      </Command.Root>
    </Popover.Content>
  </Popover.Root>
  <Button
    class="w-[20px] ml-[-1px] rounded-l-none"
    variant="outline"
    disabled={$librarySource === ""}
    onclick={async () => {
      librarySource.set("");
      await refreshLibrary();
    }}
    tabindex={-1}
  >
    <Icon icon="lucide:circle-x" />
  </Button>
</div>
