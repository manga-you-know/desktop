<script lang="ts">
  import {
    Button,
    Command,
    Label,
    Popover,
    type ButtonVariant,
  } from "@/lib/components";
  import { cn } from "@/lib/utils";
  import { titleCase } from "@/utils";
  import Icon from "@iconify/svelte";

  type Props = {
    selected: string;
    items: string[];
    icons?: { [key: string]: string };
    openIcon?: boolean;
    invertIcons?: boolean;
    onselect?: VoidFunction;
    onmouseup?: (e: any) => void;
    wheelControls?: boolean;
    variant?: ButtonVariant;
    class?: string;
    classPopup?: string;
    classItem?: string;
  };

  let {
    selected = $bindable(),
    items,
    icons,
    onselect,
    onmouseup,
    variant = "outline",
    openIcon = true,
    invertIcons = false,
    wheelControls = false,
    class: className,
    classPopup,
    classItem,
  }: Props = $props();

  let open = $state(false);
  let triggerRef = $state<HTMLButtonElement>(null!);
</script>

<Popover.Root bind:open>
  <Popover.Trigger bind:ref={triggerRef}>
    {#snippet child({ props })}
      <Button
        class={className}
        {variant}
        {...props}
        role="combobox"
        aria-expanded={open}
        tabindex={-1}
        onwheel={(e) => {
          if (wheelControls) {
            if (e.deltaY < 0) {
              selected =
                items.at(items.findIndex((v) => v === selected) - 1) ??
                items[0];
            } else {
              selected =
                items.at(items.findIndex((v) => v === selected) + 1) ??
                items[0];
            }
            onselect?.();
          }
        }}
        {onmouseup}
      >
        <div
          class={cn(
            "flex min-w-[60px] justify-between items-center gap-1 select-none",
            invertIcons ? "flex-row-reverse" : ""
          )}
        >
          {#if icons}
            <Icon icon={icons[selected]} />
          {/if}
          <Label class="w-full text-sm cursor-pointer"
            >{titleCase(selected)}</Label
          >
        </div>
        {#if openIcon}
          <Icon icon="lucide:chevron-down" class="text-gray-500" />
        {/if}
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class={cn("w-[110px]  p-0", classPopup)}>
    <Command.Root>
      <Command.List>
        <Command.Group>
          {#each items as item}
            <Command.Item
              class={cn(
                "w-full flex justify-between hover:!bg-slate-400 dark:hover:!bg-secondary/50 select-none",
                classItem,
                item === selected
                  ? "!bg-gray-300 dark:!bg-secondary"
                  : " dark:aria-selected:bg-inherit"
              )}
              value={item}
              onSelect={async () => {
                selected = item;
                open = false;
                onselect?.();
              }}
            >
              <div
                class={cn(
                  "flex w-full items-center gap-2",
                  invertIcons ? "flex-row-reverse" : ""
                )}
              >
                {#if icons}
                  <Icon icon={icons[item]} />
                {/if}
                <Label class="flex w-full text-sm justify-center"
                  >{titleCase(item)}</Label
                >
              </div>
            </Command.Item>
          {/each}
        </Command.Group>
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
