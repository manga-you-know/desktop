<script lang="ts">
  import { Tilt } from "svelte-ux";
  import { ContextMenu, Label } from "@/lib/components";
  import { PanelModal, AskSure, Image } from "@/components";
  import { copyText, removePanel, copyImageFromPath } from "@/functions";
  import { cn } from "@/lib/utils";
  import Icon from "@iconify/svelte";

  let { path, title, chapter, shouldCopy = $bindable(false) } = $props();
  let open = $state(false);
  let contextOpen = $state(false);
  let deleteOpen = $state(false);
</script>

<PanelModal bind:open bind:shouldCopy {path} />
<AskSure
  bind:open={deleteOpen}
  message="This will delete this panel from your folder"
  onokay={async () => {
    removePanel(path);
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
        <Image
          class="!max-w-[16rem] h-[11rem] rounded-sm object-contain"
          src={path}
          alt="favorite panel"
        />
      </button>
    </Tilt>
  </ContextMenu.Trigger>
  <ContextMenu.Content>
    <Label
      class="bg-secondary/50 rounded-lg flex mb-0.5 p-[0.3rem] justify-start w-full select-none"
      >Copy</Label
    >
    <ContextMenu.Item
      class="flex justify-between"
      onclick={() => {
        copyImageFromPath(path);
      }}
    >
      <Label>Image</Label>
      <Icon class="!size-4" icon="tabler:photo" />
    </ContextMenu.Item>
    <ContextMenu.Item
      class="flex justify-between"
      onclick={() => {
        copyText(chapter, "chapter");
      }}
    >
      <Label>Chapter</Label>
      <Label class="!text-gray-300">{chapter}</Label>
    </ContextMenu.Item>

    <ContextMenu.Item
      class="flex justify-between"
      onclick={() => {
        copyText(title, "title");
      }}
    >
      <Label>Title</Label>
      <Icon class="!size-4" icon="tabler:text-size" />
    </ContextMenu.Item>
    <ContextMenu.Item
      class="flex justify-between"
      onclick={() => {
        copyText(path, "path");
      }}
    >
      <Label>Path</Label>
      <Icon class="!size-4" icon="tabler:folder" />
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
