<script lang="ts">
  import { Dialog, Label } from "@/lib/components";
  import { Image } from "@/components";
  import { openPatchNotes } from "@/store";
  import { onMount } from "svelte";
  import { getVersion } from "@tauri-apps/api/app";

  let version = $state("");

  onMount(async () => {
    version = await getVersion();
  });
</script>

<Dialog.Root bind:open={$openPatchNotes}>
  <Dialog.Content
    class="w-[80vw] h-[80vh] max-w-160 max-h-140 overflow-y-auto scrollbar-chapters"
  >
    <div class="flex gap-6 w-full select-none">
      <div class="flex items-center">
        <Image class="w-md object-contain" src="/woojack-uau.png" />
      </div>
      <div
        class="flex flex-col h-full jhttps://x.com/EduardoAraoR/status/1971726361091027311ustify-center gap-4 py-6"
      >
        <div class="flex flex-col justify-center gap-2">
          <Label class="font-[minecraftia, sans] text-2xl"
            >Small Small update</Label
          >
          <Label class="text-md">Well, NOW I'll refactor the app.</Label>
          <Label class="text-md"
            >As ever, feel free to join my server, just click in the top menu:
            About > Discord :) <br /> I litteraly read everything there.
          </Label>
          <Label class="text-md">Patch notes for v{version}</Label>
        </div>
        <div class="flex flex-col gap-2">
          <Label class="text-lg">New features</Label>
          <Label class="list-disc list-item">There is no new feature tho</Label>
          <!--
          <Label class="list-disc list-item cursor-pointer" onclick={() => {}}
            >Feedback menu, you can send feedback directly from the app to
            Discord. Click here or at the top menu: About > Give feedback</Label
          >
          -->
          <Label class="text-lg">Fixed bugs</Label>
          <Label class="list-disc list-item"
            >Opening mangas in suggestion modal</Label
          >
          <Label class="list-disc list-item"
            >Source being Comick as default (it doesn't exists anymore)</Label
          >
          <Label class="list-disc list-item"
            >Atsumaru not searching by author</Label
          >
          <Label class="list-disc list-item"
            >Favorites pagination showing the wrong count of pages when "To
            read" was active</Label
          >
        </div>
        <Label>Refactor coming soooooooooooooooooon</Label>
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>
