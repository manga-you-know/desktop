<script lang="ts">
  import type { Language } from "@/interfaces";
  import { Button, Command, Popover, ScrollArea } from "@/lib/components";
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
        class={cn("min-w-[165px] max-w-[165px] justify-between", className)}
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
    <Command.Root class={cn("bg-black", classPopover)}>
      <Command.Input placeholder="Search language..." class="h-9" />
      <Command.Empty class="mb-[-68px]">No language found.</Command.Empty>
      <ScrollArea class="h-36">
        <Command.Group>
          {#each options as language}
            <Command.Item
              class={cn(
                `hover:!bg-slate-700 ${language.id === selectedLanguage.id ? "!bg-gray-800" : "aria-selected:bg-inherit"}`,
                itemClass
              )}
              value={language.id}
              onSelect={() => {
                selectedLanguage = language;
                open = false;
                onChange?.();
              }}
            >
              {language.label}
            </Command.Item>
          {/each}
        </Command.Group>
      </ScrollArea>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
