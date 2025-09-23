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
  <Dialog.Content class="max-w-[40rem] max-h-[60rem]">
    <div class="flex gap-6 w-full select-none">
      <div class="flex items-center">
        <Image class="w-[28rem] object-contain" src="/dark-woojack.png" />
      </div>
      <div class="flex flex-col h-full justify-center gap-6 py-6">
        <div class="flex flex-col justify-center gap-2">
          <Label class="font-[minecraftia, sans] text-2xl"
            >Press F for Comick :(
          </Label>
          <Label class="text-md"
            >I think everyday about rewriting the app with a proper structure
            asyncd much less bugs and much more performance. it can happen
          </Label>
          <Label class="text-md"
            >As ever, feel free to join my server, just click in the top menu:
            About > Discord :)</Label
          >
          <Label class="text-md">Patch notes for v{version}</Label>
        </div>
        <div class="flex flex-col gap-2">
          <Label class="text-lg">New features</Label>
          <Label class="list-disc list-item"
            >To ammend losing Comick, I've fixed WeebCentral (even though they
            probably block me again) and added MangaPark. which is not so
            reliable but looks good</Label
          >
          <Label class="list-disc list-item"
            >Progress bar to show how much you read of the currently chapter in
            taskbar. looks sick :)</Label
          >
          <Label class="list-disc list-item"
            >Top search now works in reader and you still have your title</Label
          >
          <Label class="list-disc list-item"
            >Make the app more responsible since there's some freak using it on
            a **TV**</Label
          >
          <!--
          <Label class="list-disc list-item cursor-pointer" onclick={() => {}}
            >Feedback menu, you can send feedback directly from the app to
            Discord. Click here or at the top menu: About > Give feedback</Label
          >
          -->
          <Label class="text-lg">Fixed bugs</Label>
          <Label class="list-disc list-item">Several bugs in UI</Label>
          <Label class="list-disc list-item"
            >I probably added some but lets be cool about that!!!</Label
          >
        </div>
        <Label>Brick by brickkkkkk</Label>
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>
