<script lang="ts">
  import { Dialog } from "@/lib/components";

  let { open = $bindable(false) } = $props();
</script>

<Dialog.Root bind:open>
  <Dialog.Content
    class="slide-out-to-left-0! slide-in-from-left-0! data-[state=closed]:slide-out-to-bottom-[800%] data-[state=open]:slide-in-from-bottom-[800%] data-[state=closed]:fade-out-100! data-[state=open]:fade-in-100!"
  >
    <Dialog.Header>
      <Dialog.Title>Search options</Dialog.Title>
      <Dialog.Description></Dialog.Description>
    </Dialog.Header>
  </Dialog.Content>
</Dialog.Root>
