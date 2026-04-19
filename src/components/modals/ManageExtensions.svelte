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
    blockedExtensions,
    openExtensions,
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
  import { cn } from "@/lib/utils";

  let extensionQuery = $state("");
  let extensionGroup: "all" | "installed" | "noninstalled" | "blocked" =
    $state("all");

  let availableLangs: string[] = $derived(
    Array.from(new Set(suwayomi.extensions.map((e) => e.lang))),
  );

  let filteredExtensions = $derived(
    extensionGroup.includes("blocked")
      ? suwayomi.blockedExtensions.filter((e) =>
          e.name.toLowerCase().includes(extensionQuery.toLowerCase()),
        )
      : ["noninstalled", "all"].includes(extensionGroup)
        ? suwayomi.extensions.filter(
            (e) =>
              e.name.toLowerCase().includes(extensionQuery.toLowerCase()) &&
              (extensionGroup === "all" ? true : !e.isInstalled),
          )
        : suwayomi.installedExtensions.filter(
            (e) =>
              e.name.toLowerCase().includes(extensionQuery.toLowerCase()) &&
              (showExtensionsNsfw.value ? true : !e.isNsfw),
          ),
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
        <Input
          class="w-full rounded-xl"
          divClass="w-full"
          variant="outline"
          placeholder="Search for extensions..."
          bind:value={extensionQuery}
        />
        <Button
          class="flex min-w-24 justify-between rounded-xl font-bold"
          variant={showExtensionsNsfw.value ? "destructive" : "outline"}
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
            <Label>Active repositories</Label>
            {#each suwayomi.extensionRepos as repo}
              <button
                class="flex cursor-pointer items-center gap-3"
                onclick={(e) => {
                  e.stopPropagation();
                  if (
                    activeExtensionRepos.value.includes(repo) &&
                    activeExtensionRepos.value.length > 1
                  ) {
                    activeExtensionRepos.value =
                      activeExtensionRepos.value.filter((r) => r !== repo);
                  } else {
                    activeExtensionRepos.value = [
                      ...activeExtensionRepos.value,
                      repo,
                    ];
                  }
                }}
              >
                <Switch
                  checked={activeExtensionRepos.value.includes(repo)}
                  disabled={activeExtensionRepos.value.includes(repo) &&
                    activeExtensionRepos.value.length < 2}
                />
                <Input
                  class="h-7 rounded-lg"
                  variant="secondary"
                  readonly
                  value={repo}
                />
              </button>
            {/each}
          </Popover.Content>
        </Popover.Root>
        <Button class="rounded-xl">
          <Icon icon="lucide:languages" />
        </Button>
      </div>
      <div class="flex w-full">
        <Button
          class={cn(
            "w-full rounded-r-none rounded-b-none",
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
              <ContextMenu.Trigger {onmouseleave}>
                <Button
                  class="bg-background group/extension hover:bg-secondary/40 m-0.5 flex h-12 w-110 items-center justify-between gap-2 rounded-xl p-2 hover:no-underline!"
                  variant="link"
                >
                  <div class="flex items-center gap-2">
                    <Image
                      class="size-10"
                      src={suwayomiUrl.value + extension.iconUrl}
                    />
                    <div
                      class="gap-0.1 flex flex-col items-start justify-center"
                    >
                      <Label
                        class="cursor-pointer text-lg group-hover/extension:underline!"
                      >
                        {extension.name}
                      </Label>
                      <div class="* flex w-18 justify-between">
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
                      variant={extension.isInstalled ? "outline" : "default"}
                      onclick={async (e) => {
                        e.stopPropagation();
                        if (extensionGroup !== "blocked") {
                          extension.isInstalled =
                            await suwaManager.updateExtension(
                              extension.pkgName,
                              !extension.isInstalled,
                            );
                        } else {
                          blockedExtensions.value = {
                            ...blockedExtensions.value,
                            [extension.pkgName]: false,
                          };
                        }
                      }}
                    >
                      {extensionGroup !== "blocked"
                        ? extension.isInstalled
                          ? "Remove"
                          : "Install"
                        : "Show"}
                    </Button>
                  </div>
                </Button>
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
