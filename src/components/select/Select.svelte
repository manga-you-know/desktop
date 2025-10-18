<script lang="ts">
  import { IS_MOBILE } from "@/constants";
  import {
    Button,
    Command,
    Label,
    Popover,
    type ButtonEffect,
    type ButtonVariant,
  } from "@/lib/components";
  import { Empty } from "@/lib/components/ui/command";
  import { cn } from "@/lib/utils";
  import { titleCase } from "@/utils";
  import Icon from "@iconify/svelte";

  type Props = {
    selected: string;
    items: string[];
    label?: string;
    search?: boolean;
    itemsLabel?: Record<string, string>;
    icons?: { [key: string]: string };
    disabled?: boolean;
    openIcon?: boolean;
    invertIcons?: boolean;
    closeButton?: boolean;
    onselect?: VoidFunction;
    onmouseup?: (e: any) => void;
    wheelControls?: boolean;
    variant?: ButtonVariant;
    effect?: ButtonEffect;
    class?: string;
    classRoot?: string;
    classPopup?: string;
    classItem?: string;
  };

  let {
    selected = $bindable(""),
    label = "Select...",
    items,
    itemsLabel = {},
    icons,
    onselect,
    onmouseup,
    variant = "outline",
    effect = null,
    disabled = false,
    search = false,
    openIcon = true,
    invertIcons = false,
    closeButton = true,
    wheelControls = false,
    class: className,
    classRoot,
    classPopup,
    classItem,
  }: Props = $props();

  let open = $state(false);
  let triggerRef = $state<HTMLButtonElement>(null!);
</script>

<div class={cn("inline-flex relative", classRoot)}>
  <Popover.Root bind:open>
    <Popover.Trigger bind:ref={triggerRef}>
      {#snippet child({ props })}
        <Button
          class={className}
          disabled={items.length === 0 || disabled}
          {variant}
          {effect}
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
              invertIcons ? "flex-row-reverse" : "",
            )}
          >
            {#if icons}
              <Icon icon={icons[selected]} />
            {/if}
            <Label
              class={cn(
                "w-full text-sm cursor-pointer truncate",
                selected === "" && "dark:text-gray-400!",
              )}
            >
              {selected !== "" ? (itemsLabel[selected] ?? selected) : label}
            </Label>
          </div>
          {#if openIcon}
            <Icon icon="lucide:chevron-down" class="text-gray-500" />
          {/if}
        </Button>
      {/snippet}
    </Popover.Trigger>
    <Popover.Content class={cn("w-28  p-0", classPopup)}>
      <Command.Root>
        {#if search}
          <Command.Input
            placeholder="Search..."
            tabindex={IS_MOBILE ? -1 : 1}
          />
        {/if}
        <Command.Empty class="select-none">Nothing found.</Command.Empty>
        <Command.List class="scrollbar">
          <Command.Group>
            {#each items as item}
              <Command.Item
                class={cn(
                  "w-full flex justify-between hover:bg-slate-400! dark:hover:bg-secondary/50! select-none",
                  classItem,
                  item === selected
                    ? "bg-gray-300! dark:bg-secondary!"
                    : " dark:aria-selected:bg-inherit",
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
                    invertIcons ? "flex-row-reverse" : "",
                  )}
                >
                  {#if icons}
                    <Icon icon={icons[item]} />
                  {/if}
                  <Label
                    class="flex w-full  items-center text-center text-sm justify-center"
                    >{itemsLabel[item] ?? item}</Label
                  >
                </div>
              </Command.Item>
            {/each}
          </Command.Group>
        </Command.List>
      </Command.Root>
    </Popover.Content>
  </Popover.Root>
  <Button
    class={cn(
      "size-6! px-0 absolute -top-0.5 right-0 transition-all duration-400 opacity-0",
      selected !== "" && closeButton && !disabled
        ? "opacity-100"
        : "pointer-events-none",
    )}
    variant="outline"
    onclick={() => {
      open = false;
      selected = "";
      onselect?.();
    }}
  >
    <Icon icon="lucide:x" />
  </Button>
</div>
