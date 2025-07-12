<script lang="ts">
  import Icon from "@iconify/svelte";
  import { open as openPath } from "@tauri-apps/plugin-shell";
  import { AlertDialog, Button } from "@/lib/components";
  import { openUpdate, updateInfo, openSettings } from "@/store";
  import { cn } from "@/lib/utils"

  let isUpdating = $state(false);
</script>

<AlertDialog.Root bind:open={$openUpdate}>
  <AlertDialog.Content overlayClass={cn($openSettings && "bg-black/40")}>
    {#if $updateInfo.updateAvailable}
      <AlertDialog.Header>
        <AlertDialog.Title>New update avaible!</AlertDialog.Title>
        <AlertDialog.Description>
          This will update to
          <span class="font-bold"> v{$updateInfo.version} </span>. Read about
          the new version
          <button onclick={() => openPath($updateInfo.url)} class="underline"
            >here
          </button>.
        </AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Footer>
        <Button
          variant="secondary"
          class="bg-blue-500 text-white hover:bg-blue-300 hover:text-gray-700"
          effect="gooeyLeft"
          disabled={isUpdating}
          onclick={async () => {
            isUpdating = true;
            await $updateInfo.fetchUpdate();
            openUpdate.set(false);
            isUpdating = false;
          }}
        >
          <Icon
            icon={isUpdating
              ? "line-md:loading-twotone-loop"
              : "ic:twotone-browser-updated"}
          />
          Update
        </Button>
        <AlertDialog.Cancel disabled={isUpdating} class="dark:text-white">
          Cancel
        </AlertDialog.Cancel>
      </AlertDialog.Footer>
    {:else}
      <AlertDialog.Header>
        <AlertDialog.Title>No update avaible.</AlertDialog.Title>
        <AlertDialog.Description>
          You are already on the latest version.
        </AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Footer>
        <AlertDialog.Cancel class="dark:text-white">Got it!</AlertDialog.Cancel>
      </AlertDialog.Footer>
    {/if}
  </AlertDialog.Content>
</AlertDialog.Root>
