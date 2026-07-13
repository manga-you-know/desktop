<script lang="ts">
  import {
    Badge,
    Button,
    Checkbox,
    Input,
    Label,
    Popover,
  } from "@/lib/components";
  import { Image, Tooltip } from "@/components";
  import { cn, getLangName, getLangNative } from "@/lib/utils";
  import {
    groupSources,
    openedExtension,
    pinnedSources,
    selectedGroupSource,
    selectedSourceId,
    showExtensionsNSourcesNSFW,
    sourceGroupMode,
    suwayomi,
  } from "@/states";
  import Icon from "@iconify/svelte";
  import { ScrollingValue } from "svelte-ux";
  import { animate } from "animejs";
  import { VList } from "virtua/svelte";
  import type { Source } from "@/types";

  type Props = {
    open: boolean;
    selectedSource: Source;
  };

  let { open = $bindable(false), selectedSource }: Props = $props();

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
          (showExtensionsNSourcesNSFW.value ? true : !s.isNsfw),
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
        : 0,
  );
</script>

<Popover.Root bind:open>
  <Popover.Trigger class="flex items-center">
    <Tooltip
      text="Select source {sourceGroupMode.value !== 'single' ? 'group' : ''}"
      subtext={sourceGroupMode.value === "single"
        ? (selectedSource.displayName ?? "None.")
        : selectedGroupSource.value}
    >
      <Button
        class={cn(
          "group/select h-12.5 w-55 justify-start overflow-hidden",
          sourceGroupMode.value === "single" ? "px-2" : "pr-2",
        )}
        variant="outline"
        id="source-select"
      >
        {#if sourceGroupMode.value === "single"}
          {#if selectedSource}
            <Image class="size-10" src={selectedSource.iconUrl} />
            <span class="truncate font-bold">
              {selectedSource.displayName}
            </span>
          {:else}
            No sources...
          {/if}
        {:else}
          <div class="flex w-full items-center justify-center gap-2 font-bold">
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
            text="{showExtensionsNSourcesNSFW.value
              ? 'Disable'
              : 'Enable'} NSFW"
          >
            <Button
              class="flex h-9 justify-between rounded-xl font-bold duration-500"
              variant={showExtensionsNSourcesNSFW.value
                ? "destructive"
                : "info"}
              onclick={(e) => {
                showExtensionsNSourcesNSFW.toggle();
                animate(e.currentTarget, {
                  filter: ["blur(0px)", "blur(3px)", "blur(0px)"],
                  duration: 500,
                  easing: "easeOutQuad",
                });
              }}
            >
              <Icon
                icon={showExtensionsNSourcesNSFW.value
                  ? "lucide:triangle-alert"
                  : "lucide:heart"}
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
            "scrollbar w-full",
            filteredSources.length > 0 ? "h-60!" : "h-0",
          )}
          data={filteredSources}
          getKey={(d, _) => d.id}
          bufferSize={400}
        >
          {#snippet children(source, _)}
            <Button
              class={cn(
                "bg-background group/extension hover:bg-secondary/40 text-primary relative m-0.5 flex h-12 w-74 items-center justify-between gap-2 rounded-xl p-2 hover:no-underline!",
                selectedSourceId.value === source.id &&
                  "bg-transparent backdrop-blur-xl",
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
                <div class="flex flex-col items-start justify-center gap-0">
                  <Label
                    class={cn(
                      "max-w-44 cursor-pointer truncate text-lg/6 group-hover/extension:underline!",
                    )}
                  >
                    {source.displayName}
                  </Label>
                  <div class="flex w-18 justify-between">
                    <span class="text-red-500">
                      {source.isNsfw ? "+18" : ""}
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex items-center">
                <Button
                  class="pointer-events-auto h-8 w-7 rounded-lg"
                  variant="ghost"
                  onclick={(e) => {
                    e.stopPropagation();
                    open = false;
                    openedExtension.open({
                      source: source,
                      extension:
                        suwayomi.extensionsByPkgName[source.extension.pkgName],
                    });
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
            </Button>
          {/snippet}
        </VList>
      {:else}
        <div
          class="flex h-60 flex-col items-center overflow-x-hidden overflow-y-scroll p-2"
        >
          <Label class="text-primary/70 mb-1 w-full text-sm">
            Default groups
          </Label>
          <Button
            class={cn(
              "bg-secondary group/extension hover:bg-secondary/40 text-primary relative m-0.5 flex h-10 w-70 items-center justify-between gap-2 rounded-xl p-3 pr-1 hover:no-underline!",
              selectedGroupSource.value.toLowerCase() === "pinned sources" &&
                "bg-transparent backdrop-blur-xl",
            )}
            variant={selectedGroupSource.value.toLowerCase() ===
            "pinned sources"
              ? "outline"
              : "secondary"}
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
              "bg-secondary group/extension hover:bg-secondary/40 text-primary relative m-0.5 flex h-10 w-70 items-center justify-between gap-2 rounded-xl p-3 pr-1 hover:no-underline!",
              selectedGroupSource.value.toLowerCase() === "active sources" &&
                "bg-transparent backdrop-blur-xl",
            )}
            variant={selectedGroupSource.value.toLowerCase() ===
            "active sources"
              ? "outline"
              : "secondary"}
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
          <Label
            class="text-primary/70 mb-1 flex w-full items-center justify-between gap-2 pr-2 text-sm"
          >
            Custom groups
            <Button class="h-8 rounded-lg px-2" variant="outline">
              <Icon icon="lucide:plus" /> Create
            </Button>
          </Label>
          <Badge
            class={cn(
              "flex h-full w-full flex-col items-center justify-start",
              Object.keys(groupSources.value).length === 0 && "h-19",
            )}
            variant="outline"
          >
            {#each Object.entries(groupSources.value) as group (group)}{:else}
              <Label class="mt-4">No source group created</Label>
              <Label class="text-2xl text-bold">(⌒_⌒;)</Label>
            {/each}
          </Badge>
        </div>
      {/if}
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
    </div>
  </Popover.Content>
</Popover.Root>
