<script lang="ts">
  import {
    Badge,
    Button,
    Checkbox,
    Dialog,
    Label,
    Switch,
  } from "@/lib/components";
  import { cn, getLang, prettifyRepo } from "@/lib/utils";
  import { suwayomiUrl, openedExtension, suwayomi } from "@/states";
  import { Image } from "@/components";
  import { suwaManager } from "@/lib/helpers";
  import Icon from "@iconify/svelte";
  import type { Extension, Source, Preference, SourceSettings } from "@/types";

  let isInstalling = $state(false);

  let sources: Source[] = $derived(
    suwayomi.rawSources.filter(
      (s) => s.extension.pkgName === openedExtension.value.extension?.pkgName,
    ),
  );

  let sourceSettings: SourceSettings | undefined = $state();
  let tab: "extension" | "source" = $state("extension");
  openedExtension.onvaluechange = (value) => {
    if (value.source !== undefined) {
      tab = "source";
      if (value.source.id !== sourceSettings?.id) {
        sourceSettings = undefined;
      }
      suwaManager.getSourceSettings(value.source.id).then((ss) => {
        sourceSettings = ss;
      });
    } else {
      sourceSettings = undefined;
      tab = "extension";
    }
  };
  let sourcePreferences: Preference[] = $derived(
    sourceSettings !== undefined ? sourceSettings.preferences : [],
  );
</script>

<Dialog.Root bind:open={openedExtension.active}>
  <Dialog.Content
    class="data-[state=closed]:slide-out-to-right-1/2 data-[state=open]:slide-in-from-right-1/2"
  >
    {#if openedExtension.value?.extension}
      <div class="relative mb-2 overflow-hidden">
        <div
          class="flex transition-transform duration-500 ease-in-out"
          style="width: 200%; transform: translateX({tab === 'extension'
            ? '0%'
            : '-50%'})"
        >
          <div class="flex w-1/2 flex-col gap-3">
            <Dialog.Title class="flex items-center gap-2 text-2xl">
              <Image
                class="size-16"
                src={suwayomiUrl.value +
                  openedExtension.value.extension.iconUrl}
              />
              {openedExtension.value.extension.name}
            </Dialog.Title>
            <div class="flex w-full">
              <div
                class="flex w-1/2 flex-col items-center gap-2 **:py-1 **:text-lg/5"
              >
                <Badge
                  class="flex w-full flex-col rounded-xl"
                  variant="secondary"
                >
                  {getLang(openedExtension.value.extension.lang)}
                  <span class="text-sm! text-gray-400">Language</span>
                </Badge>
                <Badge
                  class="flex w-full flex-col rounded-xl"
                  variant="default"
                >
                  {prettifyRepo(openedExtension.value.extension.repo)}
                  <span class="text-sm! text-gray-500">Repository</span>
                </Badge>
                <div
                  class={cn(
                    "flex w-full gap-2",
                    openedExtension.value.extension.isNsfw && "pr-2",
                  )}
                >
                  <Badge
                    class={cn(
                      "flex flex-col rounded-xl",
                      openedExtension.value.extension.isNsfw
                        ? "w-1/2"
                        : "w-full",
                    )}
                    variant="outline"
                  >
                    {openedExtension.value.extension.versionName}
                    <span class="text-sm! text-gray-500">Version</span>
                  </Badge>
                  {#if openedExtension.value.extension.isNsfw}
                    <Badge
                      class="flex w-1/2 flex-col rounded-xl"
                      variant="destructive"
                    >
                      +18
                      <span class="text-sm! text-gray-400">Age rating</span>
                    </Badge>
                  {/if}
                </div>
              </div>
              <div class="flex w-1/2 flex-col items-center gap-2">
                <Button
                  class="h-10 w-28 rounded-lg font-bold"
                  variant={isInstalling
                    ? "outline"
                    : openedExtension.value.extension.isInstalled
                      ? "destructive"
                      : "default"}
                  onclick={async () => {
                    if (openedExtension.value.extension === undefined) return;
                    if (!openedExtension.value.extension.isInstalled) {
                      isInstalling = true;
                    }
                    openedExtension.value.extension.isInstalled =
                      await suwaManager.updateExtension(
                        openedExtension.value.extension.pkgName,
                        !openedExtension.value.extension.isInstalled,
                      );
                    suwaManager.getExtensions();
                    isInstalling = false;
                  }}
                >
                  <Icon
                    icon={isInstalling
                      ? ""
                      : openedExtension.value.extension.isInstalled
                        ? "lucide:trash"
                        : "lucide:download"}
                  />
                  {isInstalling
                    ? "..."
                    : openedExtension.value.extension.isInstalled
                      ? "Uninstall"
                      : "Install"}
                </Button>
                <Button
                  class="rounded-xl"
                  variant="outline"
                  disabled={!openedExtension.value.extension.isInstalled}
                >
                  <Icon icon="lucide:settings" /> Settings
                </Button>
                <Label>Sources</Label>
                <div class="flex h-80 flex-col overflow-y-scroll"></div>
              </div>
            </div>
            <div class="flex gap-1"></div>
          </div>
          <div class="flex w-1/2 flex-col gap-2">
            <Button
              class="w-9/10 justify-start rounded-xl text-xl"
              onclick={() => {
                tab = "extension";
                // openedExtension.set({
                //   extension: openedExtension.value.extension,
                // })}
              }}
            >
              <Icon icon="lucide:arrow-left" />
              <!-- <span class="flex w-full items-center justify-end gap-2"> -->
              <Image
                class="size-10"
                src={suwayomiUrl.value +
                  openedExtension.value.extension.iconUrl}
              />
              {openedExtension.value.extension.name}
              <!-- </span> -->
            </Button>
            <Badge
              class="flex w-full justify-center rounded-xl"
              variant="secondary"
            >
              <Label class="flex w-full justify-center text-xl">
                {openedExtension.value.source?.displayName +
                  " - " +
                  getLang(openedExtension.value.source?.lang ?? "")}
              </Label>
            </Badge>
            <div class="flex h-120 flex-col gap-4 overflow-scroll">
              {#each sourcePreferences as preference, i}
                {#if preference.type === "CheckBoxPreference"}
                  <Checkbox checked={preference.CheckBoxCheckBoxCurrentValue} />
                {:else if preference.type === "SwitchPreference"}
                  <div
                    class="flex w-full items-center justify-between gap-2 pr-3"
                  >
                    <div class="flex flex-col gap-1">
                      <Label>{preference.SwitchPreferenceTitle}</Label>
                      <span class="text-xs text-gray-500">
                        {preference.summary}
                      </span>
                    </div>
                    <Switch
                      checked={preference.SwitchPreferenceCurrentValue}
                      onclick={(e) => {
                        e.preventDefault();
                        suwaManager
                          .setSourceSettingPreference({
                            source: openedExtension.value.source?.id ?? "",
                            change: {
                              position: i,
                              switchState:
                                !preference.SwitchPreferenceCurrentValue,
                            },
                          })
                          .then((ss) => {
                            sourceSettings = ss;
                          });
                      }}
                    />
                  </div>
                {:else if preference.type === "EditTextPreference"}{:else if preference.type === "ListPreference"}{:else if preference.type === "MultiSelectListPreference"}{/if}
              {/each}
            </div>
          </div>
        </div>
      </div>
    {/if}
  </Dialog.Content>
</Dialog.Root>
