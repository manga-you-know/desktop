<script lang="ts">
  import {
    AlertDialog,
    Button,
    Input,
    ScrollArea,
    Separator,
  } from "@/lib/components";
  import { openAdd } from "@/store";
  import { CustomType } from "@/components";
</script>

<AlertDialog.Root bind:open={$openAdd}>
  <AlertDialog.Content interactOutsideBehavior="close">
    <div class="h-24">
      <CustomType />
    </div>
  </AlertDialog.Content>
</AlertDialog.Root>
