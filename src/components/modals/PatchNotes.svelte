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
  <Dialog.Content class="max-w-[40rem]">
    <div class="flex gap-6 w-full select-none">
      <div class="flex items-center">
        <Image class="w-[88rem] object-contain" src="/employed-woojack.png" />
      </div>
      <div class="flex flex-col h-full justify-center gap-6 py-6">
        <div class="flex flex-col justify-center gap-2">
          <Label class="font-[minecraftia, sans] text-2xl">
            Fresh start! Comick is pretty good. Thanks for the developers and
            thank you all for giving feedback and a lot of stars. Almost
            receiving a achievement for 128 stars :)
          </Label>
          <Label class="text-md">
            As ever, feel free to join my server, just click in the top menu:
            About > Discord :)</Label
          >
          <Label class="text-md">Patch notes for v{version}</Label>
        </div>
        <div class="flex flex-col gap-2">
          <Label class="text-lg">New features</Label>
          <Label class="list-disc list-item">Add Comick as manga source</Label>
          <Label class="list-disc list-item"
            >Improve chapters modal and add things like Scan selector & filter
            repeated</Label
          >
          <Label class="list-disc list-item"
            >Add visual feedback in favorites to let you know there's something
            wrong with your source</Label
          >
          <Label class="list-disc list-item"
            >Right clicking on any input pastes the text in your copy area</Label
          >
          <!--
          <Label class="list-disc list-item cursor-pointer" onclick={() => {}}
            >Feedback menu, you can send feedback directly from the app to
            Discord. Click here or at the top menu: About > Give feedback</Label
          >
          -->
          <Label class="text-lg">Fixed bugs</Label>
          <Label class="list-disc list-item"
            >Ugly color when hovering in selector tab in settings</Label
          >
          <Label class="list-disc list-item"
            >macOS MAYBE is working. I did something.</Label
          >
        </div>
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>
