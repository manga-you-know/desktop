<script lang="ts">
  import {
    Badge,
    Button,
    Checkbox,
    Input,
    Label,
    Popover,
    DropdownMenu,
    ContextMenu,
  } from "@/lib/components";
  import { Image, Tooltip } from "@/components";
  import { cn, getLangName, getLangNative } from "@/lib/utils";
  import {
    enabledSources,
    groupSources,
    openedExtension,
    pinnedSources,
    selectedGroupSource,
    selectedSourceId,
    crEvent,
    showExtensionsSourcesContentWarning,
    sourceGroupMode,
    suwayomi,
    compactSourceSelector,
  } from "@/states";
  import Icon from "@iconify/svelte";
  import { ScrollingValue } from "svelte-ux";
  import { animate } from "animejs";
  import { VList } from "virtua/svelte";
  import type { Source } from "@/types";
  import { delay } from "@/utils";
  import { suwaManager } from "@/lib/helpers";

  type Props = {
    open: boolean;
    selectedSource: Source;
  };

  let { open = $bindable(false), selectedSource }: Props = $props();

  let openCreateGroup = $state(false);
  let createGroupInput = $state("");
  let selectSourceFilter = $state("");
  let disabledLangs: Record<string, boolean> = $state({});
  let groupByLangSources = $derived(
    Object.entries(Object.groupBy(suwayomi.enabledSources, (s) => s.lang))
      .map(([lang, sources]) => {
        return {
          lang: lang,
          count: sources?.length ?? 0,
        };
      })
      .sort((a, b) => {
        if (a.lang === "all") return -1;
        if (b.lang === "all") return 1;
        const aName = getLangNative(a.lang);
        const bName = getLangNative(b.lang);
        return aName.localeCompare(bName, "en", { sensitivity: "base" });
      }),
  );
  let filteredSources = $derived(
    suwayomi.enabledSources
      .filter(
        (s) =>
          (s.displayName
            .toLowerCase()
            .includes(selectSourceFilter.toLowerCase()) ||
            s.name.toLowerCase().includes(selectSourceFilter.toLowerCase()) ||
            s.lang.toLowerCase().includes(selectSourceFilter.toLowerCase()) ||
            getLangNative(s.lang)
              .toLowerCase()
              .includes(selectSourceFilter.toLowerCase()) ||
            getLangName(s.lang)
              .toLowerCase()
              .includes(selectSourceFilter.toLowerCase())) &&
          (selectedSourceId.value === s.id ? true : !disabledLangs[s.lang]) &&
          (showExtensionsSourcesContentWarning.value === "NSFW"
            ? true
            : showExtensionsSourcesContentWarning.value === "MIXED"
              ? s.contentWarning !== "NSFW"
              : s.contentWarning === "SAFE"),
      )
      .sort((a, b) => {
        const aPinned = !!pinnedSources.value[a.id];
        const bPinned = !!pinnedSources.value[b.id];
        if (aPinned === bPinned) return 0;
        return aPinned ? -1 : 1;
      }),
  );

  let countGroup = $derived<number>(
    selectedGroupSource.value.toLowerCase() === "pinned sources"
      ? suwayomi.enabledSources.filter((s) => pinnedSources.value[s.id]).length
      : selectedGroupSource.value.toLowerCase() === "active sources"
        ? suwayomi.enabledSources.length
        : groupSources.value[selectedGroupSource.value].length,
  );
</script>

<Popover.Root bind:open>
  <Popover.Trigger class="flex items-center">
    <Tooltip
      text="Select source {sourceGroupMode.value !== 'single' ? 'group' : ''}"
      subtext={sourceGroupMode.value === "single"
        ? selectedSource.displayName
          ? `${selectedSource.displayName} • ${selectedSource.extension.versionName}${selectedSource.extension.hasUpdate ? " • Update available" : ""}`
          : "None"
        : selectedGroupSource.value}
      delay={600}
      placement="bottom"
    >
      <ContextMenu.Root
        onOpenChange={(v) => {
          if (v) {
            open = false;
          }
        }}
      >
        <ContextMenu.Trigger
          disabled={sourceGroupMode.value === "group" || !selectedSource}
        >
          <Button
            class={cn(
              "group/select relative h-12.5! w-55 justify-start",
              sourceGroupMode.value === "single" ? "px-2" : "pr-2",
              !selectedSource &&
                sourceGroupMode.value === "single" &&
                "text-primary/70 pl-4",
            )}
            variant="outline"
            id="source-select"
          >
            {#if sourceGroupMode.value === "single"}
              {#if selectedSource}
                <Image class="size-10" src={selectedSource.iconUrl} />
                <span class="flex flex-col truncate text-start font-bold">
                  {selectedSource.displayName}
                  {#if !compactSourceSelector.value}
                    <span
                      class="flex items-center gap-0.75 truncate text-start text-[9px]"
                    >
                      <span class="text-start">
                        {getLangNative(selectedSource.lang)}
                      </span>
                      <span class="text-start">
                        ·
                        {selectedSource.extension.versionName}
                      </span>
                      {#if selectedSource.contentWarning !== "SAFE"}
                        ·
                        {#if selectedSource.contentWarning === "MIXED"}
                          <span class="text-purple-600">MIXED</span>
                        {:else}
                          <span class="text-destructive">NSFW</span>
                        {/if}
                      {/if}
                    </span>
                  {/if}
                </span>
                {#if selectedSource.extension.hasUpdate}
                  <Icon
                    class="text-info bg-secondary/80 absolute top-0.5 left-0.5 size-5! rounded-lg p-0.5 transition-opacity duration-500 group-hover/select:opacity-0"
                    icon="lucide:refresh-cw"
                  />
                {/if}
                <Tooltip text="Update source extension" delay={800}>
                  <Button
                    class={cn(
                      "bg-info/40 hover:bg-info/70 hover:border-background border-info pointer-events-none absolute -top-2 -left-1 size-8 -translate-x-4 rounded-xl opacity-0 backdrop-blur-sm transition-all duration-500",
                      selectedSource.extension.hasUpdate &&
                        "pointer-events-auto group-hover/select:translate-x-0 group-hover/select:opacity-100",
                      crEvent.val[
                        `ext-update-${selectedSource.extension.pkgName}`
                      ] && "translate-x-0 opacity-100",
                    )}
                    variant="outline"
                    onclick={() => {
                      suwaManager.patchExtension(
                        selectedSource.extension.pkgName,
                        "update",
                      );
                    }}
                  >
                    <Icon
                      class={cn(
                        "rotate-0 transition-all duration-500 group-hover/select:rotate-180",
                        crEvent.val[
                          `ext-update-${selectedSource.extension.pkgName}`
                        ] && "animate-spin",
                        // openedExtension.active ? "rotate-180" : "rotate-0",
                      )}
                      icon="lucide:refresh-cw"
                    />
                  </Button>
                </Tooltip>
                <Tooltip text="Source config" delay={800}>
                  <Button
                    class={cn(
                      "hover:bg-secondary/20 hover:border-background pointer-events-none absolute -top-2 -right-1 size-8 translate-x-4 rounded-xl opacity-0 backdrop-blur-sm transition-all duration-500",
                      selectedSource.isConfigurable &&
                        "pointer-events-auto group-hover/select:translate-x-0 group-hover/select:opacity-100",
                    )}
                    variant="outline"
                    onclick={(e) => {
                      e.stopPropagation();
                      openedExtension.open({
                        source: selectedSource,
                        extension:
                          suwayomi.extensionsByPkgName[
                            selectedSource.extension.pkgName
                          ],
                      });
                      open = false;
                    }}
                  >
                    <Icon
                      class="rotate-0 transition-all duration-500 group-hover/select:-rotate-180"
                      icon="lucide:settings"
                    />
                  </Button>
                </Tooltip>
              {:else}
                {suwayomi.enabledSources.length === 0
                  ? "No enabled sources."
                  : "Select a source..."}
              {/if}
            {:else}
              <div
                class="flex w-full items-center justify-center gap-2 font-bold"
              >
                {#if selectedGroupSource.value.toLowerCase() === "pinned sources"}
                  <Icon icon="lucide:pin" />
                  <Label class="cursor-pointer font-bold">Pinned sources</Label>
                {:else if selectedGroupSource.value.toLowerCase() === "active sources"}
                  <Icon icon="lucide:globe" />
                  <Label class="cursor-pointer font-bold">Active sources</Label>
                {:else}
                  <Label class="cursor-pointer truncate text-ellipsis">
                    {selectedGroupSource.value}
                  </Label>
                {/if}
              </div>
              <Badge
                class="group-hover/select:bg-background/40 h-8 min-w-8 rounded-lg"
                variant="secondary"
              >
                <ScrollingValue value={countGroup} />
              </Badge>
            {/if}
          </Button>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          {#if sourceGroupMode.value === "single"}
            {#if selectedSource}
              <ContextMenu.Item
                onclick={(e) => {
                  e.preventDefault();
                  if (pinnedSources.value[selectedSource.id]) {
                    pinnedSources.value = {
                      ...pinnedSources.value,
                      [selectedSource.id]: false,
                    };
                  } else {
                    pinnedSources.value = {
                      ...pinnedSources.value,
                      [selectedSource.id]: true,
                    };
                  }
                }}
              >
                <Icon
                  icon={pinnedSources.value[selectedSource.id]
                    ? "lucide:pin"
                    : "lucide:pin-off"}
                />
                {pinnedSources.value[selectedSource.id] ? "Unpin" : "Pin"} source
              </ContextMenu.Item>
              <ContextMenu.Sub>
                <ContextMenu.SubTrigger
                  disabled={Object.keys(groupSources.value).length === 0}
                >
                  <Icon icon="lucide:blocks" />Add group
                </ContextMenu.SubTrigger>
                <ContextMenu.SubContent class="max-h-40 overflow-y-scroll">
                  {#each Object.entries(groupSources.value) as group (group[0])}
                    <ContextMenu.Item
                      class="justify-between"
                      onclick={(e) => {
                        e.preventDefault();
                        if (group[1].includes(selectedSourceId.value)) {
                          const groupItems = group[1].filter(
                            (s) => s !== selectedSource.id,
                          );
                          groupSources.value = {
                            ...groupSources.value,
                            [group[0]]: groupItems,
                          };
                        } else {
                          const groupItems = [...group[1], selectedSource.id];
                          groupSources.value = {
                            ...groupSources.value,
                            [group[0]]: groupItems,
                          };
                        }
                      }}
                    >
                      {group[0]}
                      <Icon
                        class={cn(
                          group[1].includes(selectedSource.id)
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                        icon="lucide:check"
                      />
                    </ContextMenu.Item>
                  {/each}
                </ContextMenu.SubContent>
              </ContextMenu.Sub>
              <ContextMenu.Separator />
              <ContextMenu.Item
                onclick={() => {
                  openedExtension.open({
                    extension:
                      suwayomi.extensionsByPkgName[
                        selectedSource.extension.pkgName
                      ],
                  });
                  open = false;
                }}
              >
                <Icon icon="lucide:info" />
                See extension
              </ContextMenu.Item>
              <ContextMenu.Item
                disabled={!selectedSource?.isConfigurable}
                onclick={() => {
                  openedExtension.open({
                    source: selectedSource,
                    extension:
                      suwayomi.extensionsByPkgName[
                        selectedSource.extension.pkgName
                      ],
                  });
                  open = false;
                }}
              >
                <Icon icon="lucide:settings" />
                Configure
              </ContextMenu.Item>
              {#if selectedSource.extension.hasUpdate}
                <ContextMenu.Item
                  class="text-info data-highlighted:text-info/90"
                  onclick={() => {
                    suwaManager.patchExtension(
                      selectedSource.extension.pkgName,
                      "update",
                    );
                  }}
                >
                  <Icon icon="lucide:refresh-cw" />
                  Update extension
                </ContextMenu.Item>
              {/if}
              <ContextMenu.Item
                class="text-red-600 data-highlighted:text-red-400"
                onclick={() => {
                  if (enabledSources.value[selectedSource.id]) {
                    enabledSources.value = {
                      ...enabledSources.value,
                      [selectedSource.id]: false,
                    };
                    selectedSourceId.value = "";
                  } else {
                    enabledSources.value = {
                      ...enabledSources.value,
                      [selectedSource.id]: true,
                    };
                  }
                }}
              >
                <Icon icon="lucide:toggle-left" />
                Disable source
              </ContextMenu.Item>
              <ContextMenu.Item
                class="relative"
                onclick={(e) => {
                  e.preventDefault();
                  compactSourceSelector.toggle();
                }}
              >
                <Icon icon="lucide:square-dashed-text" />
                Compact look
                <Icon
                  class={cn(
                    "absolute right-4 transition-opacity",
                    compactSourceSelector.value ? "opacity-100" : "opacity-0",
                  )}
                  icon="lucide:check"
                />
              </ContextMenu.Item>
            {/if}
            <!-- {:else} -->
          {/if}
        </ContextMenu.Content>
      </ContextMenu.Root>
    </Tooltip>
  </Popover.Trigger>
  <Popover.Content class="w-80 p-1">
    <div class="flex w-full flex-col gap-2">
      {#if sourceGroupMode.value === "single"}
        <div class="flex items-center gap-1">
          <Badge class="h-9 w-12" variant="outline">
            <ScrollingValue value={filteredSources.length} />
          </Badge>
          <Input
            class="h-9 w-full"
            divClass="w-full"
            variant="outline"
            placeholder="Sources..."
            bind:value={selectSourceFilter}
          />
          <Tooltip
            text="Alternate NSFW level"
            subtext={showExtensionsSourcesContentWarning.value}
          >
            <Button
              class="flex h-9 justify-between rounded-xl font-bold duration-500"
              variant={showExtensionsSourcesContentWarning.value === "SAFE"
                ? "info"
                : showExtensionsSourcesContentWarning.value === "MIXED"
                  ? "mixed"
                  : "destructive"}
              onclick={(e) => {
                animate(e.currentTarget, {
                  filter: ["blur(0px)", "blur(3px)", "blur(0px)"],
                  duration: 500,
                  easing: "easeOutQuad",
                });
                showExtensionsSourcesContentWarning.cycle();
              }}
            >
              <Icon
                icon={showExtensionsSourcesContentWarning.value === "SAFE"
                  ? "lucide:heart"
                  : showExtensionsSourcesContentWarning.value === "MIXED"
                    ? "lucide:split"
                    : "lucide:triangle-alert"}
              />
            </Button>
          </Tooltip>
          <Popover.Root>
            <Popover.Trigger>
              <Tooltip
                text="Enabled langs: {groupByLangSources.length -
                  Object.values(disabledLangs).filter((v) => v).length}"
              >
                <Button class="h-9 font-bold">
                  <Icon icon="lucide:languages" />
                  <!-- Languages -->
                </Button>
              </Tooltip>
            </Popover.Trigger>
            <Popover.Content>
              <div
                class="scrollbar flex max-h-50 flex-col gap-1 overflow-y-scroll"
              >
                {#each groupByLangSources as l}
                  <Button
                    class="hover:bg-secondary/50 w-full justify-between px-3"
                    variant="outline"
                    onclick={() => {
                      if (l.lang in disabledLangs) {
                        disabledLangs[l.lang] = !disabledLangs[l.lang];
                      } else {
                        disabledLangs[l.lang] = true;
                      }
                    }}
                  >
                    <div class="flex items-center gap-2">
                      <Checkbox
                        class="pointer-events-none"
                        checked={!disabledLangs[l.lang]}
                      />
                      <Label class="cursor-pointer">
                        {getLangNative(l.lang)}
                      </Label>
                    </div>
                    <Badge class="w-10" variant="secondary">
                      <ScrollingValue value={l.count} />
                    </Badge>
                  </Button>
                {/each}
              </div>
            </Popover.Content>
          </Popover.Root>
        </div>
        <VList
          class={cn(
            "scrollbar w-full scroll-smooth",
            filteredSources.length > 0 ? "h-60!" : "h-0",
          )}
          data={filteredSources}
          getKey={(d, _) => d.id}
          bufferSize={400}
        >
          {#snippet children(source, _)}
            {let wasOpen = $state(false)}
            <ContextMenu.Root
              onOpenChange={(v) => {
                delay(500).then(() => {
                  wasOpen = v;
                });
              }}
            >
              <ContextMenu.Trigger>
                <Tooltip
                  text={source.extension.isObsolete
                    ? "Source is obsolete..."
                    : source.extension.hasUpdate
                      ? "Update available!"
                      : ""}
                >
                  <Button
                    class={cn(
                      "bg-background group/extension hover:bg-secondary/40 text-primary relative m-[1.7px] flex h-12 w-74 items-center justify-between gap-2 rounded-xl p-2 hover:no-underline!",
                      selectedSourceId.value === source.id &&
                        "bg-transparent backdrop-blur-xl",
                      source.extension.hasUpdate && "border-info border",
                      source.extension.isObsolete &&
                        "border-destructive border",
                    )}
                    onclick={() => {
                      selectedSourceId.value = source.id;
                      animate("#source-select", {
                        filter: ["blur(4px)", "blur(0px)"],
                        duration: 700,
                        easing: "easeOutQuad",
                      });
                      open = false;
                      selectSourceFilter = "";
                    }}
                    variant={selectedSourceId.value === source.id
                      ? "outline"
                      : "secondary"}
                  >
                    <div class="pointer-events-none flex items-center gap-2">
                      <Image class="size-10" src={source.iconUrl} />
                      <div
                        class="flex flex-col items-start justify-center gap-0"
                      >
                        <Label
                          class={cn(
                            "max-w-44 cursor-pointer truncate text-lg/6",
                          )}
                        >
                          {source.displayName}
                        </Label>
                        <div
                          class="flex max-w-52 gap-1 truncate text-[11px] font-semibold"
                        >
                          <span>
                            {getLangNative(source.lang)}
                          </span>
                          ·
                          <span>
                            {source.extension.versionName}
                          </span>
                          {#if source.contentWarning !== "SAFE"}
                            ·
                            {#if source.contentWarning === "MIXED"}
                              <span class="text-purple-600">MIXED</span>
                            {:else}
                              <span class="text-destructive">NSFW</span>
                            {/if}
                          {/if}
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center">
                      <Button
                        class="pointer-events-auto h-8 w-7 rounded-lg"
                        variant="ghost"
                        onclick={(e) => {
                          e.stopPropagation();
                          if (wasOpen) return;
                          const event = new MouseEvent("contextmenu", {
                            bubbles: true,
                            clientX: e.clientX,
                            clientY: e.clientY,
                          });
                          e.currentTarget.parentElement?.dispatchEvent(event);
                        }}
                      >
                        <Icon icon="lucide:ellipsis-vertical" />
                      </Button>
                    </div>
                    <Button
                      class={cn(
                        "absolute top-2 right-10 size-7 rounded-lg opacity-0 transition-opacity duration-500 group-hover/extension:opacity-100",
                        pinnedSources.value[source.id] && "opacity-100",
                      )}
                      variant="ghost"
                      onclick={(e) => {
                        e.stopPropagation();
                        pinnedSources.value = {
                          ...pinnedSources.value,
                          [source.id]: !pinnedSources.value[source.id],
                        };
                      }}
                    >
                      <Icon
                        icon={pinnedSources.value[source.id]
                          ? "lucide:pin"
                          : "lucide:pin-off"}
                      />
                    </Button>
                    {#if crEvent.val["ext-update" + source.extension.pkgName]}
                      <div
                        class="absolute flex h-full w-full items-center justify-center rounded-xl backdrop-blur-[1px]"
                      >
                        <Icon
                          class="size-5! animate-spin"
                          icon="lucide:refresh-cw"
                        />
                      </div>
                    {/if}
                  </Button>
                </Tooltip>
              </ContextMenu.Trigger>
              <ContextMenu.Content>
                <ContextMenu.Item
                  onclick={(e) => {
                    e.preventDefault();
                    if (pinnedSources.value[source.id]) {
                      pinnedSources.value = {
                        ...pinnedSources.value,
                        [source.id]: false,
                      };
                    } else {
                      pinnedSources.value = {
                        ...pinnedSources.value,
                        [source.id]: true,
                      };
                    }
                  }}
                >
                  <Icon
                    icon={pinnedSources.value[source.id]
                      ? "lucide:pin"
                      : "lucide:pin-off"}
                  />
                  {pinnedSources.value[source.id] ? "Unpin" : "Pin"} source
                </ContextMenu.Item>
                <ContextMenu.Sub>
                  <ContextMenu.SubTrigger
                    disabled={Object.keys(groupSources.value).length === 0}
                  >
                    <Icon icon="lucide:blocks" />Add group
                  </ContextMenu.SubTrigger>
                  <ContextMenu.SubContent class="max-h-40 overflow-y-scroll">
                    {#each Object.entries(groupSources.value) as group (group[0])}
                      <ContextMenu.Item
                        class="justify-between"
                        onclick={(e) => {
                          e.preventDefault();
                          if (group[1].includes(source.id)) {
                            const groupItems = group[1].filter(
                              (s) => s !== source.id,
                            );
                            groupSources.value = {
                              ...groupSources.value,
                              [group[0]]: groupItems,
                            };
                          } else {
                            const groupItems = [...group[1], source.id];
                            groupSources.value = {
                              ...groupSources.value,
                              [group[0]]: groupItems,
                            };
                          }
                        }}
                      >
                        {group[0]}
                        <Icon
                          class={cn(
                            "transition-opacity duration-300",
                            group[1].includes(source.id)
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                          icon="lucide:check"
                        />
                      </ContextMenu.Item>
                    {/each}
                  </ContextMenu.SubContent>
                </ContextMenu.Sub>
                <ContextMenu.Separator />
                <ContextMenu.Item
                  onclick={() => {
                    openedExtension.open({
                      extension:
                        suwayomi.extensionsByPkgName[source.extension.pkgName],
                    });
                    open = false;
                  }}
                >
                  <Icon icon="lucide:info" />
                  See extension
                </ContextMenu.Item>
                <ContextMenu.Item
                  disabled={!source.isConfigurable}
                  onclick={() => {
                    openedExtension.open({
                      source: source,
                      extension:
                        suwayomi.extensionsByPkgName[source.extension.pkgName],
                    });
                    open = false;
                  }}
                >
                  <Icon icon="lucide:settings" />
                  Configure
                </ContextMenu.Item>
                {#if source.extension.hasUpdate}
                  <ContextMenu.Item
                    class="text-info data-highlighted:text-info/90"
                    onclick={() => {
                      suwaManager.patchExtension(
                        source.extension.pkgName,
                        "update",
                      );
                    }}
                  >
                    <Icon icon="lucide:refresh-cw" />
                    Update extension
                  </ContextMenu.Item>
                {/if}
                <ContextMenu.Item
                  class="text-red-600 data-highlighted:text-red-400"
                  onclick={() => {
                    const sourceId = source.id;
                    if (enabledSources.value[sourceId]) {
                      enabledSources.value = {
                        ...enabledSources.value,
                        [sourceId]: false,
                      };
                      if (selectedSourceId.value === sourceId) {
                        selectedSourceId.value = "";
                      }
                    } else {
                      enabledSources.value = {
                        ...enabledSources.value,
                        [sourceId]: true,
                      };
                    }
                  }}
                >
                  <Icon icon="lucide:toggle-left" />
                  Disable source
                </ContextMenu.Item>
              </ContextMenu.Content>
            </ContextMenu.Root>
          {/snippet}
        </VList>
        {#if filteredSources.length === 0}
          <div class="flex h-60 flex-col items-center p-4">
            <Badge class="flex flex-col gap-1 text-base">
              No source found lil bro.
              {#if suwayomi.enabledSources.length === 0}
                <span>You could try enabling one...</span>
              {/if}
              <span class="text-xl">╮( ˘ ､ ˘ )╭</span>
            </Badge>
          </div>
        {/if}
      {:else}
        <div
          class="flex h-60 flex-col items-center overflow-x-hidden overflow-y-scroll p-2"
        >
          <Label class="text-primary/70 mb-1 w-full text-sm">
            Default groups
          </Label>
          <Button
            class={cn(
              "group/extension hover:bg-secondary/40 text-primary relative m-0.5 flex h-10 w-70 items-center justify-between gap-2 rounded-xl p-3 pr-1 hover:no-underline!",
              selectedGroupSource.value.toLowerCase() === "pinned sources" &&
                "bg-background/80 backdrop-blur-xl",
            )}
            variant={selectedGroupSource.value.toLowerCase() ===
            "pinned sources"
              ? "secondary"
              : "outline"}
            onclick={() => {
              selectedGroupSource.value = "Pinned sources";
              open = false;
            }}
          >
            <div class="flex items-center gap-2">
              <Icon class="size-5!" icon="lucide:pin" />
              <Label class="cursor-pointer text-lg">Pinned sources</Label>
            </div>
            <Badge class="h-8 min-w-9 rounded-lg" variant="outline">
              <ScrollingValue
                value={suwayomi.enabledSources.filter(
                  (s) => pinnedSources.value[s.id],
                ).length}
              />
            </Badge>
          </Button>
          <Button
            class={cn(
              "group/extension hover:bg-secondary/40 text-primary relative m-0.5 flex h-10 w-70 items-center justify-between gap-2 rounded-xl p-3 pr-1 hover:no-underline!",
              selectedGroupSource.value.toLowerCase() === "active sources" &&
                "bg-background/80 backdrop-blur-xl",
            )}
            variant={selectedGroupSource.value.toLowerCase() ===
            "active sources"
              ? "secondary"
              : "outline"}
            onclick={() => {
              selectedGroupSource.value = "Active sources";
              open = false;
            }}
          >
            <div class="flex items-center gap-2">
              <Icon class="size-5!" icon="lucide:globe" />
              <Label class="cursor-pointer text-lg">Active sources</Label>
            </div>
            <Badge class="h-8 min-w-9 rounded-lg" variant="outline">
              <ScrollingValue value={suwayomi.enabledSources.length} />
            </Badge>
          </Button>
          <div class="mb-1 flex w-full items-center justify-between pr-2">
            <Label
              class="text-primary/70 flex w-full items-center justify-between text-sm"
            >
              Custom groups
            </Label>
            <Popover.Root bind:open={openCreateGroup}>
              <Popover.Trigger>
                <Button class="h-8 rounded-lg px-2" variant="outline">
                  <Icon icon="lucide:plus" /> Create
                </Button>
              </Popover.Trigger>
              <Popover.Content>
                <div class="flex gap-1">
                  <Input
                    variant="outline"
                    placeholder="New group name"
                    bind:value={createGroupInput}
                    onenter={() => {
                      if (
                        createGroupInput.toLowerCase() === "pinned sources" ||
                        createGroupInput.toLowerCase() === "active sources" ||
                        !!Object.keys(groupSources.value).find(
                          (k) =>
                            k.toLowerCase() === createGroupInput.toLowerCase(),
                        )
                      )
                        return;

                      if (!groupSources.value[createGroupInput]) {
                        groupSources.value = {
                          ...groupSources.value,
                          [createGroupInput]: [],
                        };
                        openCreateGroup = false;
                        createGroupInput = "";
                      }
                    }}
                  />
                  <Button
                    class="w-10"
                    variant="outline"
                    disabled={createGroupInput.length === 0 ||
                      createGroupInput.toLowerCase() === "pinned sources" ||
                      createGroupInput.toLowerCase() === "active sources" ||
                      !!Object.keys(groupSources.value).find(
                        (k) =>
                          k.toLowerCase() === createGroupInput.toLowerCase(),
                      )}
                    onclick={() => {
                      if (!groupSources.value[createGroupInput]) {
                        groupSources.value = {
                          ...groupSources.value,
                          [createGroupInput]: [],
                        };
                        openCreateGroup = false;
                        createGroupInput = "";
                      }
                    }}
                  >
                    <Icon icon="lucide:plus" />
                  </Button>
                </div>
              </Popover.Content>
            </Popover.Root>
          </div>
          <div class="flex w-full flex-col gap-1 px-2">
            {#each Object.entries(groupSources.value) as group (group)}
              {let openDelete = $state(false)}
              <Button
                class={cn(
                  "group/custom w-full justify-between pr-1",
                  selectedGroupSource.value.toLowerCase() ===
                    group[0].toLowerCase() &&
                    "bg-background hover:bg-background/70",
                )}
                variant={selectedGroupSource.value.toLowerCase() ===
                group[0].toLowerCase()
                  ? "secondary"
                  : "outline"}
                onmouseleave={() => {
                  openDelete = false;
                }}
                onclick={() => {
                  selectedGroupSource.value = group[0];
                  open = false;
                }}
              >
                {group[0]}
                <div class="flex items-center gap-1">
                  <Badge
                    class={cn(
                      "group-hover/custom:bg-background/50 h-8 min-w-9 rounded-lg",
                      selectedGroupSource.value.toLowerCase() ===
                        group[0].toLowerCase() &&
                        "group-hover/custom:bg-secondary",
                    )}
                    variant="secondary"
                  >
                    {group[1].length}
                  </Badge>
                  <Button
                    class={cn(
                      "hover:bg-background h-8 max-w-8 rounded-lg pr-2 transition-all duration-500",
                      openDelete && "hover:bg-destructive/80 max-w-none border",
                    )}
                    variant={openDelete ? "destructive" : "outline"}
                    onclick={(e) => {
                      e.stopPropagation();
                      if (openDelete) {
                        const { [group[0]]: _, ...rest } = groupSources.value;
                        groupSources.value = rest;
                      }
                      openDelete = true;
                    }}
                  >
                    <Icon icon="lucide:trash" />
                    <span
                      class="overflow-hidden whitespace-nowrap transition-all duration-500 ease-in-out"
                      style="max-width: {openDelete ? '120px' : '-0px'}"
                    >
                      Are you sure?
                    </span>
                  </Button>
                </div>
              </Button>
            {:else}
              <Badge
                class={cn(
                  "flex min-h-19 w-full flex-col items-center justify-start hover:bg-transparent",
                  Object.keys(groupSources.value).length === 0 && "h-19",
                )}
                variant="outline"
              >
                <Label class="mt-4">No source group created</Label>
                <Label class="text-bold text-2xl">(⌒_⌒;)</Label>
              </Badge>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </Popover.Content>
</Popover.Root>
