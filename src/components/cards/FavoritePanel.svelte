<script lang="ts">
  import { Tilt } from "svelte-ux";
  import { ContextMenu, Label } from "@/lib/components";
  import { PanelModal, AskSure } from "@/components";
  import { copyText, refreshPanels, copyImageFromPath } from "@/functions";
  import { remove } from "@tauri-apps/plugin-fs";
  import { cn } from "@/lib/utils";
  import Icon from "@iconify/svelte";

  let { src, path, shouldCopy = $bindable(false) } = $props();
  let open = $state(false);
  let contextOpen = $state(false);
  let deleteOpen = $state(false);
  let isDeleting = false;
</script>

<PanelModal bind:open bind:shouldCopy {src} {path} />
<AskSure
  bind:open={deleteOpen}
  message="This will delete this panel from your folder"
  onokay={async () => {
    if (isDeleting) return;
    isDeleting = true;
    await remove(path);
    await refreshPanels();
  }}
/>

<ContextMenu.Root bind:open={contextOpen}>
  <ContextMenu.Trigger class={cn("hover:z-10", contextOpen && "z-10")}>
    <Tilt
      class={cn(
        "h-[11rem] hover:scale-[1.546] no-blurry transition duration-500 [perspective:200px]",
        contextOpen && "!scale-[1.546]",
      )}
    >
      <button
        onclick={() => (open = true)}
        onmouseenter={() => (shouldCopy = true)}
        onmouseleave={() => (shouldCopy = false)}
      >
        <img
          class="!max-w-[16rem] h-[11rem] rounded-sm object-contain"
          {src}
          alt="favorite panel"
        />
      </button>
    </Tilt>
  </ContextMenu.Trigger>
  <ContextMenu.Content>
    <ContextMenu.Item
      class="flex justify-between"
      onclick={() => {
        copyText(path, "path");
      }}
    >
      <Label>Copy path</Label>
      <Icon class="!size-4" icon="tabler:folder" />
    </ContextMenu.Item>
    <ContextMenu.Item
      class="flex justify-between"
      onclick={() => {
        copyImageFromPath(path);
      }}
    >
      <Label>Copy image</Label>
      <Icon class="!size-4" icon="tabler:photo" />
    </ContextMenu.Item>
    <ContextMenu.Separator />
    <ContextMenu.Item
      class="flex justify-between hover:!bg-destructive transition-colors duration-300"
      onclick={() => {
        deleteOpen = true;
      }}
    >
      <Label>Delete</Label>
      <Icon class="!size-4" icon="lucide:trash" />
    </ContextMenu.Item>
  </ContextMenu.Content>
</ContextMenu.Root>
