<script lang="ts">
  import { Badge, Button, Dialog, Input, Label } from "@/lib/components";
  import { suwaManager } from "@/lib/helpers";
  import { openExtensions, suwayomi, suwayomiUrl } from "@/states";
  import { Image } from "@/components";
  import { delay } from "@/utils";
  import Icon from "@iconify/svelte";
  import { readText } from "@tauri-apps/plugin-clipboard-manager";
  import { fade } from "svelte/transition";
  import { VList } from "virtua/svelte";
  import { cn } from "@/lib/utils";

  let extensionQuery = $state("");
  let extensionGroup: "all" | "installed" | "noninstalled" = $state("all");

  let filteredExtensions = $derived(
    suwayomi.extensions.filter(
      (e) =>
        e.name.toLowerCase().includes(extensionQuery.toLowerCase()) &&
        (extensionGroup === "all"
          ? true
          : extensionGroup === "installed"
            ? e.isInstalled
            : !e.isInstalled),
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
      <div></div>
      <Input
        class="w-full"
        divClass="w-full"
        variant="outline"
        placeholder="Search for extensions..."
        bind:value={extensionQuery}
      />
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
          <Badge variant="secondary"
            >{suwayomi.installedExtensions.length}</Badge
          >
        </Button>
        <Button
          class={cn(
            "w-full rounded-l-none rounded-b-none",
            extensionGroup === "noninstalled" &&
              "border-b-transparent bg-transparent hover:bg-transparent",
          )}
          variant="outline"
          onclick={() => {
            extensionGroup = "noninstalled";
          }}
        >
          Not installed
          <Badge variant="secondary"
            >{suwayomi.nonInstalledExtensions.length}</Badge
          >
        </Button>
      </div>
      {#if filteredExtensions.length > 0}
        <VList
          class="scrollbar-chapters h-90! gap-2 overflow-x-hidden scroll-smooth pr-2"
          data={filteredExtensions}
          getKey={(_, i) => i}
          tabindex={-1}
        >
          {#snippet children(extension, _)}
            <Button
              class="bg-background group/extension hover:bg-secondary/40 m-0.5 flex h-12 w-110 items-center justify-between gap-2 rounded-xl p-2 hover:no-underline!"
              variant="link"
            >
              <div class="flex items-center gap-2">
                <Image
                  class="size-10"
                  src={suwayomiUrl.value + extension.iconUrl}
                />
                <div class="gap-0.1 flex flex-col items-start justify-center">
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
                  class="h-8 w-26 rounded-lg font-bold"
                  variant={extension.isInstalled ? "outline" : "default"}
                  onclick={async (e) => {
                    e.stopPropagation();
                    extension.isInstalled = await suwaManager.updateExtension(
                      extension.pkgName,
                      !extension.isInstalled,
                    );
                  }}
                >
                  {extension.isInstalled ? "Remove" : "Install"}
                </Button>
              </div>
            </Button>
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
              : "You don't seem to have any extensions " +
                (extensionGroup === "all"
                  ? "at all"
                  : extensionGroup === "installed"
                    ? "installed"
                    : "not installed") +
                "..."}
          </span>
          <span class="text-4xl">¯\_(ツ)_/¯</span>
        </div>
      {/if}
    </div>
  </Dialog.Content>
</Dialog.Root>
