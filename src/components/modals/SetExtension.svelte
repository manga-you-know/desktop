<script lang="ts">
  import { Badge, Button, Dialog, Label } from "@/lib/components";
  import { cn, getLang, prettifyRepo } from "@/lib/utils";
  import { openedExtension, suwayomiUrl } from "@/states";
  import { Image } from "@/components";
  import Icon from "@iconify/svelte";
  import { suwaManager } from "@/lib/helpers";

  let isInstalling = $state(false);
</script>

<Dialog.Root
  open={openedExtension.value !== null}
  onOpenChange={(open) => {
    if (!open) openedExtension.set(null);
  }}
>
  <Dialog.Content
    class="data-[state=closed]:slide-out-to-right-1/2 data-[state=open]:slide-in-from-right-1/2"
  >
    {#if openedExtension.value}
      <div class="flex flex-col gap-3">
        <Dialog.Title class="flex items-center gap-2 text-2xl">
          <Image
            class="size-16"
            src={suwayomiUrl.value + openedExtension.value.iconUrl}
          />
          {openedExtension.value.name}
        </Dialog.Title>
        <div class="flex w-full">
          <div
            class="flex w-1/2 flex-col items-center gap-2 **:py-1 **:text-lg/5"
          >
            <Badge class="flex w-full flex-col rounded-xl" variant="secondary">
              {getLang(openedExtension.value.lang)}
              <span class="text-sm! text-gray-400">Language</span>
            </Badge>
            <Badge class="flex w-full flex-col rounded-xl" variant="default">
              {prettifyRepo(openedExtension.value.repo)}
              <span class="text-sm! text-gray-500">Repository</span>
            </Badge>
            <div
              class={cn(
                "flex w-full gap-2",
                openedExtension.value.isNsfw && "pr-2",
              )}
            >
              <Badge
                class={cn(
                  "flex flex-col rounded-xl",
                  openedExtension.value.isNsfw ? "w-1/2" : "w-full",
                )}
                variant="outline"
              >
                {openedExtension.value.versionName}
                <span class="text-sm! text-gray-500">Version</span>
              </Badge>
              {#if openedExtension.value.isNsfw}
                <Badge
                  class="flex w-1/2 flex-col rounded-xl"
                  variant="destructive"
                >
                  +18
                  <span class="text-sm! text-gray-400">Age rating</span>
                </Badge>
              {/if}
            </div>
          </div>
          <div class="flex w-1/2 flex-col items-center gap-2">
            <Button
              class="h-10 w-28 rounded-lg font-bold"
              variant={isInstalling
                ? "outline"
                : openedExtension.value.isInstalled
                  ? "destructive"
                  : "default"}
              onclick={async () => {
                if (openedExtension.value === null) return;
                if (!openedExtension.value.isInstalled) {
                  isInstalling = true;
                }
                openedExtension.value.isInstalled =
                  await suwaManager.updateExtension(
                    openedExtension.value.pkgName,
                    !openedExtension.value.isInstalled,
                  );
                suwaManager.getExtensions();
                isInstalling = false;
              }}
            >
              <Icon
                icon={isInstalling
                  ? ""
                  : openedExtension.value.isInstalled
                    ? "lucide:trash"
                    : "lucide:download"}
              />
              {isInstalling
                ? "..."
                : openedExtension.value.isInstalled
                  ? "Remove"
                  : "Install"}
            </Button>
            <Button
              class="rounded-xl"
              variant="outline"
              disabled={!openedExtension.value.isInstalled}
            >
              <Icon icon="lucide:settings" /> Settings
            </Button>
          </div>
        </div>
        <div class="flex gap-1"></div>
      </div>
    {/if}
  </Dialog.Content>
</Dialog.Root>
