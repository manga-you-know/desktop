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
        <Image class="w-[28rem] object-contain" src="/chill-woojack.png" />
      </div>
      <div class="flex flex-col h-full justify-center gap-6 py-6">
        <div class="flex flex-col justify-center gap-2">
          <Label class="font-[minecraftia, sans] text-2xl"
            >Mid update, but good.</Label
          >
          <Label class="text-md">
            As ever, feel free to join my server, just click in the top menu:
            About > Discord :)</Label
          >
          <Label class="text-md">Patch notes for v{version}</Label>
        </div>
        <div class="flex flex-col gap-2">
          <Label class="text-lg">New features</Label>
          <Label class="list-disc list-item"
            >Top search: searchs everywhere, including your library</Label
          >
          <Label class="list-disc list-item"
            >Selected sources: now you can toggle sources you don't want
            searching, it helps improving performance in the top search</Label
          >
          <!--
          <Label class="list-disc list-item cursor-pointer" onclick={() => {}}
            >Feedback menu, you can send feedback directly from the app to
            Discord. Click here or at the top menu: About > Give feedback</Label
          >
          -->
          <Label class="text-lg">Fixed bugs</Label>
          <Label class="list-disc list-item"
            >Chapters from other saveds taking wrong place in modal</Label
          >
          <Label class="list-disc list-item"
            >Comick images not loading sometimes</Label
          >
          <Label class="list-disc list-item"
            >Toggling favorite going wrong in a lot of places</Label
          >
        </div>
        <Label>Not as big as I wanted, but a brick by brick we get there.</Label
        >
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>
