<script lang="ts">
  import { Button, Dialog, Input } from "@/lib/components";
  import { suwaManager } from "@/lib/helpers";
  import { openExtensions, suwayomi } from "@/states";
  import { delay } from "@/utils";
  import Icon from "@iconify/svelte";
  import { readText } from "@tauri-apps/plugin-clipboard-manager";
</script>

<Dialog.Root bind:open={openExtensions.active}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Add extension repository</Dialog.Title>
      <Dialog.Description>
        Having problems finding a repo? Just search Mihon extensions :)
      </Dialog.Description>
    </Dialog.Header>
    <div class="flex gap-1"></div></Dialog.Content
  >
</Dialog.Root>
