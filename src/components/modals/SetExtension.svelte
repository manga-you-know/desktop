<script lang="ts">
  import {
    Badge,
    Button,
    Checkbox,
    ContextMenu,
    Dialog,
    Label,
    Switch,
  } from "@/lib/components";
  import { cn, getLangNative, prettifyRepo } from "@/lib/utils";
  import {
    suwayomiUrl,
    openedExtension,
    suwayomi,
    hiddenSources,
    openExtensions,
    enabledSources,
  } from "@/states";
  import { Image, SelectEditSourceSetting, Tooltip } from "@/components";
  import { suwaManager } from "@/lib/helpers";
  import Icon from "@iconify/svelte";
  import type { Extension, Source, Preference, SourceSettings } from "@/types";
  import { flip } from "svelte/animate";

  let isInstalling = $state(false);

  let sources: Source[] = $derived(
    suwayomi.rawSources
      .filter(
        (s) => s.extension.pkgName === openedExtension.value.extension?.pkgName,
      )
      .sort((a, b) => {
        const aAllowed = enabledSources.value[a.id] ? 1 : 0;
        const bAllowed = enabledSources.value[b.id] ? 1 : 0;
        if (aAllowed !== bAllowed) return bAllowed - aAllowed;
        const aName = getLangNative(a.lang);
        const bName = getLangNative(b.lang);
        return aName.localeCompare(bName, "en", { sensitivity: "base" });
      }),
  );

  let enabledSourcesHere: Source[] = $derived(
    sources.filter((s) => enabledSources.value[s.id]),
  );

  let sourceSettings: SourceSettings | undefined = $state();
  let tab: "extension" | "source" = $state("extension");
  openedExtension.onvaluechange = (value) => {
    if (value.source) {
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

  let selectedPreference: Preference | undefined = $state(undefined);

  let openSetting = $state(false);
</script>

<Dialog.Root bind:open={openedExtension.active}>
  <Dialog.Content
    class="data-[state=closed]:slide-out-to-right-1/2 data-[state=open]:slide-in-from-right-1/2"
  >
    {#if sourceSettings && selectedPreference}
      <SelectEditSourceSetting
        bind:open={openSetting}
        bind:sourceSettings
        bind:preference={selectedPreference}
      />
    {/if}
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
                  {getLangNative(openedExtension.value.extension.lang)}
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
                    openedExtension.value.extension.isInstalled = (
                      await suwaManager.updateExtension(
                        openedExtension.value.extension.pkgName,
                        "install",
                        !openedExtension.value.extension.isInstalled,
                      )
                    ).isInstalled;
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
              </div>
            </div>
            <div class="flex gap-3">
              <Label class="text-xl">Sources</Label>
              <Tooltip
                text="{enabledSourcesHere.length} sources enabled of {sources.length}"
              >
                <Badge
                  class="min-w-8 rounded-xl text-sm font-bold"
                  variant="outline"
                >
                  {enabledSourcesHere.length}
                  /
                  {sources.length}
                </Badge>
              </Tooltip>
            </div>
            <div class="flex h-60 flex-col overflow-y-scroll rounded-xl">
              {#each sources as source (source.id)}
                <div animate:flip>
                  <ContextMenu.Root>
                    <ContextMenu.Trigger>
                      <Tooltip
                        text={source.displayName}
                        subtext="Language: {getLangNative(source.lang)}"
                        placement="left"
                      >
                        <Button
                          class="bg-background group/extension hover:bg-secondary/40 m-0.5 flex h-10 w-105 items-center justify-between gap-2 rounded-xl p-2 hover:no-underline!"
                          variant="link"
                          onclick={() => {
                            if (enabledSources.value[source.id.toString()]) {
                              enabledSources.value = {
                                ...enabledSources.value,
                                [source.id.toString()]: false,
                              };
                            } else {
                              enabledSources.value = {
                                ...enabledSources.value,
                                [source.id.toString()]: true,
                              };
                            }
                          }}
                        >
                          <div
                            class="pointer-events-none flex items-center gap-2"
                          >
                            <div
                              class="gap-0.1 flex flex-col items-start justify-center"
                            >
                              <Label
                                class="max-w-54 cursor-pointer truncate text-base text-gray-500 group-hover/extension:underline!"
                              >
                                {getLangNative(source.lang)}
                              </Label>
                              <!-- <div class="flex w-18 justify-between"> -->
                              <!--   <span class="text-gray-500"> -->
                              <!--     <!-- {sources[0].displayName} -->
                              <!--     {getLang(source.lang)} -->
                              <!--   </span> -->
                              <!--   <span class="text-red-500"> -->
                              <!--     {source.isNsfw ? "+18" : ""} -->
                              <!--   </span> -->
                              <!-- </div> -->
                            </div>
                          </div>
                          <div class="flex items-center gap-2">
                            {#if source.isConfigurable && enabledSources.value[source.id.toString()]}
                              <Button
                                class="h-8 w-9 rounded-lg"
                                variant="ghost"
                                onclick={(e) => {
                                  e.stopPropagation();
                                  openedExtension.set({
                                    source: source,
                                    extension: openedExtension.value.extension,
                                  });
                                  openExtensions.close();
                                  openedExtension.open();
                                  openedExtension.onopenchange = (open) => {
                                    if (!open) {
                                      openExtensions.open();
                                      openedExtension.value = {};
                                    }
                                  };
                                }}
                              >
                                <Icon icon="lucide:settings" />
                              </Button>
                            {/if}
                            <Switch
                              checked={enabledSources.value[
                                source.id.toString()
                              ]}
                              onclick={async (e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                if (
                                  enabledSources.value[source.id.toString()]
                                ) {
                                  enabledSources.value = {
                                    ...enabledSources.value,
                                    [source.id.toString()]: false,
                                  };
                                } else {
                                  enabledSources.value = {
                                    ...enabledSources.value,
                                    [source.id.toString()]: true,
                                  };
                                }
                              }}
                            />
                          </div>
                        </Button>
                      </Tooltip>
                    </ContextMenu.Trigger>
                    <ContextMenu.Content>
                      <ContextMenu.Item
                        class="flex justify-between"
                        onclick={() => {
                          openedExtension.set({
                            extension: openedExtension.value.extension,
                          });
                          openExtensions.close();
                          openedExtension.open();
                          openedExtension.onopenchange = (open) => {
                            if (!open) {
                              openExtensions.open();
                              openedExtension.value = {};
                            }
                          };
                        }}
                      >
                        <Label>See extension</Label>
                        <Icon icon="lucide:square-menu" />
                      </ContextMenu.Item>
                      <ContextMenu.Item
                        class="flex justify-between"
                        onclick={(e) => {
                          e.stopPropagation();
                          if (hiddenSources.value[source.id.toString()]) {
                            hiddenSources.value = {
                              ...hiddenSources.value,
                              [source.id.toString()]: false,
                            };
                          } else {
                            hiddenSources.value = {
                              ...hiddenSources.value,
                              [source.id.toString()]: true,
                            };
                          }
                        }}
                      >
                        <Label>
                          {hiddenSources.value[source.id.toString()]
                            ? "Unhide"
                            : "Hide"} source
                        </Label>
                        <Icon
                          icon={hiddenSources.value[source.id.toString()]
                            ? "lucide:eye"
                            : "lucide:eye-off"}
                        />
                      </ContextMenu.Item>
                    </ContextMenu.Content>
                  </ContextMenu.Root>
                </div>
              {/each}
            </div>
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
                  getLangNative(openedExtension.value.source?.lang ?? "")}
              </Label>
            </Badge>
            <div class="flex h-120 flex-col gap-0.5 overflow-scroll rounded-xl">
              {#each sourcePreferences as preference, i}
                {#if preference.type === "CheckBoxPreference"}
                  <Button
                    class="h-fit w-full justify-between rounded-xl"
                    variant="ghost"
                    onclick={() => {
                      suwaManager
                        .setSourceSettingPreference({
                          source: openedExtension.value.source?.id ?? "",
                          change: {
                            position: i,
                            switchState:
                              !preference.CheckBoxCheckBoxCurrentValue,
                          },
                        })
                        .then((ss) => {
                          sourceSettings = ss;
                        });
                    }}
                  >
                    <div class="flex flex-col items-start gap-1">
                      <Label class="cursor-pointer">
                        {preference.CheckBoxTitle}
                      </Label>
                      <span class="text-xs text-wrap text-gray-500">
                        {preference.summary}
                      </span>
                    </div>
                    <Checkbox
                      class="pointer-events-none"
                      checked={preference.CheckBoxCheckBoxCurrentValue}
                    />
                  </Button>
                {:else if preference.type === "SwitchPreference"}
                  <Button
                    class="h-fit w-full justify-between rounded-xl"
                    variant="ghost"
                    onclick={() => {
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
                  >
                    <div class="flex flex-col items-start gap-1">
                      <Label class="cursor-pointer">
                        {preference.SwitchPreferenceTitle}
                      </Label>
                      <span class="text-start text-xs text-wrap text-gray-500">
                        {preference.summary}
                      </span>
                    </div>
                    <Switch
                      class="pointer-vents-none"
                      checked={preference.SwitchPreferenceCurrentValue}
                    />
                  </Button>
                {:else if preference.type === "EditTextPreference"}
                  <Button
                    class="h-fit justify-start rounded-xl text-wrap"
                    variant="ghost"
                    onclick={() => {
                      selectedPreference = preference;
                      openSetting = true;
                    }}
                  >
                    <div class="flex flex-col items-start gap-1">
                      <Label class="cursor-pointer">
                        {preference.EditTextPreferenceTitle}
                      </Label>
                      <span class="text-start text-xs text-wrap text-gray-500">
                        {preference.summary}
                      </span>
                    </div>
                  </Button>
                {:else if preference.type === "ListPreference"}
                  <Button
                    class="h-fit justify-start rounded-xl text-wrap"
                    variant="ghost"
                    onclick={() => {
                      selectedPreference = preference;
                      openSetting = true;
                    }}
                  >
                    <div class="flex flex-col items-start gap-1">
                      <Label class="cursor-pointer">
                        {preference.ListPreferenceTitle}
                      </Label>
                      <span class="text-start text-xs text-wrap text-gray-500">
                        {preference.entries[
                          preference.entryValues.indexOf(
                            preference.ListPreferenceCurrentValue,
                          )
                        ]}
                      </span>
                    </div>
                  </Button>
                {:else if preference.type === "MultiSelectListPreference"}
                  <Button
                    class="h-fit justify-start rounded-xl"
                    variant="ghost"
                    onclick={() => {
                      selectedPreference = preference;
                      openSetting = true;
                    }}
                  >
                    <div class="flex flex-col items-start gap-1">
                      <Label class="cursor-pointer">
                        {preference.MultiSelectListPreferenceTitle}
                      </Label>
                      <span class="text-start text-xs text-wrap text-gray-500">
                        {preference.summary}
                      </span>
                    </div>
                  </Button>
                {/if}
              {/each}
            </div>
          </div>
        </div>
      </div>
    {/if}
  </Dialog.Content>
</Dialog.Root>
