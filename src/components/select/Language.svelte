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
    wheelControls?: boolean;
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
    wheelControls = false,
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
          className,
        )}
        {...props}
        variant="outline"
        role="combobox"
        onwheel={(e) => {
          if (wheelControls) {
            e.preventDefault();
            if (e.deltaY < 0) {
              selectedLanguage =
                options.at(
                  options.findIndex((v) => v.id === selectedLanguage.id) - 1,
                ) ?? options[0];
            } else {
              selectedLanguage =
                options.at(
                  options.findIndex((v) => v.id === selectedLanguage.id) + 1,
                ) ?? options[0];
            }
            onChange?.();
          }
        }}
        aria-expanded={open}
        disabled={inverseDisabled ? !disabled : disabled}
      >
        <div class="w-full flex justify-center">
          {selectedLanguage.label}
        </div>
        <ChevronsUpDown class="opacity-50" />
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="w-[165px] p-0">
    <Command.Root class={classPopover}>
      <ScrollArea class="h-36">
        <Command.Group>
          {#each options as language}
            <Command.Item
              class={cn(
                "hover:!bg-slate-300 dark:hover:!bg-background/40",
                language.id === selectedLanguage.id
                  ? "!bg-slate-400 dark:!bg-background/70"
                  : "aria-selected:bg-slate-400 dark:aria-selected:bg-background/20",
                itemClass,
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
