<script lang="ts">
  import { copyImageFromPath, refreshPanels } from "@/functions";
  import { AlertDialog, Button } from "@/lib/components";
  import Icon from "@iconify/svelte";
  import { remove } from "@tauri-apps/plugin-fs";

  let { open = $bindable(false), src, path } = $props();

  function handleKeydown(event: KeyboardEvent) {
    if (event.key.toUpperCase() === "C" && (event.metaKey || event.ctrlKey)) {
      copyImageFromPath(path);
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />
<AlertDialog.Root bind:open onOpenChange={() => {}}>
  <AlertDialog.Content
    class="max-w-full w-auto mx-auto flex flex-col justify-center"
  >
    <img class="h-[85vh] object-contain" {src} alt="a imag" />
    <Button
      onclick={async () => {
        await remove(path);
        await refreshPanels();
        open = false;
      }}><Icon icon="lucide:trash" />Delete</Button
    >
  </AlertDialog.Content>
</AlertDialog.Root>
