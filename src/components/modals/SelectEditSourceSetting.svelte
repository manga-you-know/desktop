<script lang="ts">
  import { Button, Checkbox, Dialog, Input } from "@/lib/components";
  import { suwaManager } from "@/lib/helpers";
  import { cn } from "@/lib/utils";
  import type { Preference, SourceSettings } from "@/types";
  import Icon from "@iconify/svelte";
  import { readText } from "@tauri-apps/plugin-clipboard-manager";

  type Props = {
    open: boolean;
    sourceSettings: SourceSettings;
    preference: Preference;
  };

  let {
    open = $bindable(false),
    sourceSettings = $bindable(),
    preference = $bindable(),
  }: Props = $props();

  let title = $derived(
    preference.type === "EditTextPreference"
      ? preference.EditTextPreferenceTitle
      : preference.type === "ListPreference"
        ? preference.ListPreferenceTitle
        : preference.type === "MultiSelectListPreference"
          ? preference.MultiSelectListPreferenceTitle
          : "",
  );
  let lastValue = $state({
    text: "",
    changed: false,
  });
  let lastValues = $state({
    texts: [],
    changed: false,
  });
  let saved = $state(false);
</script>

<Dialog.Root
  bind:open
  onOpenChange={(op) => {
    if (!op && !saved) {
      if (preference.type === "EditTextPreference") {
        preference.EditTextPreferenceCurrentValue = lastValue.text;
        lastValue = {
          text: "",
          changed: false,
        };
      } else if (preference.type === "ListPreference") {
        preference.ListPreferenceCurrentValue = lastValue.text;
        lastValue = {
          text: "",
          changed: false,
        };
      } else if (preference.type === "MultiSelectListPreference") {
        preference.MultiSelectListPreferenceCurrentValue = lastValues.texts;
        lastValues = {
          texts: [],
          changed: false,
        };
      }
      saved = false;
    }
    if (op && preference.type === "EditTextPreference") {
      lastValue = {
        text: preference.EditTextPreferenceCurrentValue,
        changed: true,
      };
    }
  }}
>
  <Dialog.Content overlayClass="bg-black/50 transition-colors! duration-400">
    <Dialog.Header>
      <Dialog.Title class="text-xl">{title}</Dialog.Title>
      <!-- <Dialog.Description> -->
      <!-- </Dialog.Description> -->
    </Dialog.Header>
    <div class="flex gap-1">
      {#if preference.type === "EditTextPreference"}
        <Input
          class="w-full rounded-l-xl rounded-r-none"
          divClass="w-full"
          variant="outline"
          placeholder=""
          bind:value={preference.EditTextPreferenceCurrentValue}
        />
        <Button
          class="h-10 rounded-l-none rounded-r-xl"
          variant="secondary"
          onclick={async () => {
            const text = await readText();
            if (text) {
              preference.EditTextPreferenceCurrentValue = text;
            }
          }}
        >
          <Icon icon="lucide:clipboard-paste" />
        </Button>
      {:else if preference.type === "ListPreference"}
        <div class="flex w-full flex-col gap-1">
          {#each preference.entryValues as entry, i}
            <Button
              class="w-full justify-between rounded-xl"
              variant={preference.ListPreferenceCurrentValue === entry
                ? "secondary"
                : "outline"}
              onclick={() => {
                if (!lastValue.changed)
                  lastValue = {
                    text: preference.ListPreferenceCurrentValue,
                    changed: true,
                  };
                preference.ListPreferenceCurrentValue = entry;
              }}
            >
              {preference.entries[i]}
              <div
                class={cn(
                  "transition-all duration-400",
                  preference.ListPreferenceCurrentValue !== entry &&
                    "opacity-0",
                )}
              >
                <Icon icon="lucide:check" />
              </div>
            </Button>
          {/each}
        </div>
      {:else if preference.type === "MultiSelectListPreference"}
        <div class="flex max-h-100 w-full flex-col gap-1 overflow-y-scroll">
          {#each preference.entryValues as entry, i}
            <Button
              class="w-full justify-between rounded-xl"
              variant={preference.MultiSelectListPreferenceCurrentValue.includes(
                entry,
              )
                ? "secondary"
                : "outline"}
              onclick={() => {
                if (!lastValues.changed) {
                  lastValues = {
                    //@ts-ignore
                    texts: preference.MultiSelectListPreferenceCurrentValue,
                    changed: true,
                  };
                }
                if (
                  preference.MultiSelectListPreferenceCurrentValue.includes(
                    entry,
                  )
                ) {
                  preference.MultiSelectListPreferenceCurrentValue =
                    preference.MultiSelectListPreferenceCurrentValue.filter(
                      (value) => value !== entry,
                    );
                } else {
                  preference.MultiSelectListPreferenceCurrentValue = [
                    ...preference.MultiSelectListPreferenceCurrentValue,
                    entry,
                  ];
                }
              }}
            >
              {preference.entries[i]}
              <Checkbox
                class="pointer-events-none"
                checked={preference.MultiSelectListPreferenceCurrentValue.includes(
                  entry,
                )}
              />
            </Button>
          {/each}
        </div>
      {/if}
    </div>
    <div class="flex justify-end gap-2">
      <Button
        class="rounded-xl"
        variant="outline"
        onclick={() => {
          if (preference.type === "EditTextPreference") {
            preference.EditTextPreferenceCurrentValue = lastValue.text;
            lastValue = {
              text: "",
              changed: false,
            };
          } else if (preference.type === "ListPreference") {
            preference.ListPreferenceCurrentValue = lastValue.text;
            lastValue = {
              text: "",
              changed: false,
            };
          } else if (
            preference.type === "MultiSelectListPreference" &&
            lastValues.changed
          ) {
            preference.MultiSelectListPreferenceCurrentValue = lastValues.texts;
            lastValues = {
              texts: [],
              changed: false,
            };
          }
          open = false;
        }}
      >
        <Icon icon="lucide:x" />
        Cancel
      </Button>
      <Button
        class="rounded-xl"
        onclick={() => {
          const change =
            preference.type === "EditTextPreference"
              ? {
                  position: sourceSettings.preferences.indexOf(preference),
                  editTextState: preference.EditTextPreferenceCurrentValue,
                }
              : preference.type === "ListPreference"
                ? {
                    position: sourceSettings.preferences.indexOf(preference),
                    listState: preference.ListPreferenceCurrentValue,
                  }
                : preference.type === "MultiSelectListPreference"
                  ? {
                      position: sourceSettings.preferences.indexOf(preference),
                      multiSelectState:
                        preference.MultiSelectListPreferenceCurrentValue,
                    }
                  : {};
          suwaManager
            .setSourceSettingPreference({
              source: sourceSettings.id,
              //@ts-ignore
              change,
            })
            .then((ss) => {
              sourceSettings = ss;
              saved = true;
              lastValue = { text: "", changed: false };
              lastValues = { texts: [], changed: false };
              open = false;
            });
        }}
      >
        Save <Icon icon="lucide:save" />
      </Button>
    </div>
  </Dialog.Content>
</Dialog.Root>
