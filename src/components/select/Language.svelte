<script lang="ts">
  import type { Language } from "@/types";
  import {
    Button,
    Command,
    Label,
    Popover,
    ScrollArea,
  } from "@/lib/components";
  import { ChevronsUpDown } from "lucide-svelte";
  import { cn } from "$lib/utils";

  interface Props {
    class?: string;
    classPopover?: string;
    itemClass?: string;
    disabled?: boolean;
    inverseDisabled?: boolean;
    selectedLanguage: Language;
    languageOptions: Language[];
    onChange?: () => void;
  }

  let open = $state(false);
  let {
    class: className,
    classPopover,
    itemClass,
    disabled = $bindable(false),
    inverseDisabled = false,
    selectedLanguage = $bindable({ id: "en", label: "English" }),
    languageOptions: options,
    onChange,
  }: Props = $props();
</script>

<Popover.Root bind:open>
  <Popover.Trigger>
    {#snippet child({ props })}
      <Button
        class={cn(
          "min-w-[165px] max-w-[165px] justify-between bg-slate-300 dark:bg-secondary dark:text-white",
          className
        )}
        variant="outline"
        {...props}
        role="combobox"
        aria-expanded={open}
        disabled={inverseDisabled ? !disabled : disabled}
      >
        {selectedLanguage.label}
        <ChevronsUpDown class="opacity-50" />
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="w-[165px] p-0">
    <Command.Root class={cn("bg-slate-300 dark:bg-secondary", classPopover)}>
      <ScrollArea class="h-36">
        <Command.Group>
          {#each options as language}
            <Command.Item
              class={cn(
                "hover:!bg-gray-400 dark:hover:!bg-slate-700 ",
                language.id === selectedLanguage.id
                  ? "!bg-white dark:!bg-gray-800 "
                  : "aria-selected:bg-gray-400 dark:aria-selected:bg-inherit",
                itemClass
              )}
              value={language.id}
              onSelect={() => {
                selectedLanguage = language;
                open = false;
                onChange?.();
              }}
            >
              <Label>{language.label}</Label>
            </Command.Item>
          {/each}
        </Command.Group>
      </ScrollArea>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
