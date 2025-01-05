<script lang="ts">
  import { getVersion } from "@tauri-apps/api/app";
  import { checkForAppUpdates } from "@/functions";
  import {
    Card,
    Label,
    Button,
    Dialog,
    Input,
    Separator,
    Select,
    ScrollArea,
    Checkbox,
  } from "@/lib/components";
  import {
    openSettings,
    autoSearchUpdates,
    autoEnterFullscreen,
    favoriteLanguage,
  } from "@/store";
  import { onMount } from "svelte";
  import { saveSettings } from "@/functions";
  import { Language } from "@/components";
  import type { Language as LanguageType } from "@/interfaces";
  import Icon from "@iconify/svelte";
  import { LANGUAGE_OPTIONS } from "@/constants";

  let isSearchingUpdates = $state(false);
  let version = $state("");
  onMount(async () => {
    version = await getVersion();
  });
</script>

<Dialog.Root bind:open={$openSettings}>
  <Dialog.Content interactOutsideBehavior="close">
    <!-- <Dialog.Header class="font-bold">Settings</Dialog.Header> -->
    <ScrollArea class="select-none">
      <div class="border-b-4 my-4 text-center relative rounded-xl">
        <span
          class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-black px-4 text-gray-300 font-bold"
        >
          Version
        </span>
      </div>
      <Card.Root class="bg-[#0e141e] border-0">
        <Card.Content class="flex flex-col gap-4">
          <Label
            >Current version: <span class="font-bold">
              v{version}
            </span></Label
          >
          <div class="flex">
            <Checkbox
              id="auto-update"
              bind:checked={$autoSearchUpdates}
              class="flex-shrink-0 mr-2"
              onCheckedChange={async () => {
                await saveSettings();
              }}
            />
            <Label class="cursor-pointer" for="auto-update"
              >Auto check for updates</Label
            >
          </div>
          <Button
            class="w-44 bg-[#2d3649] "
            variant="ghost"
            disabled={isSearchingUpdates}
            onclick={async () => {
              isSearchingUpdates = true;
              await checkForAppUpdates(true);
              isSearchingUpdates = false;
            }}
          >
            <Icon
              icon={isSearchingUpdates
                ? "line-md:loading-twotone-loop"
                : "lucide:search"}
              class="w-5 h-5"
            />
            Search for updates
          </Button>
        </Card.Content>
      </Card.Root>
      <div class="border-b-4 my-4 text-center relative rounded-xl">
        <span
          class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-black px-4 text-gray-300 font-bold"
        >
          Reader
        </span>
      </div>
      <Card.Root class="bg-[#0e141e] border-0">
        <Card.Content class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <Label>Favorite language</Label>
            <Language
              class="bg-[#2d3649] border-0"
              classPopover="!bg-gray-900"
              bind:selectedLanguage={$favoriteLanguage}
              onChange={async () => {
                await saveSettings();
              }}
              languageOptions={LANGUAGE_OPTIONS}
            />
          </div>
          <div class="flex">
            <Checkbox
              id="auto-fullscreen"
              bind:checked={$autoEnterFullscreen}
              class="flex-shrink-0 mr-2"
              onCheckedChange={async () => {
                await saveSettings();
              }}
            />
            <Label class="cursor-pointer" for="auto-fullscreen"
              >Auto enter in fullscreen</Label
            >
          </div>
        </Card.Content>
      </Card.Root>
    </ScrollArea>
    <Dialog.Footer></Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
