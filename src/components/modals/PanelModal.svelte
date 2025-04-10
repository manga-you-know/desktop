<script lang="ts">
  import { copyImageFromPath } from "@/functions";
  import { AlertDialog } from "@/lib/components";

  let { open = $bindable(false), src, path } = $props();

  function handleKeydown(event: KeyboardEvent) {
    if (event.key.toUpperCase() === "C" && (event.metaKey || event.ctrlKey)) {
      copyImageFromPath(path);
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />
<AlertDialog.Root bind:open>
  <AlertDialog.Content
    interactOutsideBehavior="close"
    class="max-w-full w-auto mx-auto flex justify-center"
  >
    <img class="h-[85vh] object-contain" {src} alt="a imag" />
  </AlertDialog.Content>
</AlertDialog.Root>
