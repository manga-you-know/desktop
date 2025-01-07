<script lang="ts">
  import { Button, Command, Popover, ScrollArea } from "@/lib/components";
  import { ChevronsUpDown } from "lucide-svelte";
  import { cn } from "$lib/utils";
  import { defaultPage } from "@/store";
  import Icon from "@iconify/svelte";

  interface Props {
    class?: string;
    classPopover?: string;
    itemClass?: string;
    disabled?: boolean;
    inverseDisabled?: boolean;
    onChange?: () => void;
  }
  function titleCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  let open = $state(false);
  let { class: className, classPopover, itemClass, onChange }: Props = $props();

  const options = ["home", "favorites", "library"];
  const pageIcon: { [key: string]: string } = {
    home: "heroicons:home-20-solid",
    favorites: "heroicons:star-solid",
    library: "solar:book-2-bold",
  };
</script>

<Popover.Root bind:open>
  <Popover.Trigger>
    {#snippet child({ props })}
      <Button
        class={cn(
          "min-w-[165px] max-w-[165px] justify-between bg-[#2d3649] border-0",
          className
        )}
        variant="outline"
        {...props}
        role="combobox"
        aria-expanded={open}
      >
        <Icon icon={pageIcon[$defaultPage]} />
        {titleCase($defaultPage)}
        <ChevronsUpDown class="opacity-50" />
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="w-[165px] h-36 p-0">
    <Command.Root class={cn("bg-gray-900", classPopover)}>
      <Command.Input placeholder="Search page..." class="h-9" />
      <Command.Empty class="mb-[-68px]">No page found.</Command.Empty>
      <ScrollArea class="h-36">
        <Command.Group>
          {#each options as page}
            <Command.Item
              class={cn(
                `hover:!bg-slate-700 ${page === $defaultPage ? "!bg-gray-800" : "aria-selected:bg-inherit"}`,
                itemClass
              )}
              value={page}
              onSelect={() => {
                $defaultPage = page;
                open = false;
                onChange?.();
              }}
            >
              <Icon icon={pageIcon[page]} />
              {titleCase(page)}
            </Command.Item>
          {/each}
        </Command.Group>
      </ScrollArea>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
