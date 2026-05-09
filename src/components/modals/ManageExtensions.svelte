<script lang="ts">
  import {
    Badge,
    Button,
    Switch,
    ContextMenu,
    Dialog,
    Input,
    Label,
    Popover,
  } from "@/lib/components";
  import { suwaManager } from "@/lib/helpers";
  import {
    activeExtensionRepos,
    allowedExtensionLanguages,
    allowedSourceLanguages,
    enabledSources,
    hiddenExtensions,
    hiddenSources,
    openedExtension,
    openExtensions,
    repoInfo,
    showExtensionsNsfw,
    suwayomi,
    suwayomiUrl,
  } from "@/states";
  import { Image, Tooltip } from "@/components";
  import { delay } from "@/utils";
  import Icon from "@iconify/svelte";
  import { readText } from "@tauri-apps/plugin-clipboard-manager";
  import { fade } from "svelte/transition";
  import { VList } from "virtua/svelte";
  import {
    cn,
    getBasePath,
    getLang,
    prettifyRepo,
    removeOrigin,
  } from "@/lib/utils";
  import { openUrl } from "@tauri-apps/plugin-opener";
  import { IsoLanguages } from "@/constants";
  import type { Source } from "@/types";

  let query = $state("");
  let tab: "sources" | "extensions" = $state(
    suwayomi.installedExtensions.length > 0 ? "sources" : "extensions",
  );
  let showedGroup: "all" | "installed" | "noninstalled" | "hidden" =
    $state("all");

  let installingExtensions: Record<string, boolean> = $state({});

  let filteredSources = $derived(
    showedGroup.includes("hidden")
      ? suwayomi.hiddenSources.filter(
          (s) =>
            s.displayName.toLowerCase().includes(query.toLowerCase()) ||
            s.name.toLowerCase().includes(query.toLowerCase()),
        )
      : ["noninstalled", "all"].includes(showedGroup)
        ? suwayomi.sources.filter(
            (s) =>
              (showExtensionsNsfw.value ? true : !s.isNsfw) &&
              (s.name.toLowerCase().includes(query.toLowerCase()) ||
                s.displayName.toLowerCase().includes(query.toLowerCase())) &&
              (showedGroup === "all"
                ? true
                : !enabledSources.value[s.id.toString()]) &&
              allowedSourceLanguages.value[s.lang],
          )
        : suwayomi.enabledSources.filter(
            (s) =>
              (showExtensionsNsfw.value ? true : !s.isNsfw) &&
              (s.name.toLowerCase().includes(query.toLowerCase()) ||
                s.displayName.toLowerCase().includes(query.toLowerCase())) &&
              (showExtensionsNsfw.value ? true : !s.isNsfw) &&
              allowedSourceLanguages.value[s.lang],
          ),
  );

  // let sourcesGrouped: [string, Source[]][] = $state([])
  //
  // showExtensionsNsfw.onChange = (value) => {
  //   if (value || showedGroup === "hidden") {
  //     sourcesGrouped =
  //   Object.entries(
  //     Object.groupBy(filteredSources, (s) => s.extension.pkgName),
  //   ).map(([key, sources]) => [key, sources ?? []])

  //   } else {
  //
  //     sourcesGrouped =
  //   Object.entries(
  //     Object.groupBy(filteredSources, (s) => s.extension.pkgName),
  //   ).map(([key, sources]) => [key, sources ?? []])
  //   }
  // }

  let groupedSources: [string, Source[]][] = $derived(
    Object.entries(
      Object.groupBy(filteredSources, (s) => s.extension.pkgName),
    ).map(([extension, sources]) => [
      extension,
      sources?.sort((a, b) => {
        const aEnabled = enabledSources.value[a.id.toString()] ? 1 : 0;
        const bEnabled = enabledSources.value[b.id.toString()] ? 1 : 0;
        if (aEnabled !== bEnabled) return bEnabled - aEnabled;
        const aName = getLang(a.lang);
        const bName = getLang(b.lang);
        return aName.localeCompare(bName, "en", { sensitivity: "base" });
      }) ?? [],
    ]),
  );

  // let sourcesGrouped: [string, Source[]][] = $derived.by(() => {
  //   const filtered = showedGroup.includes("hidden")
  //     ? suwayomi.hiddenSources.filter(
  //         (s) =>
  //           s.displayName.toLowerCase().includes(query.toLowerCase()) ||
  //           s.name.toLowerCase().includes(query.toLowerCase()),
  //       )
  //     : ["noninstalled", "all"].includes(showedGroup)
  //       ? suwayomi.sources.filter(
  //           (s) =>
  //             (showExtensionsNsfw.value ? true : !s.isNsfw) &&
  //             (s.name.toLowerCase().includes(query.toLowerCase()) ||
  //               s.displayName.toLowerCase().includes(query.toLowerCase())) &&
  //             (showedGroup === "all"
  //               ? true
  //               : !enabledSources.value[s.id.toString()]) &&
  //             allowedSourceLanguages.value[s.lang],
  //         )
  //       : suwayomi.enabledSources.filter(
  //           (s) =>
  //             (showExtensionsNsfw.value ? true : !s.isNsfw) &&
  //             (s.name.toLowerCase().includes(query.toLowerCase()) ||
  //               s.displayName.toLowerCase().includes(query.toLowerCase())) &&
  //             (showExtensionsNsfw.value
  //               ? true
  //               : !suwayomi.extensionsByPkgName[s.extension.pkgName]?.isNsfw) &&
  //             allowedSourceLanguages.value[s.lang],
  //         );
  //
  //   return Object.entries(
  //     Object.groupBy(filtered, (s) => s.extension.pkgName),
  //   ) as [string, Source[]][];
  // });
  let filteredExtensions = $derived(
    showedGroup.includes("hidden")
      ? suwayomi.hiddenExtensions.filter((e) =>
          e.name.toLowerCase().includes(query.toLowerCase()),
        )
      : ["noninstalled", "all"].includes(showedGroup)
        ? suwayomi.extensions
            .filter(
              (e) =>
                (showExtensionsNsfw.value ? true : !e.isNsfw) &&
                e.name.toLowerCase().includes(query.toLowerCase()) &&
                (showedGroup === "all" ? true : !e.isInstalled) &&
                allowedExtensionLanguages.value[e.lang],
            )
            .sort((a, b) => {
              const aName = getLang(a.lang);
              const bName = getLang(b.lang);
              return aName.localeCompare(bName, "en", {
                sensitivity: "base",
              });
            })
        : suwayomi.installedExtensions
            .filter(
              (e) =>
                (showExtensionsNsfw.value ? true : !e.isNsfw) &&
                e.name.toLowerCase().includes(query.toLowerCase()) &&
                allowedExtensionLanguages.value[e.lang],
            )
            .sort((a, b) => {
              const aName = getLang(a.lang);
              const bName = getLang(b.lang);
              return aName.localeCompare(bName, "en", {
                sensitivity: "base",
              });
            }),
  );

  let sortedLangs = $derived(
    tab === "sources"
      ? suwayomi.availableSourceLangs.sort((a, b) => {
          const aAllowed = allowedSourceLanguages.value[a] ? 1 : 0;
          const bAllowed = allowedSourceLanguages.value[b] ? 1 : 0;
          if (aAllowed !== bAllowed) return bAllowed - aAllowed;
          const aName = IsoLanguages[a]?.nativeName ?? a;
          const bName = IsoLanguages[b]?.nativeName ?? b;
          return aName.localeCompare(bName, "en", { sensitivity: "base" });
        })
      : suwayomi.availableExtensionLangs.sort((a, b) => {
          const aAllowed = allowedExtensionLanguages.value[a] ? 1 : 0;
          const bAllowed = allowedExtensionLanguages.value[b] ? 1 : 0;
          if (aAllowed !== bAllowed) return bAllowed - aAllowed;
          const aName = IsoLanguages[a]?.nativeName ?? a;
          const bName = IsoLanguages[b]?.nativeName ?? b;
          return aName.localeCompare(bName, "en", { sensitivity: "base" });
        }),
  );

  let allowedLanguages: string[] = $derived(
    tab === "sources"
      ? Object.entries(allowedSourceLanguages.value)
          .filter(([_, v]) => v)
          .map(([k, _]) => k)
      : Object.entries(allowedExtensionLanguages.value)
          .filter(([_, v]) => v)
          .map(([k, _]) => k),
  );

  let expandedSources: Record<string, boolean> = $state({});
</script>

<Dialog.Root
  bind:open={openExtensions.active}
  onOpenChange={(open) => {
    if (open) {
      tab = suwayomi.installedExtensions.length > 0 ? "sources" : "extensions";
    }
  }}
>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Manage {tab}</Dialog.Title>
      <Dialog.Description>
        Select which {tab} you want to {tab === "sources"
          ? "enable"
          : "install"}
      </Dialog.Description>
    </Dialog.Header>
    <div class="flex w-full justify-center">
      <div
        class="bg-background/40 parent flex w-full justify-center rounded-2xl p-2 font-bold"
      >
        <Button
          class={cn(
            "pointer-events-none absolute start h-8 w-1/2 rounded-xl transition-all duration-500",
            tab === "sources" ? "translate-x-8" : "translate-x-55",
          )}
        />
        <Button
          class={cn(
            "hover:text-primary/70 z-2 h-8 w-full rounded-xl hover:bg-transparent",
            tab === "sources" && "text-background hover:text-background/70",
          )}
          variant="ghost"
          onclick={() => (tab = "sources")}
        >
          Sources
        </Button>
        <Button
          class={cn(
            "hover:text-primary/70 z-2 h-8 w-full rounded-xl hover:bg-transparent",
            tab === "extensions" && "text-background hover:text-background/70",
          )}
          variant="ghost"
          onclick={() => (tab = "extensions")}
        >
          Extensions
        </Button>
      </div>
    </div>
    <div class="flex w-full flex-col justify-center gap-3">
      <div class="flex w-full justify-between gap-2">
        <Badge class="w-12 rounded-xl" variant="outline">
          {tab === "sources"
            ? filteredSources.length
            : filteredExtensions.length}
        </Badge>
        <Input
          class="w-full rounded-xl"
          divClass="w-full"
          variant="outline"
          placeholder="Search for {tab}..."
          bind:value={query}
        />
        <Button
          class="flex min-w-24 justify-between rounded-xl font-bold"
          variant={showExtensionsNsfw.value ? "destructive" : "secondary"}
          disabled={showedGroup === "hidden"}
          onclick={showExtensionsNsfw.toggle}
        >
          <Icon
            icon={showExtensionsNsfw.value
              ? "lucide:triangle-alert"
              : "lucide:heart"}
          />
          {showExtensionsNsfw.value ? "N" : ""}SFW
        </Button>
        <Popover.Root>
          <Popover.Trigger
            disabled={["installed", "hidden"].includes(showedGroup)}
          >
            <Button
              class="rounded-xl"
              variant="secondary"
              disabled={["installed", "hidden"].includes(showedGroup)}
            >
              <Icon icon="lucide:link" />
            </Button>
          </Popover.Trigger>
          <Popover.Content class="flex flex-col gap-2 p-2">
            <div class="flex w-full items-center justify-between p-1">
              <Label>Allowed repositories</Label>
              <Button
                class="h-6 rounded-lg px-2.5"
                variant="secondary"
                onclick={() => {
                  activeExtensionRepos.value =
                    suwayomi.extensionRepos.map(getBasePath);
                }}
              >
                Enable all
              </Button>
            </div>
            <div class="flex max-h-60 flex-col gap-1 overflow-scroll p-2">
              {#each suwayomi.extensionRepos as repo}
                <Button
                  class={cn(
                    "cursor-pointer items-center justify-between gap-3 px-2",
                    activeExtensionRepos.value.includes(getBasePath(repo)) &&
                      activeExtensionRepos.value.length < 2 &&
                      "ponter-events-none! cursor-default hover:bg-transparent",
                  )}
                  variant="outline"
                  onclick={(e) => {
                    e.stopPropagation();
                    const sanitizedRepo = getBasePath(repo);
                    if (
                      activeExtensionRepos.value.includes(sanitizedRepo) &&
                      activeExtensionRepos.value.length < 2
                    )
                      return;
                    if (
                      activeExtensionRepos.value.includes(sanitizedRepo) &&
                      activeExtensionRepos.value.length > 1
                    ) {
                      activeExtensionRepos.value =
                        activeExtensionRepos.value.filter(
                          (r) => r !== sanitizedRepo,
                        );
                    } else {
                      activeExtensionRepos.value = [
                        ...activeExtensionRepos.value,
                        sanitizedRepo,
                      ];
                    }
                  }}
                >
                  <Switch
                    checked={activeExtensionRepos.value.includes(
                      getBasePath(repo),
                    )}
                    disabled={activeExtensionRepos.value.includes(
                      getBasePath(repo),
                    ) && activeExtensionRepos.value.length < 2}
                  />
                  {#if repoInfo.value[repo]}
                    <div class="flex w-full gap-1">
                      <Button
                        class="h-7 w-full justify-start opacity-100 hover:bg-transparent"
                        variant="ghost"
                        data-mouse
                      >
                        {repoInfo.value[repo].name}
                      </Button>
                      <Button
                        class="hover:bg-background/70 pointer-events-auto z-2 size-7 cursor-pointer! rounded-xl opacity-100"
                        variant="secondary"
                        onclick={(e) => {
                          e.stopPropagation();
                          openUrl(repoInfo.value[repo].website);
                        }}
                      >
                        <Icon icon="lucide:external-link" />
                      </Button>
                    </div>
                  {:else}
                    <Input
                      class="h-7 cursor-text rounded-lg"
                      variant="ghost"
                      readonly
                      value={removeOrigin(repo)}
                    />
                  {/if}
                </Button>
              {/each}
            </div>
          </Popover.Content>
        </Popover.Root>
        <Popover.Root>
          <Popover.Trigger>
            <Tooltip
              text="{allowedLanguages.length} allowed language{allowedLanguages.length >
              1
                ? 's'
                : ''}"
            >
              <Button class="rounded-xl">
                <Icon icon="lucide:languages" />
              </Button>
            </Tooltip>
          </Popover.Trigger>
          <Popover.Content class="flex flex-col gap-2 overflow-scroll p-2">
            <div class="flex w-full items-center justify-between p-1">
              <Label>Allowed languages: {allowedLanguages.length}</Label>
              <Button
                class="h-6 rounded-lg px-2.5"
                variant="secondary"
                onclick={() => {
                  const data: Record<string, boolean> = {};
                  if (tab === "sources") {
                    for (const lang of suwayomi.availableSourceLangs) {
                      data[lang] = true;
                    }
                    allowedSourceLanguages.value = data;
                  } else {
                    for (const lang of suwayomi.availableExtensionLangs) {
                      data[lang] = true;
                    }
                    allowedExtensionLanguages.value = data;
                  }
                }}
              >
                Enable all
              </Button>
            </div>
            <div class="flex max-h-80 flex-col gap-1 overflow-scroll p-2">
              {#each sortedLangs as lang}
                <Button
                  class="cursor-pointer items-center gap-1 px-2"
                  variant="outline"
                  onclick={(e) => {
                    e.stopPropagation();
                    if (tab === "sources") {
                      allowedSourceLanguages.value = {
                        ...allowedSourceLanguages.value,
                        [lang]: !allowedSourceLanguages.value[lang],
                      };
                    } else {
                      allowedExtensionLanguages.value = {
                        ...allowedExtensionLanguages.value,
                        [lang]: !allowedExtensionLanguages.value[lang],
                      };
                    }
                  }}
                  disabled={allowedLanguages.length < 2 &&
                    allowedLanguages[0] === lang}
                >
                  <Switch
                    checked={tab === "sources"
                      ? allowedSourceLanguages.value[lang]
                      : allowedExtensionLanguages.value[lang]}
                    disabled={allowedLanguages.length < 2 &&
                      allowedLanguages[0] === lang}
                  />
                  <Button
                    class="h-6 w-full justify-start rounded-xl"
                    variant="ghost"
                    disabled={allowedLanguages.length < 2 &&
                      allowedLanguages[0] === lang}
                  >
                    {getLang(lang)}
                  </Button>
                </Button>
              {/each}
            </div>
          </Popover.Content>
        </Popover.Root>
      </div>
      <div class="flex w-full">
        <Button
          class={cn(
            "w-full rounded-r-none rounded-b-none",
            showedGroup === "installed" &&
              "border-b-transparent bg-transparent hover:bg-transparent",
          )}
          variant="outline"
          onclick={() => {
            showedGroup = "installed";
          }}
        >
          {tab === "sources" ? "Enabled" : "Installed"}
          <Badge variant="secondary">
            {tab === "sources"
              ? suwayomi.enabledSources.length
              : suwayomi.installedExtensions.length}
          </Badge>
        </Button>
        <Button
          class={cn(
            "w-full rounded-none",
            showedGroup === "noninstalled" &&
              "border-b-transparent bg-transparent hover:bg-transparent",
          )}
          variant="outline"
          onclick={() => {
            showedGroup = "noninstalled";
          }}
        >
          {tab === "sources" ? "Disabled" : "Not installed"}
          <Badge variant="secondary">
            {tab === "sources"
              ? suwayomi.disabledSources.length
              : suwayomi.nonInstalledExtensions.length}
          </Badge>
        </Button>
        <Button
          class={cn(
            "w-full rounded-none",
            showedGroup === "all" &&
              "border-b-transparent bg-transparent hover:bg-transparent",
          )}
          variant="outline"
          onclick={() => {
            showedGroup = "all";
          }}
        >
          All
          <Badge variant="secondary">
            {tab === "sources"
              ? suwayomi.sources.length
              : suwayomi.extensions.length}
          </Badge>
        </Button>
        <Tooltip text="{suwayomi.hiddenExtensions.length} hided extensions">
          <Button
            class={cn(
              "w-12 rounded-l-none rounded-b-none",
              showedGroup === "hidden" &&
                "border-b-transparent bg-transparent hover:bg-transparent",
            )}
            variant="outline"
            onclick={() => {
              showedGroup = "hidden";
            }}
          >
            <Icon icon="lucide:eye-off" />
            <!-- <Badge variant="secondary" -->
            <!--   >{suwayomi.blockedExtensionList.length}</Badge -->
            <!-- > -->
          </Button>
        </Tooltip>
      </div>
      {#if tab === "sources" ? filteredSources.length > 0 : filteredExtensions.length > 0}
        {#if tab === "sources"}
          <VList
            class="scrollbar-chapters h-90! gap-2 overflow-x-hidden scroll-smooth pr-2"
            data={groupedSources}
            getKey={(_, i) => i}
            tabindex={-1}
            bufferSize={400}
          >
            {#snippet children([extension, sources], _)}
              {#if sources.length > 1}
                <ContextMenu.Root>
                  <ContextMenu.Trigger>
                    <Tooltip
                      text={sources[0].name}
                      subtext="Sources: {sources.length} | Repo: {prettifyRepo(
                        sources[0].extension.repo,
                      )}"
                      placement="left"
                    >
                      <Button
                        class="bg-background group/extension hover:bg-secondary/40 m-0.5 flex h-12 w-110 items-center justify-between gap-2 rounded-xl p-2 hover:no-underline!"
                        variant="link"
                        onclick={() => {
                          if (expandedSources[extension]) {
                            expandedSources[extension] = false;
                          } else {
                            expandedSources[extension] = true;
                          }
                        }}
                      >
                        <div
                          class="pointer-events-none flex items-center gap-2"
                        >
                          <Image
                            class="size-10"
                            src={suwayomiUrl.value + sources[0].iconUrl}
                          />
                          <div
                            class="gap-0.1 flex flex-col items-start justify-center"
                          >
                            <Label
                              class="max-w-54 cursor-pointer truncate text-lg group-hover/extension:underline!"
                            >
                              {sources[0].name}
                            </Label>
                            <div class="flex w-18 justify-between">
                              <span class="text-red-500">
                                {sources[0].isNsfw ? "+18" : ""}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div class="flex items-center gap-2 pr-2">
                          <Button
                            class="hover:bg-background h-8 w-9 rounded-lg"
                            variant="secondary"
                            onclick={(e) => {
                              e.stopPropagation();
                              openedExtension.set(
                                suwayomi.extensionsByPkgName[extension],
                              );
                              openExtensions.close();
                              openedExtension.open();
                              openedExtension.onopenchange = (open) => {
                                if (!open) {
                                  openExtensions.open();
                                  openedExtension.value = null;
                                }
                              };
                            }}
                          >
                            <Icon icon="lucide:arrow-up-right" />
                          </Button>
                          <Button
                            class="h-8 rounded-lg px-2.5"
                            variant="outline"
                            onclick={(e) => {
                              e.stopPropagation();
                              if (
                                Object.entries(enabledSources.value).filter(
                                  ([k, v]) =>
                                    sources
                                      .map((s) => s.id.toString())
                                      .includes(k) && v,
                                ).length === sources.length
                              ) {
                                enabledSources.value = {
                                  ...enabledSources.value,
                                  ...Object.fromEntries(
                                    sources.map((s) => [
                                      [s.id.toString()],
                                      false,
                                    ]),
                                  ),
                                };
                              } else {
                                enabledSources.value = {
                                  ...enabledSources.value,
                                  ...Object.fromEntries(
                                    sources.map((s) => [
                                      [s.id.toString()],
                                      true,
                                    ]),
                                  ),
                                };
                              }
                            }}
                          >
                            {Object.entries(enabledSources.value).filter(
                              ([k, v]) =>
                                sources
                                  .map((s) => s.id.toString())
                                  .includes(k) && v,
                            ).length === sources.length
                              ? "Disable"
                              : "Enable"} all
                          </Button>
                          <Icon
                            class={cn(
                              "size-5! transition-all duration-400",
                              !expandedSources[extension] && "-rotate-180",
                            )}
                            icon="lucide:chevron-up"
                          />
                        </div>
                      </Button>
                    </Tooltip>
                  </ContextMenu.Trigger>
                  <ContextMenu.Content>
                    <ContextMenu.Item
                      class="flex justify-between"
                      onclick={() => {
                        openedExtension.set(
                          suwayomi.extensionsByPkgName[extension],
                        );
                        openExtensions.close();
                        openedExtension.open();
                        openedExtension.onopenchange = (open) => {
                          if (!open) {
                            openExtensions.open();
                            openedExtension.value = null;
                          }
                        };
                      }}
                    >
                      <Label>See extension</Label>
                      <Icon icon="lucide:square-menu" />
                    </ContextMenu.Item>
                    <ContextMenu.Item
                      class="flex justify-between"
                      onclick={() => {
                        if (
                          Object.entries(hiddenSources.value).filter(
                            ([k, v]) =>
                              sources.map((s) => s.id.toString()).includes(k) &&
                              v,
                          ).length === sources.length
                        ) {
                          hiddenSources.value = {
                            ...hiddenSources.value,
                            ...Object.fromEntries(
                              sources.map((s) => [[s.id.toString()], false]),
                            ),
                          };
                        } else {
                          hiddenSources.value = {
                            ...hiddenSources.value,
                            ...Object.fromEntries(
                              sources.map((s) => [[s.id.toString()], true]),
                            ),
                          };
                        }
                      }}
                    >
                      <Label>
                        {Object.entries(hiddenSources.value).filter(
                          ([k, v]) =>
                            sources.map((s) => s.id.toString()).includes(k) &&
                            v,
                        ).length === sources.length
                          ? "Unhide"
                          : "Hide"} all
                      </Label>
                      <Icon
                        icon={Object.entries(hiddenSources.value).filter(
                          ([k, v]) =>
                            sources.map((s) => s.id.toString()).includes(k) &&
                            v,
                        ).length === sources.length
                          ? "lucide:eye"
                          : "lucide:eye-off"}
                      />
                    </ContextMenu.Item>
                  </ContextMenu.Content>
                </ContextMenu.Root>
                <div
                  class={cn(
                    "grid items-center overflow-hidden pl-1.5 transition-all duration-300 ease-in-out",
                    expandedSources[extension]
                      ? "grid-rows-[1fr]"
                      : "grid-rows-[0fr]",
                  )}
                >
                  <div
                    class="bg-background/50 mr-4 overflow-hidden rounded-xl p-1"
                  >
                    {#each sources as source}
                      <ContextMenu.Root>
                        <ContextMenu.Trigger>
                          <Tooltip
                            text={source.displayName}
                            subtext="Lang: {getLang(
                              source.lang,
                            )} | Repo: {prettifyRepo(source.extension.repo)}"
                            placement="left"
                          >
                            <Button
                              class="bg-background group/extension hover:bg-secondary/40 m-0.5 flex h-10 w-105 items-center justify-between gap-2 rounded-xl p-2 hover:no-underline!"
                              variant="link"
                              onclick={() => {
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
                                    {getLang(source.lang)}
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
                                  >
                                    <Icon icon="lucide:settings" />
                                  </Button>
                                {/if}
                                <Switch
                                  // class="rounded-lg font-bold"
                                  // variant={source.iconUrl ? "destructive" : "default"}
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
                              openedExtension.set(
                                suwayomi.extensionsByPkgName[extension],
                              );
                              openExtensions.close();
                              openedExtension.open();
                              openedExtension.onopenchange = (open) => {
                                if (!open) {
                                  openExtensions.open();
                                  openedExtension.value = null;
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
                    {/each}
                  </div>
                </div>
              {:else}
                <ContextMenu.Root>
                  <ContextMenu.Trigger>
                    <Tooltip
                      text={sources[0].name}
                      subtext="Lang: {getLang(
                        sources[0].lang,
                      )} | Repo: {prettifyRepo(sources[0].extension.repo)}"
                      placement="left"
                    >
                      <Button
                        class="bg-background group/extension hover:bg-secondary/40 m-0.5 flex h-12 w-110 items-center justify-between gap-2 rounded-xl p-2 hover:no-underline!"
                        variant="link"
                        onclick={() => {
                          openedExtension.set(
                            suwayomi.extensionsByPkgName[extension],
                          );
                          openExtensions.close();
                          openedExtension.open();
                          openedExtension.onopenchange = (open) => {
                            if (!open) {
                              openExtensions.open();
                              openedExtension.value = null;
                            }
                          };
                        }}
                      >
                        <div
                          class="pointer-events-none flex items-center gap-2"
                        >
                          <Image
                            class="size-10"
                            src={suwayomiUrl.value + sources[0].iconUrl}
                          />
                          <div
                            class="gap-0.1 flex flex-col items-start justify-center"
                          >
                            <Label
                              class="max-w-54 cursor-pointer truncate text-lg group-hover/extension:underline!"
                            >
                              {sources[0].name}
                            </Label>
                            <div class="flex w-18 justify-between">
                              <span class="text-gray-500">
                                <!-- {sources[0].displayName} -->
                                {getLang(sources[0].lang)}
                              </span>
                              <!-- <span class="text-red-500"> -->
                              <!--   {sources[0].isNsfw ? "+18" : ""} -->
                              <!-- </span> -->
                            </div>
                          </div>
                        </div>
                        <div class="flex items-center gap-2">
                          {#if sources[0].isConfigurable && enabledSources.value[sources[0].id.toString()]}
                            <Button class="h-8 w-9 rounded-lg" variant="ghost">
                              <Icon icon="lucide:settings" />
                            </Button>
                          {/if}
                          <Switch
                            // class="rounded-lg font-bold"
                            // variant={source.iconUrl ? "destructive" : "default"}
                            checked={enabledSources.value[
                              sources[0].id.toString()
                            ]}
                            onclick={async (e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              if (
                                enabledSources.value[sources[0].id.toString()]
                              ) {
                                enabledSources.value = {
                                  ...enabledSources.value,
                                  [sources[0].id.toString()]: false,
                                };
                              } else {
                                enabledSources.value = {
                                  ...enabledSources.value,
                                  [sources[0].id.toString()]: true,
                                };
                              }
                            }}
                          />
                        </div>
                      </Button>
                    </Tooltip>
                  </ContextMenu.Trigger>
                  <ContextMenu.Content>
                    <ContextMenu.Item class="flex justify-between">
                      <Label>See info</Label>
                      <Icon icon="lucide:square-menu" />
                    </ContextMenu.Item>
                    <ContextMenu.Item
                      class="flex justify-between"
                      onclick={(e) => {
                        e.stopPropagation();
                        if (hiddenSources.value[sources[0].id.toString()]) {
                          hiddenSources.value = {
                            ...hiddenSources.value,
                            [sources[0].id.toString()]: false,
                          };
                        } else {
                          hiddenSources.value = {
                            ...hiddenSources.value,
                            [sources[0].id.toString()]: true,
                          };
                        }
                      }}
                    >
                      <Label>
                        {hiddenSources.value[sources[0].id.toString()]
                          ? "Unhide"
                          : "Hide"} source
                      </Label>
                      <Icon
                        icon={hiddenSources.value[sources[0].id.toString()]
                          ? "lucide:eye"
                          : "lucide:eye-off"}
                      />
                    </ContextMenu.Item>
                  </ContextMenu.Content>
                </ContextMenu.Root>
              {/if}
            {/snippet}
          </VList>
        {:else}
          <VList
            class="scrollbar-chapters h-90! gap-2 overflow-x-hidden scroll-smooth pr-2"
            data={filteredExtensions}
            getKey={(_, i) => i}
            tabindex={-1}
            bufferSize={400}
          >
            {#snippet children(extension, _)}
              <ContextMenu.Root>
                <ContextMenu.Trigger>
                  <Tooltip
                    text={extension.name}
                    subtext="Lang: {getLang(
                      extension.lang,
                    )} | Repo: {prettifyRepo(extension.repo)}"
                    placement="left"
                  >
                    <Button
                      class="bg-background group/extension hover:bg-secondary/40 m-0.5 flex h-12 w-110 items-center justify-between gap-2 rounded-xl p-2 hover:no-underline!"
                      variant="link"
                      onclick={() => {
                        openedExtension.set(extension);
                        openExtensions.close();
                        openedExtension.open();
                        openedExtension.onopenchange = (open) => {
                          if (!open) {
                            openExtensions.open();
                            openedExtension.value = null;
                          }
                        };
                      }}
                    >
                      <div class="pointer-events-none flex items-center gap-2">
                        <Image
                          class="size-10"
                          src={suwayomiUrl.value + extension.iconUrl}
                        />
                        <div
                          class="gap-0.1 flex flex-col items-start justify-center"
                        >
                          <Label
                            class="max-w-54 cursor-pointer truncate text-lg group-hover/extension:underline!"
                          >
                            {extension.name}
                          </Label>
                          <div class="flex w-18 justify-between">
                            <span class="text-gray-500">
                              {extension.versionName}
                            </span>
                            <span class="text-red-500">
                              {extension.isNsfw ? "+18" : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                        {#if extension.isInstalled}
                          <Button class="h-8 w-9 rounded-lg" variant="ghost">
                            <Icon icon="lucide:settings" />
                          </Button>
                        {/if}
                        <Button
                          class="h-8 w-22 rounded-lg font-bold"
                          variant={installingExtensions[extension.pkgName]
                            ? "outline"
                            : extension.isInstalled
                              ? "destructive"
                              : "default"}
                          disabled={installingExtensions[extension.pkgName]}
                          onclick={async (e) => {
                            e.stopPropagation();
                            if (showedGroup !== "hidden") {
                              if (!extension.isInstalled) {
                                installingExtensions[extension.pkgName] = true;
                              }
                              extension.isInstalled =
                                await suwaManager.updateExtension(
                                  extension.pkgName,
                                  !extension.isInstalled,
                                );
                              delete installingExtensions[extension.pkgName];
                            } else {
                              hiddenExtensions.value = {
                                ...hiddenExtensions.value,
                                [extension.pkgName]: false,
                              };
                            }
                          }}
                        >
                          {showedGroup !== "hidden"
                            ? installingExtensions[extension.pkgName]
                              ? "..."
                              : extension.isInstalled
                                ? "Uninstall"
                                : "Install"
                            : "Unhide"}
                        </Button>
                      </div>
                    </Button>
                  </Tooltip>
                </ContextMenu.Trigger>
                <ContextMenu.Content>
                  <ContextMenu.Item class="flex justify-between">
                    <Label>See info</Label>
                    <Icon icon="lucide:square-menu" />
                  </ContextMenu.Item>
                  <ContextMenu.Item
                    class="flex justify-between"
                    onclick={(e) => {
                      e.stopPropagation();
                      if (hiddenExtensions.value[extension.pkgName]) {
                        hiddenExtensions.value = {
                          ...hiddenExtensions.value,
                          [extension.pkgName]: false,
                        };
                      } else {
                        hiddenExtensions.value = {
                          ...hiddenExtensions.value,
                          [extension.pkgName]: true,
                        };
                      }
                    }}
                  >
                    <Label>
                      {hiddenExtensions.value[extension.pkgName]
                        ? "Show"
                        : "Hide"} extension
                    </Label>
                    <Icon
                      icon={hiddenExtensions.value[extension.pkgName]
                        ? "lucide:eye"
                        : "lucide:eye-off"}
                    />
                  </ContextMenu.Item>
                </ContextMenu.Content>
              </ContextMenu.Root>
              <!-- {/if} -->
            {/snippet}
          </VList>
        {/if}
      {:else}
        <div
          class="text-primary flex h-90 w-full flex-col items-center justify-center gap-7"
        >
          <span class="text-lg">
            {query !== ""
              ? "Nothing found... 67"
              : "You don't seem to have any " +
                (showedGroup === "all"
                  ? ""
                  : showedGroup === "installed"
                    ? tab === "sources"
                      ? "enabled"
                      : "installed"
                    : showedGroup === "noninstalled"
                      ? tab === "sources"
                        ? "disabled"
                        : "not installed"
                      : "hidden") +
                (tab === "sources" ? " sources..." : " extensions...")}
          </span>
          <span class="text-4xl">¯\_(ツ)_/¯</span>
        </div>
      {/if}
    </div>
  </Dialog.Content>
</Dialog.Root>
