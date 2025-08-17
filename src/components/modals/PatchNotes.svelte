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
    <div class="flex gap-4 w-full select-none">
      <Image src="/woojack-uau.png" />
      <div class="flex flex-col h-full justify-center gap-6 py-6">
        <div class="flex flex-col justify-center gap-2">
          <Label class="font-[minecraftia, sans] text-2xl">
            Hey, YOU! Thank you for using MangaYouKnow. I didn't expect things
            to get this big.
          </Label>
          <Label class="text-md">
            BTW, feel free to join my server, just click in the top menu: About
            > Discord :)</Label
          >
          <Label class="text-md"
            >Here you'll get a patch notes on this update, v{version}</Label
          >
        </div>
        <div class="flex flex-col gap-2">
          <Label class="text-lg">New features</Label>
          <Label class="list-disc list-item"
            >Patch notes. You can open it at the top menu: About > Patch Notes</Label
          >
          <Label class="list-disc list-item"
            >Custom download path. Now you can set in settings which place you
            want to download your mangas</Label
          >
          <!--
          <Label class="list-disc list-item cursor-pointer" onclick={() => {}}
            >Feedback menu, you can send feedback directly from the app to
            Discord. Click here or at the top menu: About > Give feedback</Label
          >
          -->
          <Label class="text-lg">Fixed bugs</Label>
          <Label class="list-disc list-item">Scroll not working on reader</Label
          >
          <Label class="list-disc list-item"
            >Read modal opening in the wrong language, instead of the default
            already set in configs</Label
          >
          <Label class="list-disc list-item"
            >WeebCentral not fetching chapters & Taosect getting non existent
            chapters</Label
          >
        </div>
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>
