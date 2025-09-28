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
    class="w-[80vw] h-[80vh] max-w-[40rem] max-h-[35rem] overflow-y-auto scrollbar-chapters"
  >
    <div class="flex gap-6 w-full select-none">
      <div class="flex items-center">
        <Image class="w-[28rem] object-contain" src="/employed-woojack.png" />
      </div>
      <div class="flex flex-col h-full justify-center gap-4 py-6">
        <div class="flex flex-col justify-center gap-2">
          <Label class="font-[minecraftia, sans] text-2xl">BIG W</Label>
          <Label class="text-md"
            >Well, I'll refactor the app. Enjoy the update!
          </Label>
          <Label class="text-md"
            >As ever, feel free to join my server, just click in the top menu:
            About > Discord :) <br /> I litteraly read everything there.
          </Label>
          <Label class="text-md">Patch notes for v{version}</Label>
        </div>
        <div class="flex flex-col gap-2">
          <Label class="text-lg">New features</Label>
          <Label class="list-disc list-item"
            >A INSANE GOOD SOURCE NOW! Atsumaru is really really well made</Label
          >
          <Label class="list-disc list-item"
            >YES, the home now has a purpose. You can click in the suggestions
            there and see more :O</Label
          >
          <Label class="list-disc list-item"
            >Add new functions in when right clicking a saved, like opening it
            on browser and copying other things</Label
          >
          <!--
          <Label class="list-disc list-item cursor-pointer" onclick={() => {}}
            >Feedback menu, you can send feedback directly from the app to
            Discord. Click here or at the top menu: About > Give feedback</Label
          >
          -->
          <Label class="text-lg">Fixed bugs</Label>
          <Label class="list-disc list-item"
            >Honestly, I might've fixed some things but i dont remember at all</Label
          >
        </div>
        <Label>Refactor coming soon</Label>
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>
