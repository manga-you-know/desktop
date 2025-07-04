<script lang="ts">
  import { AskSure, Select } from "@/components";
  import { copyImageFromPath, copyText, refreshPanels } from "@/functions";
  import { AlertDialog, Button } from "@/lib/components";
  import { cn } from "@/lib/utils";
  import { customTitlebar } from "@/store";
  import Icon from "@iconify/svelte";
  import { remove } from "@tauri-apps/plugin-fs";

  let {
    open = $bindable(false),
    src,
    path,
    shouldCopy = $bindable(false),
  } = $props();

  let copyMode: "image" | "path" = $state("image");
  let modes = ["image", "path"];
  let icons = {
    image: "ic:baseline-photo-library",
    path: "ic:baseline-folder-copy",
  };
  let openDelete = $state(false);
</script>

<AlertDialog.Root bind:open onOpenChange={(value) => (shouldCopy = value)}>
  <AlertDialog.Content
    class={cn(
      "max-w-[90vw] w-auto h-[92vh] mx-auto flex flex-col justify-center",
      $customTitlebar && "mt-5"
    )}
  >
    <img
      class="h-[82vh] max-h-[82vh] max-w-[80vw] object-contain rounded-xl"
      {src}
      alt="a imag"
    />
    <div class="flex justify-center gap-2">
      <Button
        class="w-[40%]"
        variant="destructive"
        onclick={() => {
          openDelete = true;
        }}
      >
        <Icon icon="lucide:trash" />Delete
      </Button>
      <div class="w-[60%] inline-flex">
        <Select
          class="min-w-24 w-[40%] rounded-r-none"
          variant="outline"
          bind:selected={copyMode}
          items={modes}
          {icons}
        />
        <Button
          class="w-[60%] rounded-l-none"
          onclick={async () => {
            copyMode === "image"
              ? await copyImageFromPath(path)
              : await copyText(path, "Path");
          }}
        >
          Copy <Icon icon="ic:baseline-content-copy" />
        </Button>
      </div>
    </div>
  </AlertDialog.Content>
  <AskSure
    bind:open={openDelete}
    message={"This will delete this panel from your folder."}
    overlayClass="bg-black/40"
    onokay={async () => {
      await remove(path);
      await refreshPanels();
      open = false;
    }}
  />
</AlertDialog.Root>
