<script lang="ts">
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { Button, Label } from "@/lib/components";
  import Icon from "@iconify/svelte";

  const window = getCurrentWindow();
</script>

<div
  class="min-h-8 max-h-8 flex justify-between bg-[#18181b]"
  data-tauri-drag-region
>
  <div class="h-full flex items-center ml-14 select-none">
    <img src="/icon.png" alt="logo" class="h-6" data-tauri-drag-region />
    <Label class="p-3" data-tauri-drag-region>MangaYouKnow</Label>
  </div>
  <div class="inline-flex p-0.5">
    <Button class="h-7" variant="ghost" onclick={() => window.minimize()}>
      <Icon icon="lucide:minus" />
    </Button>
    <Button
      class="h-7"
      variant="ghost"
      onclick={async () => {
        if (await window.isMaximized()) {
          await window.unmaximize();
        } else {
          await window.maximize();
        }
      }}
    >
      <Icon icon="lucide:square" />
    </Button>
    <Button class="h-7" variant="ghost" onclick={() => window.close()}>
      <Icon icon="lucide:x" />
    </Button>
  </div>
</div>
