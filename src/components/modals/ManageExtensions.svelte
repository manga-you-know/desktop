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
    blockedExtensions,
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

  let query = $state("");
  let tab: "sources" | "extensions" = $state(
    suwayomi.installedExtensions.length > 0 ? "sources" : "extensions",
  );
  let showedGroup: "all" | "installed" | "noninstalled" | "blocked" =
    $state("installed");

  let installingExtensions: Record<string, boolean> = $state({});

  let filteredExtensions = $derived(
    showedGroup.includes("blocked")
      ? suwayomi.blockedExtensions.filter((e) =>
          e.name.toLowerCase().includes(query.toLowerCase()),
        )
      : ["noninstalled", "all"].includes(showedGroup)
        ? suwayomi.extensions
            .filter(
              (e) =>
                e.name.toLowerCase().includes(query.toLowerCase()) &&
                (showedGroup === "all" ? true : !e.isInstalled) &&
                allowedExtensionLanguages.value[e.lang],
            )
            .sort((a, b) => {
              const aName = getLang(a.lang);
              const bName = getLang(b.lang);
              return aName.localeCompare(bName, "en", { sensitivity: "base" });
            })
        : suwayomi.installedExtensions
            .filter(
              (e) =>
                e.name.toLowerCase().includes(query.toLowerCase()) &&
                (showExtensionsNsfw.value ? true : !e.isNsfw) &&
                allowedExtensionLanguages.value[e.lang],
            )
            .sort((a, b) => {
              const aName = getLang(a.lang);
              const bName = getLang(b.lang);
              return aName.localeCompare(bName, "en", { sensitivity: "base" });
            }),
  );

  let sortedLangs = $derived(
    suwayomi.availableLangs.sort((a, b) => {
      const aAllowed = allowedExtensionLanguages.value[a] ? 1 : 0;
      const bAllowed = allowedExtensionLanguages.value[b] ? 1 : 0;
      if (aAllowed !== bAllowed) return bAllowed - aAllowed;
      const aName = IsoLanguages[a]?.nativeName ?? a;
      const bName = IsoLanguages[b]?.nativeName ?? b;
      return aName.localeCompare(bName, "en", { sensitivity: "base" });
    }),
  );

  let allowedLanguages: string[] = $derived(
    Object.entries(allowedExtensionLanguages.value)
      .filter(([_, v]) => v)
      .map(([k, _]) => k),
  );
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
        Select which {tab} you want to install
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
          {filteredExtensions.length}
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
          disabled={showedGroup === "blocked"}
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
            disabled={["installed", "blocked"].includes(showedGroup)}
          >
            <Button
              class="rounded-xl"
              variant="secondary"
              disabled={["installed", "blocked"].includes(showedGroup)}
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
                  class="cursor-pointer items-center justify-between gap-3 px-2"
                  variant="outline"
                  onclick={(e) => {
                    e.stopPropagation();
                    const sanitizedRepo = getBasePath(repo);
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
                      <Button class="h-7 w-full justify-start" variant="ghost">
                        {repoInfo.value[repo].name}
                      </Button>
                      <Button
                        class="hover:bg-background/70 size-7 rounded-xl"
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
                  for (const lang of suwayomi.availableLangs) {
                    data[lang] = true;
                  }
                  allowedExtensionLanguages.value = data;
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
                    allowedExtensionLanguages.value = {
                      ...allowedExtensionLanguages.value,
                      [lang]: !allowedExtensionLanguages.value[lang],
                    };
                  }}
                  disabled={allowedLanguages.length < 2 &&
                    allowedLanguages[0] === lang}
                >
                  <Switch
                    checked={allowedExtensionLanguages.value[lang]}
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
          {tab === "sources" ? "Active" : "Installed"}
          <Badge variant="secondary">
            {suwayomi.installedExtensions.length}
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
            {suwayomi.nonInstalledExtensions.length}
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
          <Badge variant="secondary">{suwayomi.extensions.length}</Badge>
        </Button>
        <Tooltip text="{suwayomi.blockedExtensions.length} hided extensions">
          <Button
            class={cn(
              "w-12 rounded-l-none rounded-b-none",
              showedGroup === "blocked" &&
                "border-b-transparent bg-transparent hover:bg-transparent",
            )}
            variant="outline"
            onclick={() => {
              showedGroup = "blocked";
            }}
          >
            <Icon icon="lucide:eye-off" />
            <!-- <Badge variant="secondary" -->
            <!--   >{suwayomi.blockedExtensionList.length}</Badge -->
            <!-- > -->
          </Button>
        </Tooltip>
      </div>
      {#if filteredExtensions.length > 0}
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
                          if (showedGroup !== "blocked") {
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
                            blockedExtensions.value = {
                              ...blockedExtensions.value,
                              [extension.pkgName]: false,
                            };
                          }
                        }}
                      >
                        {showedGroup !== "blocked"
                          ? installingExtensions[extension.pkgName]
                            ? "..."
                            : extension.isInstalled
                              ? "Uninstall"
                              : "Install"
                          : "Show"}
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
                    if (blockedExtensions.value[extension.pkgName]) {
                      blockedExtensions.value = {
                        ...blockedExtensions.value,
                        [extension.pkgName]: false,
                      };
                    } else {
                      blockedExtensions.value = {
                        ...blockedExtensions.value,
                        [extension.pkgName]: true,
                      };
                    }
                  }}
                >
                  <Label>
                    {blockedExtensions.value[extension.pkgName]
                      ? "Show"
                      : "Hide"} extension
                  </Label>
                  <Icon
                    icon={blockedExtensions.value[extension.pkgName]
                      ? "lucide:eye"
                      : "lucide:eye-off"}
                  />
                </ContextMenu.Item>
              </ContextMenu.Content>
            </ContextMenu.Root>
            <!-- {/if} -->
          {/snippet}
        </VList>
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
                    ? "installed"
                    : showedGroup === "noninstalled"
                      ? "not installed"
                      : "blocked") +
                " extensions..."}
          </span>
          <span class="text-4xl">¯\_(ツ)_/¯</span>
        </div>
      {/if}
    </div>
  </Dialog.Content>
</Dialog.Root>
