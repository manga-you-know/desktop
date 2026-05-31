<script lang="ts">
  import { Image, SearchSettings, Tooltip } from "@/components";
  import { Badge, Button, Input, Label, Popover } from "@/lib/components";
  import { cn, getLangName, getLangNative, titleCase } from "@/lib/utils";
  import {
    openExtensions,
    searchInput,
    sourceGroupMode,
    searchType,
    suwayomi,
    selectedSource,
    suwayomiUrl,
    selectedGroupSource,
    showExtensionsNSourcesNSFW,
    openedExtension,
  } from "@/states";
  import Icon from "@iconify/svelte";
  import { animate } from "animejs";
  import { onMount } from "svelte";
  import { ScrollingValue } from "svelte-ux";
  import { VList } from "virtua/svelte";

  let debounceTimer: ReturnType<typeof setTimeout>;
  let resultFilter = $state("");

  function handleInput() {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      // search(inputElement.value);
      console.log("fire", searchInput.value);
      resultFilter = "";
    }, 600);
  }

  let selectSourceFilter = $state("");
  let filteredSources = $derived(
    suwayomi.enabledSources.filter(
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
        (showExtensionsNSourcesNSFW.value ? true : !s.isNsfw),
    ),
  );

  let openSearchSettings = $state(false);
  let openSelectSource = $state(false);

  onMount(() => {
    if (suwayomi.enabledSources.length > 0) {
      selectedSource.value = suwayomi.enabledSources[0];
    }
  });
</script>

<SearchSettings bind:open={openSearchSettings} />
<div class="justify-around-stretch flex w-full flex-col gap-3">
  <div class="flex items-center justify-center gap-2">
    <Badge class="h-10 w-13" variant="outline">
      <ScrollingValue value={0} />
    </Badge>
    <Input
      class="hover:bg-secondary/20 w-70 transition-all"
      divClass="w-70 transition-all"
      variant="outline"
      placeholder="Query in source{sourceGroupMode.value !== 'single'
        ? 's'
        : ''}..."
      disabled={searchType.value !== "filter"}
      oninput={handleInput}
      bind:value={searchInput.value}
    />
    <Button
      variant="outline"
      onclick={() => {
        openSearchSettings = true;
      }}
    >
      <Icon icon="lucide:sliders-horizontal" />
    </Button>
    <Tooltip
      text="Source mode"
      subtext={sourceGroupMode.value === "single"
        ? "Single uses one source to fetch"
        : sourceGroupMode.value === "group"
          ? "Group uses multiple sources to fetch"
          : "Global uses all enabled sources to fetch"}
    >
      <Button
        class="w-27 justify-start font-bold"
        onclick={(e) => {
          if (sourceGroupMode.value === "single") {
            sourceGroupMode.value = "group";
          } else if (sourceGroupMode.value === "group") {
            sourceGroupMode.value = "global";
          } else {
            sourceGroupMode.value = "single";
          }
          animate(e.currentTarget, {
            filter: ["blur(1px)", "blur(2px)", "blur(0px)"],
            duration: 500,
            easing: "easeOutQuad",
          });
          if (sourceGroupMode.value !== "global") {
            animate("#source-select", {
              filter: ["blur(2px)", "blur(0px)"],
              duration: 500,
              easing: "easeOutQuad",
            });
          }
        }}
      >
        <Icon
          icon={sourceGroupMode.value === "single"
            ? "lucide:square-divide"
            : sourceGroupMode.value === "group"
              ? "lucide:layers"
              : "lucide:globe"}
        />
        {titleCase(sourceGroupMode.value)}
      </Button>
    </Tooltip>
    <Tooltip text="Manage extensions & sources">
      <Button variant="outline" onclick={openExtensions.open}>
        <Icon icon="lucide:puzzle" />
      </Button>
    </Tooltip>
  </div>
  <div class="flex items-center justify-center gap-2">
    <div
      class="border-secondary bg-background/30 parent flex gap-1 rounded-2xl border p-1"
    >
      <Button
        class={cn(
          "pointer-events-none absolute w-30 transition-all duration-500",
          searchType.value === "filter" && "translate-x-0",
          searchType.value === "popular" && "translate-x-31",
          searchType.value === "latest" && "translate-x-62",
        )}
        variant="secondary"
      ></Button>
      <Button
        class={cn(
          "hover:bg-secondary/60 z-2 w-30",
          searchType.value === "filter" && "hover:text-primary/70",
        )}
        variant="ghost"
        onclick={() => {
          searchType.value = "filter";
        }}
      >
        <Icon icon="lucide:text-search" />Search
      </Button>
      <Button
        class={cn(
          "hover:bg-secondary/60 z-2 w-30",
          searchType.value === "popular" && "hover:text-primary/70",
        )}
        variant="ghost"
        onclick={() => {
          searchType.value = "popular";
        }}
      >
        <Icon icon="lucide:heart" />Popular
      </Button>
      <Button
        class={cn(
          "hover:bg-secondary/60 z-2 w-30",
          searchType.value === "latest" && "hover:text-primary/70",
        )}
        variant="ghost"
        onclick={() => {
          searchType.value = "latest";
        }}
      >
        <Icon icon="lucide:badge-info" />Latest
      </Button>
    </div>
    <Popover.Root bind:open={openSelectSource}>
      <Popover.Trigger class="flex items-center">
        <Tooltip
          text="Selected source {sourceGroupMode.value !== 'single'
            ? 'group'
            : ''}"
          subtext={sourceGroupMode.value === "single"
            ? (selectedSource.value?.displayName ?? "None.")
            : selectedGroupSource.value}
        >
          <Button
            class={cn(
              "h-12 w-50 justify-start overflow-hidden",
              sourceGroupMode.value === "single" && "px-2",
            )}
            variant="outline"
            disabled={sourceGroupMode.value === "global"}
            id="source-select"
          >
            {#if sourceGroupMode.value === "single"}
              {#if selectedSource.value}
                <Image
                  class="size-10"
                  src={suwayomiUrl.value + selectedSource.value.iconUrl}
                />
                <span class="truncate font-bold">
                  {selectedSource.value.displayName}
                </span>
              {:else}
                No sources...
              {/if}
            {:else}
              <div class="flex w-full items-center justify-center gap-2">
                {#if selectedGroupSource.value === "Favorites"}
                  <Icon icon="lucide:star" />
                  <Label class="cursor-pointer">Favorites</Label>
                {:else}
                  <Label class="cursor-pointer truncate text-ellipsis">
                    {selectedGroupSource.value}
                  </Label>
                {/if}
              </div>
            {/if}
          </Button>
        </Tooltip>
      </Popover.Trigger>
      <Popover.Content>
        <div class="flex w-60 flex-col gap-2">
          <div class="flex gap-2">
            <Input
              class="w-40"
              variant="outline"
              placeholder="Enabled sources..."
              bind:value={selectSourceFilter}
            />
            <Button
              class="flex min-w-24 justify-between rounded-xl font-bold duration-500"
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
              {showExtensionsNSourcesNSFW.value ? "N" : ""}SFW
            </Button>
          </div>
          <VList class="h-70!" data={filteredSources} getKey={(d, _) => d.id}>
            {#snippet children(source, _)}
              <Button
                class={cn(
                  "bg-background group/extension hover:bg-secondary/40 text-primary m-0.5 flex h-12 w-60 items-center justify-between gap-2 rounded-xl p-2 hover:no-underline!",
                  selectedSource.value === source &&
                    "bg-secondary pointer-events-none",
                )}
                onclick={() => {
                  selectedSource.value = source;
                  animate("#source-select", {
                    filter: ["blur(2px)", "blur(0px)"],
                    duration: 500,
                    easing: "easeOutQuad",
                  });
                }}
              >
                <div class="pointer-events-none flex items-center gap-2">
                  <Image
                    class="size-10"
                    src={suwayomiUrl.value + source.iconUrl}
                  />
                  <div class="gap-0.1 flex flex-col items-start justify-center">
                    <Label
                      class={cn(
                        "max-w-40 cursor-pointer truncate text-lg group-hover/extension:underline!",
                        source.isConfigurable && "max-w-36",
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
                  {#if source.isConfigurable}
                    <Button
                      class="pointer-events-auto h-8 w-9 rounded-lg"
                      variant="ghost"
                      onclick={(e) => {
                        e.stopPropagation();
                        openSelectSource = false;
                        openedExtension.set({
                          source: source,
                          extension:
                            suwayomi.extensionsByPkgName[
                              source.extension.pkgName
                            ],
                        });
                        openedExtension.open();
                      }}
                    >
                      <Icon icon="lucide:settings" />
                    </Button>
                  {/if}
                </div>
              </Button>
            {/snippet}
          </VList>
        </div>
      </Popover.Content>
    </Popover.Root>
  </div>
  <div class="bg-secondary/40 h-1 w-full rounded-2xl"></div>
  <div class="flex items-center justify-center gap-2">
    <Badge class="h-10 w-20 text-sm font-bold" variant="outline">
      <ScrollingValue value={0} />
      /
      <ScrollingValue value={0} />
    </Badge>
    <Input
      class="hover:bg-secondary/20 w-70"
      divClass="w-70"
      variant="outline"
      placeholder="Filter results..."
      bind:value={resultFilter}
    />
    <Button></Button>
  </div>
</div>
