<script lang="ts">
  import { Button, Checkbox, Dialog, Input } from "@/lib/components";
  import { suwaManager } from "@/lib/helpers";
  import { cn } from "@/lib/utils";
  import type { Preference, SourceSettings } from "@/types";
  import Icon from "@iconify/svelte";
  import { readText } from "@tauri-apps/plugin-clipboard-manager";
  import { untrack } from "svelte";

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
  let preferenceHere: string = $state("");
  let preferencesHere: string[] = $state([]);
  let changed = $derived<boolean>(
    preference.type === "MultiSelectListPreference"
      ? JSON.stringify(preferencesHere) !==
          JSON.stringify(preference.MultiSelectListPreferenceCurrentValue)
      : preference.type === "EditTextPreference"
        ? preferenceHere !== preference.EditTextPreferenceCurrentValue
        : preference.type === "ListPreference"
          ? preferenceHere !== preference.ListPreferenceCurrentValue
          : false,
  );
  $effect(() => {
    if (open) {
      untrack(() => {
        if (preference.type === "MultiSelectListPreference") {
          preferencesHere = preference.MultiSelectListPreferenceCurrentValue;
          console.log(preferencesHere);
        } else {
          preferenceHere =
            preference.type === "EditTextPreference"
              ? preference.EditTextPreferenceCurrentValue
              : preference.type === "ListPreference"
                ? preference.ListPreferenceCurrentValue
                : "";
          console.log(preferenceHere);
        }
      });
    } else {
      untrack(() => {
        preferenceHere = "";
        preferencesHere = [];
      });
    }
  });
</script>

<Dialog.Root
  bind:open
  onOpenChangeComplete={(op) => {
    console.log(op);
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
          bind:value={preferenceHere}
        />
        <Button
          class="h-10 rounded-l-none rounded-r-xl"
          variant="secondary"
          onclick={async () => {
            const text = await readText();
            if (text) {
              preferenceHere = text;
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
              variant={preferenceHere === entry ? "secondary" : "outline"}
              onclick={() => {
                preferenceHere = entry;
              }}
            >
              {preference.entries[i]}
              <div
                class={cn(
                  "transition-all duration-400",
                  preferenceHere !== entry && "opacity-0",
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
              variant={preferencesHere.includes(entry)
                ? "secondary"
                : "outline"}
              onclick={() => {
                if (preferencesHere.includes(entry)) {
                  preferencesHere = preferencesHere.filter(
                    (value) => value !== entry,
                  );
                } else {
                  preferencesHere = [...preferencesHere, entry];
                }
              }}
            >
              {preference.entries[i]}
              <Checkbox
                class="pointer-events-none"
                checked={preferencesHere.includes(entry)}
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
          open = false;
        }}
      >
        <Icon icon="lucide:x" />
        Cancel
      </Button>
      <Button
        class="rounded-xl"
        disabled={!changed}
        onclick={() => {
          const change =
            preference.type === "EditTextPreference"
              ? {
                  position: sourceSettings.preferences.indexOf(preference),
                  editTextState: preferenceHere,
                }
              : preference.type === "ListPreference"
                ? {
                    position: sourceSettings.preferences.indexOf(preference),
                    listState: preferenceHere,
                  }
                : preference.type === "MultiSelectListPreference"
                  ? {
                      position: sourceSettings.preferences.indexOf(preference),
                      multiSelectState: preferencesHere,
                    }
                  : {};
          suwaManager
            .setSourceSettingPreference({
              source: sourceSettings.id,
              //@ts-ignore
              change,
            })
            .then((ss) => {
              if (preference.type === "EditTextPreference") {
                preference.EditTextPreferenceCurrentValue = preferenceHere;
              } else if (preference.type === "ListPreference") {
                preference.ListPreferenceCurrentValue = preferenceHere;
              } else if (preference.type === "MultiSelectListPreference") {
                preference.MultiSelectListPreferenceCurrentValue =
                  preferencesHere;
              }
              sourceSettings = ss;
              open = false;
            });
        }}
      >
        Save <Icon icon="lucide:save" />
      </Button>
    </div>
  </Dialog.Content>
</Dialog.Root>
