<script lang="ts">
  import { Badge, Button } from "@/lib/components";
  import { openExtensions, suwayomi } from "@/states";
  import Icon from "@iconify/svelte";
</script>

<div class="justify-around-stretch flex flex-col">
  <div class="flex items-center justify-center gap-2">
    <Badge class="h-10 w-55! justify-center gap-0.5 text-sm" variant="outline">
      {suwayomi.installedExtensions.length} installed extensions
    </Badge>

    <Button variant="outline" onclick={openExtensions.open}>
      <Icon icon="lucide:puzzle" />
      Manage extensions
    </Button>
  </div>
</div>
