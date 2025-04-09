<script lang="ts">
  import { AlertDialog } from "@/lib/components";

  let { open = $bindable(false), src } = $props();
</script>

<AlertDialog.Root bind:open>
  <AlertDialog.Content
    interactOutsideBehavior="close"
    class="max-w-full w-auto mx-auto flex justify-center"
  >
    <img class="h-[90vh] object-contain" {src} alt="a imag" />
  </AlertDialog.Content>
</AlertDialog.Root>
