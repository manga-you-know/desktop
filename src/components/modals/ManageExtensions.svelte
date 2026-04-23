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

  let extensionQuery = $state("");
  let extensionGroup: "all" | "installed" | "noninstalled" | "blocked" =
    $state("installed");

  let installingExtensions: Record<string, boolean> = $state({});

  let filteredExtensions = $derived(
    extensionGroup.includes("blocked")
      ? suwayomi.blockedExtensions.filter((e) =>
          e.name.toLowerCase().includes(extensionQuery.toLowerCase()),
        )
      : ["noninstalled", "all"].includes(extensionGroup)
        ? suwayomi.extensions
            .filter(
              (e) =>
                e.name.toLowerCase().includes(extensionQuery.toLowerCase()) &&
                (extensionGroup === "all" ? true : !e.isInstalled) &&
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
                e.name.toLowerCase().includes(extensionQuery.toLowerCase()) &&
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

  let allowedOnly: string[] = $derived(
    Object.entries(allowedExtensionLanguages.value)
      .filter(([_, v]) => v)
      .map(([k, _]) => k),
  );
</script>

<Dialog.Root bind:open={openExtensions.active}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Manage extensions</Dialog.Title>
      <Dialog.Description>
        Select which extensions you want to install
      </Dialog.Description>
    </Dialog.Header>
    <div class="flex w-full flex-col justify-center gap-3">
      <div class="flex w-full justify-between gap-2">
        <Badge class="w-12 rounded-xl" variant="outline">
          {filteredExtensions.length}
        </Badge>
        <Input
          class="w-full rounded-xl"
          divClass="w-full"
          variant="outline"
          placeholder="Search for extensions..."
          bind:value={extensionQuery}
        />
        <Button
          class="flex min-w-24 justify-between rounded-xl font-bold"
          variant={showExtensionsNsfw.value ? "destructive" : "secondary"}
          disabled={extensionGroup === "blocked"}
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
            disabled={["installed", "blocked"].includes(extensionGroup)}
          >
            <Button
              class="rounded-xl"
              variant="secondary"
              disabled={["installed", "blocked"].includes(extensionGroup)}
            >
              <Icon icon="lucide:link" />
            </Button>
          </Popover.Trigger>
          <Popover.Content class="flex flex-col gap-2 p-2">
            <Label>Allowed repositories</Label>
            <div class="flex max-h-60 flex-col gap-2 overflow-scroll p-2">
              {#each suwayomi.extensionRepos as repo}
                <button
                  class="flex cursor-pointer items-center gap-3"
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
                      <Button
                        class="h-7 w-full cursor-default justify-start rounded-r-none"
                        variant="outline"
                      >
                        {repoInfo.value[repo].name}
                      </Button>
                      <Button
                        class="size-7 rounded-l-none"
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
                      variant="secondary"
                      readonly
                      value={removeOrigin(repo)}
                    />
                  {/if}
                </button>
              {/each}
            </div>
          </Popover.Content>
        </Popover.Root>
        <Popover.Root>
          <Popover.Trigger>
            <Tooltip
              text="{allowedOnly.length} allowed language{allowedOnly.length > 1
                ? 's'
                : ''}"
            >
              <Button class="rounded-xl">
                <Icon icon="lucide:languages" />
              </Button>
            </Tooltip>
          </Popover.Trigger>
          <Popover.Content class="flex flex-col gap-2 overflow-scroll p-2">
            <Label>Allowed languages: {allowedOnly.length}</Label>
            <div class="flex max-h-80 flex-col gap-2 overflow-scroll p-2">
              {#each sortedLangs as lang}
                <button
                  class="flex cursor-pointer items-center gap-1"
                  onclick={(e) => {
                    e.stopPropagation();
                    allowedExtensionLanguages.value = {
                      ...allowedExtensionLanguages.value,
                      [lang]: !allowedExtensionLanguages.value[lang],
                    };
                  }}
                  disabled={allowedOnly.length < 2 && allowedOnly[0] === lang}
                >
                  <Switch
                    checked={allowedExtensionLanguages.value[lang]}
                    disabled={allowedOnly.length < 2 && allowedOnly[0] === lang}
                  />
                  <Button
                    class="h-6 w-full justify-start rounded-xl"
                    variant="outline"
                    disabled={allowedOnly.length < 2 && allowedOnly[0] === lang}
                  >
                    {getLang(lang)}
                  </Button>
                </button>
              {/each}
            </div>
          </Popover.Content>
        </Popover.Root>
      </div>
      <div class="flex w-full">
        <Button
          class={cn(
            "w-full rounded-r-none rounded-b-none",
            extensionGroup === "installed" &&
              "border-b-transparent bg-transparent hover:bg-transparent",
          )}
          variant="outline"
          onclick={() => {
            extensionGroup = "installed";
          }}
        >
          Installed
          <Badge variant="secondary">
            {suwayomi.installedExtensions.length}
          </Badge>
        </Button>
        <Button
          class={cn(
            "w-full rounded-none",
            extensionGroup === "all" &&
              "border-b-transparent bg-transparent hover:bg-transparent",
          )}
          variant="outline"
          onclick={() => {
            extensionGroup = "all";
          }}
        >
          All
          <Badge variant="secondary">{suwayomi.extensions.length}</Badge>
        </Button>
        <Button
          class={cn(
            "w-full rounded-none",
            extensionGroup === "noninstalled" &&
              "border-b-transparent bg-transparent hover:bg-transparent",
          )}
          variant="outline"
          onclick={() => {
            extensionGroup = "noninstalled";
          }}
        >
          Not installed
          <Badge variant="secondary">
            {suwayomi.nonInstalledExtensions.length}
          </Badge>
        </Button>
        <Tooltip text="{suwayomi.blockedExtensions.length} blocked extensions">
          <Button
            class={cn(
              "w-12 rounded-l-none rounded-b-none",
              extensionGroup === "blocked" &&
                "border-b-transparent bg-transparent hover:bg-transparent",
            )}
            variant="outline"
            onclick={() => {
              extensionGroup = "blocked";
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
                      openedExtension.onchange = (ex) => {
                        if (ex === null) {
                          openExtensions.open();
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
                          if (extensionGroup !== "blocked") {
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
                        {extensionGroup !== "blocked"
                          ? installingExtensions[extension.pkgName]
                            ? "..."
                            : extension.isInstalled
                              ? "Remove"
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
            {extensionQuery !== ""
              ? "Nothing found... 67"
              : "You don't seem to have any " +
                (extensionGroup === "all"
                  ? ""
                  : extensionGroup === "installed"
                    ? "installed"
                    : extensionGroup === "noninstalled"
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
