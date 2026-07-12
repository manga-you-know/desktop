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
    extensionManagerTab,
    favoriteSources,
    hiddenExtensions,
    hiddenSources,
    openedExtension,
    openExtensions,
    repoInfo,
    showExtensionsNSourcesNSFW,
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
    getLangName,
    getLangNative,
    prettifyRepo,
    removeOrigin,
  } from "@/lib/utils";
  import { openUrl } from "@tauri-apps/plugin-opener";
  import { IsoLanguages } from "@/constants";
  import type { Extension, Source } from "@/types";
  import { open as openFile } from "@tauri-apps/plugin-dialog";
  import { flip } from "svelte/animate";
  import { animate } from "animejs";
  import { readFile } from "@tauri-apps/plugin-fs";
  import { ScrollingValue } from "svelte-ux";

  let query = $state("");
  let queryLangs = $state("");
  let showedGroup = $state<"all" | "installed" | "noninstalled" | "hidden">(
    "all",
  );

  let installingExtensions: Record<string, boolean> = $state({});

  let filteredSources = $derived(
    showedGroup === "hidden"
      ? suwayomi.hiddenSources.filter(
          (s) =>
            s.displayName.toLowerCase().includes(query.toLowerCase()) ||
            s.name.toLowerCase().includes(query.toLowerCase()),
        )
      : showedGroup === "noninstalled" || showedGroup === "all"
        ? suwayomi.sources.filter(
            (s) =>
              (showExtensionsNSourcesNSFW.value ? true : !s.isNsfw) &&
              (s.name.toLowerCase().includes(query.toLowerCase()) ||
                s.displayName.toLowerCase().includes(query.toLowerCase())) &&
              (showedGroup === "all"
                ? true
                : !enabledSources.value[s.id.toString()]) &&
              allowedSourceLanguages.value[s.lang],
          )
        : suwayomi.enabledSources.filter(
            (s) =>
              (showExtensionsNSourcesNSFW.value ? true : !s.isNsfw) &&
              (s.name.toLowerCase().includes(query.toLowerCase()) ||
                s.displayName.toLowerCase().includes(query.toLowerCase())) &&
              (showExtensionsNSourcesNSFW.value ? true : !s.isNsfw),
            // && allowedSourceLanguages.value[s.lang],
          ),
  );

  type SourceRow =
    | { kind: "header"; lang: string; count: number }
    | { kind: "source"; source: Source; indexLang: number };

  let sourceRows: SourceRow[] = $derived.by(() => {
    const rows: SourceRow[] = [];
    Object.entries(Object.groupBy(filteredSources, (s) => s.lang))
      .sort((a, b) => {
        if (a[0] === "all") return -1;
        if (b[0] === "all") return 1;
        const aName = getLangNative(a[0]);
        const bName = getLangNative(b[0]);
        return aName.localeCompare(bName, "en", { sensitivity: "base" });
      })
      .forEach(([lang, sources]) => {
        if (sources) {
          rows.push({
            kind: "header",
            lang: lang,
            count: sources.length,
          });
          const rType: "source" | "header" = "source";
          rows.push(
            ...sources.map((s, i) => {
              return {
                kind: rType,
                source: s,
                indexLang: i,
              };
            }),
          );
        }
      });
    return rows;
  });

  let filteredSourceRows: SourceRow[] = $derived(
    sourceRows.filter((r) =>
      r.kind === "header"
        ? true
        : !unexpandedLangSources[r.source.lang] || r.indexLang < 10,
    ),
  );

  let filteredExtensions = $derived(
    showedGroup === "hidden"
      ? suwayomi.hiddenExtensions.filter((e) =>
          e.name.toLowerCase().includes(query.toLowerCase()),
        )
      : showedGroup === "noninstalled" || showedGroup === "all"
        ? suwayomi.extensions
            .filter(
              (e) =>
                (showExtensionsNSourcesNSFW.value ? true : !e.isNsfw) &&
                e.name.toLowerCase().includes(query.toLowerCase()) &&
                (showedGroup === "all" ? true : !e.isInstalled) &&
                allowedExtensionLanguages.value[e.lang],
            )
            .sort((a, b) => {
              const aName = getLangNative(a.lang);
              const bName = getLangNative(b.lang);
              return aName.localeCompare(bName, "en", {
                sensitivity: "base",
              });
            })
        : suwayomi.installedExtensions
            .filter(
              (e) =>
                (showExtensionsNSourcesNSFW.value ? true : !e.isNsfw) &&
                e.name.toLowerCase().includes(query.toLowerCase()),
              // && allowedExtensionLanguages.value[e.lang],
            )
            .sort((a, b) => {
              const aName = getLangNative(a.lang);
              const bName = getLangNative(b.lang);
              return aName.localeCompare(bName, "en", {
                sensitivity: "base",
              });
            }),
  );

  type ExtensionRow =
    | { kind: "header"; lang: string; count: number }
    | { kind: "extension"; extension: Extension; indexLang: number };

  let extensionRows: ExtensionRow[] = $derived.by(() => {
    const rows: ExtensionRow[] = [];
    Object.entries(Object.groupBy(filteredExtensions, (s) => s.lang))
      .sort((a, b) => {
        if (a[0] === "all") return -1;
        if (b[0] === "all") return 1;
        const aName = getLangNative(a[0]);
        const bName = getLangNative(b[0]);
        return aName.localeCompare(bName, "en", { sensitivity: "base" });
      })
      .forEach(([lang, extensions]) => {
        if (extensions) {
          rows.push({
            kind: "header",
            lang: lang,
            count: extensions.length,
          });
          const rType: "extension" | "header" = "extension";
          rows.push(
            ...extensions.map((e, i) => {
              return {
                kind: rType,
                extension: e,
                indexLang: i,
              };
            }),
          );
        }
      });
    return rows;
  });

  let filteredExtensionRows: ExtensionRow[] = $derived(
    extensionRows.filter((r) =>
      r.kind === "header"
        ? true
        : !unexpandedLangExtensions[r.extension.lang] || r.indexLang < 10,
    ),
  );

  let availableLangsByTab = $derived(
    extensionManagerTab.value === "sources"
      ? suwayomi.availableSourceLangs
      : suwayomi.availableExtensionLangs,
  );

  let filteredLangs = $derived(
    availableLangsByTab
      .sort((a, b) => {
        if (a === "all") return -1;
        if (b === "all") return 1;
        // let aAllowed = 0;

        // let bAllowed = 0;
        // if (tab === "sources") {
        //   aAllowed = allowedSourceLanguages.value[a] ? 1 : 0;
        //   bAllowed = allowedSourceLanguages.value[b] ? 1 : 0;
        // } else {
        //   aAllowed = allowedExtensionLanguages.value[a] ? 1 : 0;
        //   bAllowed = allowedExtensionLanguages.value[b] ? 1 : 0;
        // }
        // if (aAllowed !== bAllowed) return bAllowed - aAllowed;
        const aName = getLangNative(a);
        const bName = getLangNative(b);
        return aName.localeCompare(bName, "en", { sensitivity: "base" });
      })
      .filter(
        (lang) =>
          lang.toLowerCase().includes(queryLangs.toLowerCase()) ||
          getLangNative(lang)
            .toLowerCase()
            .includes(queryLangs.toLowerCase()) ||
          getLangName(lang).toLowerCase().includes(queryLangs.toLowerCase()),
      ),
  );

  let allowedLanguages: string[] = $derived(
    extensionManagerTab.value === "sources"
      ? Object.entries(allowedSourceLanguages.value)
          .filter(([_, v]) => v)
          .map(([k, _]) => k)
      : Object.entries(allowedExtensionLanguages.value)
          .filter(([_, v]) => v)
          .map(([k, _]) => k),
  );

  let unexpandedLangSources: Record<string, boolean> = $state({});
  let unexpandedLangExtensions: Record<string, boolean> = $state({});
  let stateSourcesActivated: Record<string, boolean> = $state({});
  let stateExtensionsActivated: Record<string, boolean> = $state({});
  let updatingExtension: Record<string, boolean> = $state({});

  const removeClean = async (elId: string) => {
    return await animate(`#${elId}`, {
      opacity: 0,
      maxHeight: ["48px", "0px"],
      marginBottom: 0,
      paddingTop: 0,
      paddingBottom: 0,
      translateY: -20,
      delay: 200,
      duration: 400,
      easing: "easeInQuad",
    });
  };

  const toggleSourceActive = async (sourceId: string) => {
    if (showedGroup !== "all") {
      if (enabledSources.value[sourceId]) {
        stateSourcesActivated = {
          [sourceId]: false,
        };
      } else {
        stateSourcesActivated = {
          [sourceId]: true,
        };
      }
      await removeClean(`source-${sourceId}`);
      stateSourcesActivated = {};
    }
    if (enabledSources.value[sourceId]) {
      enabledSources.value = {
        ...enabledSources.value,
        [sourceId]: false,
      };
    } else {
      enabledSources.value = {
        ...enabledSources.value,
        [sourceId]: true,
      };
    }
  };

  const toggleExtensionInstalled = async (
    extension: Extension,
  ): Promise<boolean> => {
    installingExtensions[extension.pkgName] = true;
    const isInstalled = (
      await suwaManager.patchExtension(
        extension.pkgName,
        extension.isInstalled ? "uninstall" : "install",
        false,
      )
    ).isInstalled;
    delete installingExtensions[extension.pkgName];
    if (showedGroup !== "all") {
      if (extension.isInstalled) {
        stateExtensionsActivated = {
          [extension.pkgName]: false,
        };
      } else {
        stateExtensionsActivated = {
          [extension.pkgName]: true,
        };
      }
      await removeClean(`extension-${extension.pkgName.split(".").at(-1)}`);
      stateExtensionsActivated = {};
    }
    for (const source of suwayomi.rawSources) {
      if (source.extension.pkgName === extension.pkgName)
        if (isInstalled) {
          enabledSources.value = {
            ...enabledSources.value,
            [source.id]:
              allowedExtensionLanguages.value[source.lang] ||
              allowedSourceLanguages.value[source.lang],
          };
        } else {
          enabledSources.value = {
            ...enabledSources.value,
            [source.id]: false,
          };
        }
    }
    return isInstalled;
  };

  $inspect(suwayomi.rawSources);
</script>

<Dialog.Root bind:open={openExtensions.active}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Manage {extensionManagerTab.value}</Dialog.Title>
      <Dialog.Description>
        Select which {extensionManagerTab.value} you want to {extensionManagerTab.value ===
        "sources"
          ? "enable"
          : "install"}
      </Dialog.Description>
    </Dialog.Header>
    <div class="flex w-full justify-center">
      <div
        class="bg-background/40 parent flex w-full rounded-2xl p-2 font-bold"
      >
        <Button
          class={cn(
            "start pointer-events-none absolute h-8 w-1/2 rounded-xl transition-all duration-500",
            extensionManagerTab.value === "sources"
              ? "translate-x-0"
              : "translate-x-50",
          )}
        />
        <Button
          class={cn(
            "hover:text-primary/70 z-2 h-8 w-full rounded-xl hover:bg-transparent",
            extensionManagerTab.value === "sources" &&
              "text-background hover:text-background/70",
          )}
          variant="ghost"
          onclick={() => (extensionManagerTab.value = "sources")}
        >
          Sources
        </Button>
        <Button
          class={cn(
            "hover:text-primary/70 z-2 h-8 w-full rounded-xl hover:bg-transparent",
            extensionManagerTab.value === "extensions" &&
              "text-background hover:text-background/70",
          )}
          variant="ghost"
          onclick={() => (extensionManagerTab.value = "extensions")}
        >
          Extensions
        </Button>
      </div>
    </div>
    <div class="flex w-full flex-col justify-center gap-3">
      <div class="flex w-full gap-2">
        <Tooltip text="Install extension from file">
          <Button
            variant="default"
            onclick={async () => {
              const path = await openFile({
                filters: [{ name: "Extension", extensions: ["apk"] }],
              });
              if (!path) return;
              const bytes = await readFile(path);
              const file = new File([bytes], path.split("/").pop()!, {
                type: "application/vnd.android.package-archive",
              });
              suwaManager.installExternalExtension(file);
            }}
          >
            <Icon icon="lucide:file-plus-corner" />
            Add
          </Button>
        </Tooltip>
        <Button
          class="flex w-24 justify-between rounded-xl font-bold duration-500"
          variant={showExtensionsNSourcesNSFW.value ? "destructive" : "info"}
          disabled={showedGroup === "hidden"}
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
              Repositories
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
                  {#if repoInfo.value[getBasePath(repo)]}
                    <div class="flex w-full gap-1">
                      <Button
                        class="h-7 w-full justify-start opacity-100 hover:bg-transparent"
                        variant="ghost"
                        data-mouse
                      >
                        {repoInfo.value[getBasePath(repo)].name}
                      </Button>
                      <Button
                        class="hover:bg-background/70 pointer-events-auto z-2 size-7 cursor-pointer! rounded-xl opacity-100"
                        variant="secondary"
                        onclick={(e) => {
                          e.stopPropagation();
                          openUrl(repoInfo.value[getBasePath(repo)].website);
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
          <Popover.Trigger
            disabled={["installed", "hidden"].includes(showedGroup)}
          >
            <Tooltip
              text="{allowedLanguages.length} allowed language{allowedLanguages.length >
              1
                ? 's'
                : ''}"
            >
              <Button class="rounded-xl" disabled={showedGroup === "installed"}>
                <Icon icon="lucide:languages" />
                Languages
              </Button>
            </Tooltip>
          </Popover.Trigger>
          <Popover.Content class="flex flex-col gap-2 overflow-scroll p-2">
            <div class="flex w-full items-center justify-between p-1">
              <!-- <Label> -->
              <!--   Allowed languages: {allowedLanguages.length} / {availableLangsByTab.length} -->
              <!-- </Label> -->
              <Badge class="h-8 w-20 rounded-lg text-sm" variant="secondary">
                <ScrollingValue value={allowedLanguages.length} /> / <ScrollingValue
                  value={availableLangsByTab.length}
                />
              </Badge>
              <Button
                class="h-8 rounded-lg px-2.5"
                variant="default"
                onclick={() => {
                  const data: Record<string, boolean> = {};
                  if (extensionManagerTab.value === "sources") {
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
              <Button
                class="h-8 rounded-lg px-2.5"
                variant="destructive"
                onclick={() => {
                  if (extensionManagerTab.value === "sources") {
                    allowedSourceLanguages.value = {};
                  } else {
                    allowedExtensionLanguages.value = {};
                  }
                }}
              >
                Disable all
              </Button>
            </div>
            <div class="flex gap-2">
              <Badge class="w-14" variant="outline">
                <ScrollingValue value={filteredLangs.length} />
              </Badge>
              <Input
                class="w-full"
                bind:value={queryLangs}
                variant="outline"
                placeholder="Search langs..."
              />
            </div>
            <div class="flex max-h-80 flex-col gap-1 overflow-scroll p-2">
              {#each filteredLangs as lang (lang)}
                <div class="w-full">
                  <Button
                    class="w-full cursor-pointer items-center gap-1 px-2"
                    variant="outline"
                    onclick={(e) => {
                      e.stopPropagation();
                      if (extensionManagerTab.value === "sources") {
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
                  >
                    <Switch
                      checked={extensionManagerTab.value === "sources"
                        ? allowedSourceLanguages.value[lang]
                        : allowedExtensionLanguages.value[lang]}
                    />
                    <Button
                      class="h-6 w-full justify-start rounded-xl"
                      variant="ghost"
                    >
                      {getLangNative(lang)}
                    </Button>
                  </Button>
                </div>
              {:else}
                <Badge class="w-full text-sm font-bold flex flex-col">
                  No languages found...
                  <span class="text-xl">┐(‘～` )┌</span>
                </Badge>
              {/each}
            </div>
          </Popover.Content>
        </Popover.Root>
      </div>
      <div class="flex w-full gap-2">
        <Badge class="w-12 rounded-xl" variant="outline">
          <ScrollingValue
            value={extensionManagerTab.value === "sources"
              ? filteredSources.length
              : filteredExtensions.length}
          />
        </Badge>
        <Input
          class="w-full"
          divClass="w-full"
          variant="outline"
          placeholder="Search for {extensionManagerTab.value}..."
          bind:value={query}
        />
        <Badge class="w-27 text-sm font-bold" variant="secondary">
          <ScrollingValue
            value={extensionManagerTab.value === "sources"
              ? suwayomi.enabledSources.length
              : suwayomi.installedExtensions.length}
          />
          /
          <ScrollingValue
            value={extensionManagerTab.value === "sources"
              ? suwayomi.sources.length
              : suwayomi.extensions.length}
          />
        </Badge>
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
          {extensionManagerTab.value === "sources" ? "Enabled" : "Installed"}
          <Badge variant="secondary">
            <ScrollingValue
              value={extensionManagerTab.value === "sources"
                ? suwayomi.enabledSources.length
                : suwayomi.installedExtensions.length}
            />
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
          {extensionManagerTab.value === "sources"
            ? "Disabled"
            : "Not installed"}
          <Badge variant="secondary">
            <ScrollingValue
              value={extensionManagerTab.value === "sources"
                ? suwayomi.disabledSources.length
                : suwayomi.nonInstalledExtensions.length}
            />
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
            <ScrollingValue
              value={extensionManagerTab.value === "sources"
                ? suwayomi.sources.length
                : suwayomi.extensions.length}
            />
          </Badge>
        </Button>
        <Tooltip text="{suwayomi.hiddenExtensions.length} hidded extensions">
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
      {#if extensionManagerTab.value === "sources" ? filteredSources.length > 0 : filteredExtensions.length > 0}
        {#if extensionManagerTab.value === "sources"}
          <VList
            class="scrollbar h-80! gap-2 overflow-x-hidden scroll-smooth pr-2"
            data={filteredSourceRows}
            getKey={(s, _) => (s.kind === "source" ? s.source.id : s.lang)}
            tabindex={-1}
          >
            {#snippet children(sRow, _)}
              {#if sRow.kind === "source"}
                <ContextMenu.Root>
                  <ContextMenu.Trigger>
                    <Tooltip
                      text={sRow.source.name}
                      subtext="Lang: {getLangNative(
                        sRow.source.lang,
                      )} | Repo: {prettifyRepo(sRow.source.extension.repo)}"
                      placement="left"
                    >
                      <Button
                        class={cn(
                          "bg-background group/extension hover:bg-secondary/40 m-0.5 flex h-12 w-110 items-center justify-between gap-2 rounded-xl p-2  hover:no-underline!",
                          unexpandedLangSources[sRow.source.lang] &&
                            "pointer-events-none my-0 h-0 py-0 opacity-0",
                          !(sRow.source.id in stateSourcesActivated) &&
                            "transition-[height,opacity,padding] duration-400",
                        )}
                        variant="link"
                        id="source-{sRow.source.id}"
                        onclick={() => {
                          openExtensions.close();
                          openedExtension.open({
                            extension:
                              suwayomi.extensionsByPkgName[
                                sRow.source.extension.pkgName
                              ],
                          });
                          openedExtension.onopenchange = (open) => {
                            if (!open) {
                              openExtensions.open();
                              openedExtension.value = {};
                            }
                          };
                        }}
                      >
                        <div
                          class="pointer-events-none flex items-center gap-2"
                        >
                          <Image
                            class="size-10"
                            src={suwayomiUrl.value + sRow.source.iconUrl}
                          />
                          <div
                            class="gap-0.1 flex flex-col items-start justify-center"
                          >
                            <Label
                              class="max-w-54 cursor-pointer truncate text-lg group-hover/extension:underline!"
                            >
                              {sRow.source.displayName}
                            </Label>
                            <div class="flex w-18 justify-between">
                              <span class="text-red-500">
                                {sRow.source.isNsfw ? "+18" : ""}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div class="flex items-center gap-1">
                          {#if suwayomi.extensionsByPkgName[sRow.source.extension.pkgName]?.hasUpdate && enabledSources.value[sRow.source.id]}
                            <Tooltip text="New update available!">
                              <Button
                                class="size-8 rounded-lg"
                                variant="info"
                                disabled={updatingExtension[
                                  sRow.source.extension.pkgName
                                ]}
                                onclick={async (e) => {
                                  e.stopPropagation();
                                  updatingExtension[
                                    sRow.source.extension.pkgName
                                  ] = true;
                                  await suwaManager.patchExtension(
                                    sRow.source.extension.pkgName,
                                    "update",
                                  );
                                  updatingExtension[
                                    sRow.source.extension.pkgName
                                  ] = false;
                                }}
                              >
                                <Icon
                                  class={cn(
                                    updatingExtension[
                                      sRow.source.extension.pkgName
                                    ] && "animate-spin",
                                  )}
                                  icon="lucide:refresh-cw"
                                />
                              </Button>
                            </Tooltip>
                          {/if}
                          {#if sRow.source.isConfigurable && enabledSources.value[sRow.source.id]}
                            <Button
                              class="h-8 w-9 rounded-lg"
                              variant="ghost"
                              onclick={(e) => {
                                e.stopPropagation();
                                openExtensions.close();
                                openedExtension.open({
                                  source: sRow.source,
                                  extension:
                                    suwayomi.extensionsByPkgName[
                                      sRow.source.extension.pkgName
                                    ],
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
                            text="{favoriteSources.value[sRow.source.id]
                              ? 'Unfavorite'
                              : 'Favorite'} source {sRow.source.displayName}"
                          >
                            <Button
                              class={cn(
                                "h-8 w-9 max-w-0 rounded-4xl px-0 opacity-0 transition-all duration-500",
                                enabledSources.value[sRow.source.id] &&
                                  "max-w-9 px-2 opacity-100",
                              )}
                              variant={favoriteSources.value[sRow.source.id]
                                ? "default"
                                : "ghost"}
                              onclick={(e) => {
                                e.stopPropagation();
                                if (favoriteSources.value[sRow.source.id]) {
                                  favoriteSources.value = {
                                    ...favoriteSources.value,
                                    [sRow.source.id]: false,
                                  };
                                } else {
                                  favoriteSources.value = {
                                    ...favoriteSources.value,
                                    [sRow.source.id]: true,
                                  };
                                }
                              }}
                            >
                              <Icon
                                class={cn(
                                  "transition-transform duration-400",
                                  favoriteSources.value[sRow.source.id] &&
                                    "rotate-360",
                                )}
                                icon={favoriteSources.value[sRow.source.id]
                                  ? "lucide:star"
                                  : "lucide:star-off"}
                              />
                            </Button>
                          </Tooltip>
                          <Switch
                            checked={sRow.source.id in stateSourcesActivated
                              ? stateSourcesActivated[sRow.source.id]
                              : enabledSources.value[sRow.source.id.toString()]}
                            onclick={async (e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              toggleSourceActive(sRow.source.id);
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
                        if (hiddenSources.value[sRow.source.id.toString()]) {
                          hiddenSources.value = {
                            ...hiddenSources.value,
                            [sRow.source.id.toString()]: false,
                          };
                        } else {
                          hiddenSources.value = {
                            ...hiddenSources.value,
                            [sRow.source.id.toString()]: true,
                          };
                        }
                      }}
                    >
                      <Label>
                        {hiddenSources.value[sRow.source.id.toString()]
                          ? "Unhide"
                          : "Hide"} source
                      </Label>
                      <Icon
                        icon={hiddenSources.value[sRow.source.id.toString()]
                          ? "lucide:eye"
                          : "lucide:eye-off"}
                      />
                    </ContextMenu.Item>
                  </ContextMenu.Content>
                </ContextMenu.Root>
              {:else}
                <ContextMenu.Root>
                  <ContextMenu.Trigger>
                    <Button
                      class="bg-secondary/70 group/extension hover:bg-secondary/40 m-0.5 flex h-8 w-110 items-center justify-between gap-2 rounded-lg p-2 hover:no-underline!"
                      variant="link"
                      onclick={() => {
                        if (unexpandedLangSources[sRow.lang]) {
                          unexpandedLangSources[sRow.lang] = false;
                        } else {
                          unexpandedLangSources[sRow.lang] = true;
                        }
                      }}
                    >
                      <div class="flex text-lg">
                        {getLangNative(sRow.lang)}
                      </div>
                      <div class="flex items-center gap-3">
                        <Tooltip
                          text="Hide language: {getLangNative(sRow.lang)}"
                        >
                          <Button
                            class="size-6"
                            variant="secondary"
                            onclick={(e) => {
                              e.stopPropagation();
                              allowedSourceLanguages.value = {
                                ...allowedSourceLanguages.value,
                                [sRow.lang]: false,
                              };
                            }}
                          >
                            <Icon icon="lucide:eye-off" />
                          </Button>
                        </Tooltip>
                        <Badge
                          class="pointer-events-none min-w-10 rounded-xl text-sm"
                          variant="outline"
                        >
                          <ScrollingValue value={sRow.count} />
                        </Badge>
                        <Icon
                          class={cn(
                            "size-5! transition-all duration-400",
                            unexpandedLangSources[sRow.lang] && "-rotate-180",
                          )}
                          icon="lucide:chevron-up"
                        />
                      </div>
                    </Button>
                  </ContextMenu.Trigger><ContextMenu.Content
                  ></ContextMenu.Content>
                </ContextMenu.Root>
              {/if}
            {/snippet}
          </VList>
        {:else}
          <VList
            class="scrollbar h-80! gap-2 overflow-x-hidden scroll-smooth pr-2"
            data={filteredExtensionRows}
            getKey={(e, _) =>
              e.kind === "extension" ? e.extension.pkgName : e.lang}
            tabindex={-1}
            bufferSize={400}
          >
            {#snippet children(eRow, _)}
              {#if eRow.kind === "extension"}
                <ContextMenu.Root>
                  <ContextMenu.Trigger>
                    <Tooltip
                      text={eRow.extension.name}
                      subtext="Lang: {getLangNative(
                        eRow.extension.lang,
                      )} | Repo: {prettifyRepo(eRow.extension.repo)}"
                      placement="left"
                    >
                      <Button
                        class={cn(
                          "bg-background group/extension hover:bg-secondary/40 m-0.5 flex h-12 w-110 items-center justify-between gap-2 rounded-xl p-2  hover:no-underline!",
                          unexpandedLangExtensions[eRow.extension.lang] &&
                            "pointer-events-none my-0 h-0 py-0 opacity-0",
                          !(
                            eRow.extension.pkgName in stateExtensionsActivated
                          ) &&
                            "transition-[height,opacity,padding] duration-400",
                        )}
                        variant="link"
                        id="extension-{eRow.extension.pkgName
                          .split('.')
                          .at(-1)}"
                        onclick={() => {
                          openExtensions.close();
                          openedExtension.open({ extension: eRow.extension });
                          openedExtension.onopenchange = (open) => {
                            if (!open) {
                              openExtensions.open();
                              openedExtension.value = {};
                            }
                          };
                        }}
                      >
                        <div
                          class="pointer-events-none flex items-center gap-2"
                        >
                          <Image
                            class="size-10"
                            src={suwayomiUrl.value + eRow.extension.iconUrl}
                          />
                          <div
                            class="gap-0.1 flex flex-col items-start justify-center"
                          >
                            <Label
                              class="max-w-54 cursor-pointer truncate text-lg group-hover/extension:underline!"
                            >
                              {eRow.extension.name}
                            </Label>
                            <div class="flex w-18 justify-between">
                              <span class="text-gray-500">
                                {eRow.extension.versionName}
                              </span>
                              <span class="text-red-500">
                                {eRow.extension.isNsfw ? "+18" : ""}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div class="flex items-center gap-2">
                          {#if eRow.extension.hasUpdate && eRow.extension.isInstalled}
                            <Tooltip text="New update available!">
                              <Button
                                class="size-8 rounded-lg"
                                variant="info"
                                disabled={updatingExtension[
                                  eRow.extension.pkgName
                                ]}
                                onclick={async (e) => {
                                  e.stopPropagation();
                                  updatingExtension[eRow.extension.pkgName] =
                                    true;
                                  eRow.extension =
                                    await suwaManager.patchExtension(
                                      eRow.extension.pkgName,
                                      "update",
                                    );
                                  updatingExtension[eRow.extension.pkgName] =
                                    false;
                                }}
                              >
                                <Icon
                                  class={cn(
                                    updatingExtension[eRow.extension.pkgName] &&
                                      "animate-spin",
                                  )}
                                  icon="lucide:refresh-cw"
                                />
                              </Button>
                            </Tooltip>
                          {/if}
                          <Button
                            class="h-8 w-22 rounded-lg font-bold"
                            variant={eRow.extension.pkgName in
                            stateExtensionsActivated
                              ? stateExtensionsActivated[eRow.extension.pkgName]
                                ? "outline"
                                : "default"
                              : eRow.extension.isInstalled
                                ? "outline"
                                : "default"}
                            disabled={installingExtensions[
                              eRow.extension.pkgName
                            ]}
                            onclick={async (e) => {
                              e.stopPropagation();
                              if (showedGroup !== "hidden") {
                                eRow.extension.isInstalled =
                                  await toggleExtensionInstalled(
                                    eRow.extension,
                                  );
                              } else {
                                hiddenExtensions.value = {
                                  ...hiddenExtensions.value,
                                  [eRow.extension.pkgName]: false,
                                };
                              }
                            }}
                          >
                            {showedGroup !== "hidden"
                              ? eRow.extension.pkgName in
                                stateExtensionsActivated
                                ? stateExtensionsActivated[
                                    eRow.extension.pkgName
                                  ]
                                  ? "Uninstall"
                                  : "Install"
                                : installingExtensions[eRow.extension.pkgName]
                                  ? "..."
                                  : eRow.extension.isInstalled
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
                        if (hiddenExtensions.value[eRow.extension.pkgName]) {
                          hiddenExtensions.value = {
                            ...hiddenExtensions.value,
                            [eRow.extension.pkgName]: false,
                          };
                        } else {
                          hiddenExtensions.value = {
                            ...hiddenExtensions.value,
                            [eRow.extension.pkgName]: true,
                          };
                        }
                      }}
                    >
                      <Label>
                        {hiddenExtensions.value[eRow.extension.pkgName]
                          ? "Show"
                          : "Hide"} extension
                      </Label>
                      <Icon
                        icon={hiddenExtensions.value[eRow.extension.pkgName]
                          ? "lucide:eye"
                          : "lucide:eye-off"}
                      />
                    </ContextMenu.Item>
                  </ContextMenu.Content>
                </ContextMenu.Root>
              {:else}
                <ContextMenu.Root>
                  <ContextMenu.Trigger>
                    <Button
                      class="bg-secondary/70 group/extension hover:bg-secondary/40 m-0.5 flex h-8 w-110 items-center justify-between gap-2 rounded-lg p-2 hover:no-underline!"
                      variant="link"
                      onclick={() => {
                        if (unexpandedLangExtensions[eRow.lang]) {
                          unexpandedLangExtensions[eRow.lang] = false;
                        } else {
                          unexpandedLangExtensions[eRow.lang] = true;
                        }
                      }}
                    >
                      <div class="flex text-lg">
                        {getLangNative(eRow.lang)}
                      </div>
                      <div class="flex items-center gap-3">
                        <Tooltip
                          text="Hide language: {getLangNative(eRow.lang)}"
                        >
                          <Button
                            class="size-6"
                            variant="secondary"
                            onclick={(e) => {
                              e.stopPropagation();
                              allowedSourceLanguages.value = {
                                ...allowedSourceLanguages.value,
                                [eRow.lang]: false,
                              };
                            }}
                          >
                            <Icon icon="lucide:eye-off" />
                          </Button>
                        </Tooltip>
                        <Badge
                          class="pointer-events-none min-w-10 rounded-xl text-sm"
                          variant="outline"
                        >
                          <ScrollingValue value={eRow.count} />
                        </Badge>
                        <Icon
                          class={cn(
                            "size-5! transition-all duration-400",
                            unexpandedLangExtensions[eRow.lang] &&
                              "-rotate-180",
                          )}
                          icon="lucide:chevron-up"
                        />
                      </div>
                    </Button>
                  </ContextMenu.Trigger><ContextMenu.Content
                  ></ContextMenu.Content>
                </ContextMenu.Root>
              {/if}
            {/snippet}
          </VList>
        {/if}
      {:else}
        <div
          class="text-primary flex h-80 w-full flex-col items-center justify-center gap-7"
        >
          <span class="text-lg">
            {query !== ""
              ? "Nothing found... 67"
              : "You don't seem to have any " +
                (showedGroup === "all"
                  ? ""
                  : showedGroup === "installed"
                    ? extensionManagerTab.value === "sources"
                      ? "enabled"
                      : "installed"
                    : showedGroup === "noninstalled"
                      ? extensionManagerTab.value === "sources"
                        ? "disabled"
                        : "not installed"
                      : "hidden") +
                (extensionManagerTab.value === "sources"
                  ? " sources..."
                  : " extensions...")}
          </span>
          <span class="text-4xl">¯\_(ツ)_/¯</span>
        </div>
      {/if}
    </div>
  </Dialog.Content>
</Dialog.Root>
