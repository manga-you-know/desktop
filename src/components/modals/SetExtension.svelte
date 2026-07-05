<script lang="ts">
  import {
    Badge,
    Button,
    Checkbox,
    ContextMenu,
    Dialog,
    Input,
    Label,
    Switch,
  } from "@/lib/components";
  import {
    cn,
    getBasePath,
    getLangName,
    getLangNative,
    prettifyRepo,
  } from "@/lib/utils";
  import {
    suwayomiUrl,
    openedExtension,
    suwayomi,
    hiddenSources,
    openExtensions,
    enabledSources,
    disableAutoUpdateByExtension,
    autoUpdateExtensions,
    favoriteSources,
  } from "@/states";
  import {
    AskSure,
    Image,
    SelectEditSourceSetting,
    Tooltip,
  } from "@/components";
  import { suwaManager } from "@/lib/helpers";
  import Icon from "@iconify/svelte";
  import type { Extension, Source, Preference, SourceSettings } from "@/types";
  import { flip } from "svelte/animate";
  import { ScrollingValue } from "svelte-ux";

  let isInstalling = $state(false);
  let selectedPreference: Preference | undefined = $state(undefined);
  let isUpdating = $state(false);

  let openSetting = $state(false);
  let openAskSure = $state(false);
  let querySources = $state("");

  let sources: Source[] = $derived(
    suwayomi.rawSources
      .filter(
        (s) =>
          s.extension.pkgName === openedExtension.value.extension?.pkgName &&
          !hiddenSources.value[s.id],
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

  let filteredSources: Source[] = $derived(
    sources.filter(
      (s) =>
        s.lang.toLowerCase().includes(querySources.toLowerCase()) ||
        getLangName(s.lang)
          .toLowerCase()
          .includes(querySources.toLowerCase()) ||
        getLangNative(s.lang)
          .toLowerCase()
          .includes(querySources.toLowerCase()),
    ),
  );

  let sourceSettings: SourceSettings | undefined = $state();
  let tab: "extension" | "source" = $state("extension");
  openedExtension.onvaluechange = (value) => {
    isInstalling = false;
    isUpdating = false;
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

  const toggleInstalled = async () => {
    if (openedExtension.value.extension === undefined) return;
    if (!openedExtension.value.extension.isInstalled) {
      isInstalling = true;
    }
    openedExtension.value.extension.isInstalled = (
      await suwaManager.patchExtension(
        openedExtension.value.extension.pkgName,
        openedExtension.value.extension.isInstalled ? "uninstall" : "install",
      )
    ).isInstalled;
    suwaManager.getExtensions();
    isInstalling = false;
  };
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
    <AskSure
      bind:open={openAskSure}
      message="You have {enabledSourcesHere.length} sources enabled from this extension."
      deleteText="Uninstall"
      overlayClass="bg-black/30"
      onokay={toggleInstalled}
    />
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
              <div class="flex flex-col gap-0.5">
                <span>
                  {openedExtension.value.extension.name}
                </span>
                <span class="flex gap-3 text-base">
                  {openedExtension.value.extension.versionName}
                  <span class="text-red-500">
                    {openedExtension.value.extension.isNsfw ? "+18" : ""}
                  </span>
                </span>
              </div>
            </Dialog.Title>
            <div class="flex w-full flex-col gap-2">
              <div class="flex flex-col items-center gap-0.5 p-3 **:text-base">
                <Badge class="flex w-full gap-3" variant="outline">
                  <span class="text-sm! text-gray-400">Language:</span>
                  {getLangNative(openedExtension.value.extension.lang)}
                </Badge>
                <Badge class="flex w-full gap-3" variant="outline">
                  <span class="text-sm! text-gray-400">Repository:</span>
                  {prettifyRepo(openedExtension.value.extension.repo)}
                </Badge>
              </div>
              <div class="flex items-center justify-center gap-2">
                <Button
                  class="w-40"
                  disabled={!autoUpdateExtensions.value ||
                    !openedExtension.value.extension.isInstalled}
                  variant="secondary"
                  onclick={() => {
                    const extensionId =
                      openedExtension.value.extension?.pkgName ?? "";
                    if (disableAutoUpdateByExtension.value[extensionId]) {
                      disableAutoUpdateByExtension.value = {
                        ...disableAutoUpdateByExtension.value,
                        [extensionId]: false,
                      };
                    } else {
                      disableAutoUpdateByExtension.value = {
                        ...disableAutoUpdateByExtension.value,
                        [extensionId]: true,
                      };
                    }
                  }}
                >
                  <Checkbox
                    class="pointer-events-none"
                    checked={!disableAutoUpdateByExtension.value[
                      openedExtension.value.extension.pkgName
                    ]}
                  />
                  Auto update
                </Button>
                <Button
                  class="w-40"
                  variant={openedExtension.value.extension.hasUpdate
                    ? "info"
                    : "outline"}
                  disabled={isUpdating ||
                    !openedExtension.value.extension.hasUpdate}
                  onclick={async () => {
                    isUpdating = true;
                    openedExtension.value.extension =
                      await suwaManager.patchExtension(
                        openedExtension.value.extension?.pkgName ?? "",
                        "update",
                      );
                    isUpdating = false;
                  }}
                >
                  <Icon
                    class={cn(isUpdating && "animate-spin")}
                    icon={openedExtension.value.extension.hasUpdate
                      ? "lucide:refresh-cw"
                      : "lucide:check"}
                  />
                  {openedExtension.value.extension.hasUpdate
                    ? "Update"
                    : "Up to date"}
                </Button>
                <Button
                  class="w-40"
                  variant={isInstalling
                    ? "outline"
                    : openedExtension.value.extension.isInstalled
                      ? "destructive"
                      : "default"}
                  onclick={() => {
                    if (enabledSourcesHere.length > 0) {
                      openAskSure = true;
                    } else {
                      toggleInstalled();
                    }
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
                  class="min-w-16 rounded-xl text-sm font-bold"
                  variant="outline"
                >
                  <ScrollingValue value={enabledSourcesHere.length} />
                  /
                  <ScrollingValue value={sources.length} />
                </Badge>
              </Tooltip>
            </div>
            <div class="flex justify-center gap-2 pr-6 pl-2">
              <Badge class="min-w-12" variant="outline">
                <ScrollingValue value={filteredSources.length} />
              </Badge>
              <Input
                class="w-full"
                divClass="w-full"
                variant="outline"
                placeholder="Search languages..."
                bind:value={querySources}
              />
              <Button
                class="w-40"
                variant={enabledSourcesHere.length === sources.length
                  ? "secondary"
                  : "default"}
                onclick={() => {
                  const data: Record<string, boolean> = {};
                  const isEnable = enabledSourcesHere.length !== sources.length;
                  for (let source of sources) {
                    data[source.id] = isEnable;
                  }
                  enabledSources.value = {
                    ...enabledSources.value,
                    ...data,
                  };
                }}
              >
                {enabledSourcesHere.length === sources.length
                  ? "Disable"
                  : "Enable"} all
              </Button>
            </div>
            <div class="flex h-84 flex-col overflow-y-scroll rounded-xl">
              {#each filteredSources as source (source.id)}
                <div animate:flip={{ duration: querySources === "" ? 500 : 0 }}>
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
                            if (enabledSources.value[source.id]) {
                              enabledSources.value = {
                                ...enabledSources.value,
                                [source.id]: false,
                              };
                            } else {
                              enabledSources.value = {
                                ...enabledSources.value,
                                [source.id]: true,
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
                            </div>
                          </div>
                          <div class="flex items-center gap-1">
                            {#if source.isConfigurable && enabledSources.value[source.id.toString()]}
                              <Button
                                class="h-8 w-9 rounded-lg"
                                variant="ghost"
                                onclick={(e) => {
                                  e.stopPropagation();
                                  openExtensions.close();
                                  openedExtension.open({
                                    source: source,
                                    extension: openedExtension.value.extension,
                                  });
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
                            <Tooltip
                              text="{favoriteSources.value[source.id]
                                ? 'Unfavorite'
                                : 'Favorite'} source {source.displayName}"
                            >
                              <Button
                                class={cn(
                                  "h-8 w-9 max-w-0 rounded-4xl px-0 opacity-0 transition-all duration-500",
                                  enabledSources.value[source.id] &&
                                    "max-w-9 px-2 opacity-100",
                                )}
                                variant={favoriteSources.value[source.id]
                                  ? "default"
                                  : "ghost"}
                                onclick={(e) => {
                                  e.stopPropagation();
                                  if (favoriteSources.value[source.id]) {
                                    favoriteSources.value = {
                                      ...favoriteSources.value,
                                      [source.id]: false,
                                    };
                                  } else {
                                    favoriteSources.value = {
                                      ...favoriteSources.value,
                                      [source.id]: true,
                                    };
                                  }
                                }}
                              >
                                <Icon
                                  class={cn(
                                    "transition-transform duration-400",
                                    favoriteSources.value[source.id] &&
                                      "rotate-360",
                                  )}
                                  icon={favoriteSources.value[source.id]
                                    ? "lucide:star"
                                    : "lucide:star-off"}
                                />
                              </Button>
                            </Tooltip>
                            <Switch
                              checked={enabledSources.value[source.id]}
                              onclick={async (e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                if (enabledSources.value[source.id]) {
                                  enabledSources.value = {
                                    ...enabledSources.value,
                                    [source.id]: false,
                                  };
                                } else {
                                  enabledSources.value = {
                                    ...enabledSources.value,
                                    [source.id]: true,
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
                          openExtensions.close();
                          openedExtension.open({
                            extension: openedExtension.value.extension,
                          });
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
              {:else}
                <div class="flex flex-col w-full items-center mt-20">
                  <Label class="text-xl">
                    No sources{!openedExtension.value.extension.isInstalled
                      ? "... You could install it... "
                      : " found..."}
                  </Label>
                  <Label class="text-3xl">ヽ( `д´*)ノ</Label>
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
