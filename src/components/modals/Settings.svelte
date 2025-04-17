<script lang="ts">
  import { getVersion } from "@tauri-apps/api/app";
  import { enable, isEnabled, disable } from "@tauri-apps/plugin-autostart";
  import { load, Store } from "@tauri-apps/plugin-store";
  import {
    checkForAppUpdates,
    saveSettings,
    stopDiscordPresence,
    setDiscordActivity,
  } from "@/functions";
  import {
    Card,
    Label,
    Button,
    AlertDialog,
    Input,
    Separator,
    Select,
    ScrollArea,
    Checkbox,
    Switch,
  } from "@/lib/components";
  import {
    openSettings,
    autoSearchUpdates,
    autoEnterFullscreen,
    preferableLanguage,
    lastPage,
    useMpv,
    openSearch,
    closeTray,
    isMobile,
  } from "@/store";
  import { onMount } from "svelte";
  import { Language, Theme } from "@/components";
  import type { Language as LanguageType } from "@/interfaces";
  import Icon from "@iconify/svelte";
  import { LANGUAGE_OPTIONS } from "@/constants";

  let isSearchingUpdates = $state(false);
  let version = $state("");
  let autoStart = $state(false);
  let startInTray = $state(false);
  let store: Store | null = null;
  onMount(async () => {
    version = await getVersion();
    store = await load("settings.json");
    autoStart = (await store.get<boolean>("auto_start")) ?? false;
    startInTray = (await store.get<boolean>("start_in_tray")) ?? false;
    if (autoStart) {
      const isAutoStartEnabled = await isEnabled();
      if (!isAutoStartEnabled) {
        await enable();
      }
    }
  });
  openSettings.subscribe(async (open) => {
    open
      ? await setDiscordActivity("Changing settings...")
      : await stopDiscordPresence();
  });
</script>

<AlertDialog.Root bind:open={$openSettings}>
  <AlertDialog.Content class="py-0">
    <!-- <AlertDialog.Header class="font-bold">Settings</AlertDialog.Header> -->
    <ScrollArea class="h-[21rem] select-none my-3">
      <div class="border-b-4 my-4 text-center relative rounded-xl">
        <span
          class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white dark:bg-black px-4 dark:text-gray-300 font-bold"
        >
          App
        </span>
      </div>
      <Card.Root class="bg-slate-100 dark:bg-[#0e141e] border-0">
        <Card.Content class="flex flex-col gap-4">
          <Label
            >Current version: <span class="font-bold">
              v{version}
            </span></Label
          >
          {#if !$isMobile}
            <Button
              class="w-44 bg-slate-300 dark:bg-[#2d3649] "
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
            <div class="flex items-center">
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

            <div class="flex gap-2 items-center">
              <Checkbox
                id="auto-start"
                bind:checked={$closeTray}
                onCheckedChange={async (value) => {
                  await saveSettings();
                }}
              />
              <Label for="auto-start"
                >Minize to tray apps instead of closing</Label
              >
            </div>
            <div class="flex gap-2 items-center">
              <Checkbox
                id="auto-start"
                bind:checked={autoStart}
                onCheckedChange={async (value) => {
                  value ? await enable() : await disable();
                  await store?.set("auto_start", value);
                }}
              />
              <Label for="auto-start">Start app with system</Label>
            </div>
            <div class="flex gap-2 items-center">
              <Separator
                class="border-y-[12px] border-x-2"
                orientation="vertical"
              />
              <Checkbox
                id="start-in-tray"
                disabled={!autoStart}
                bind:checked={startInTray}
                onCheckedChange={async (value) => {
                  await store?.set("start_in_tray", value);
                }}
              />
              <Label for="start-in-tray">Start in tray apps</Label>
            </div>
          {/if}
          <Label>Theme</Label>
          <Theme />
        </Card.Content>
      </Card.Root>
      <div class="border-b-4 my-4 text-center relative rounded-xl">
        <span
          class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white dark:bg-black px-4 dark:text-gray-300 font-bold"
        >
          Reader
        </span>
      </div>
      <Card.Root class="bg-slate-100 dark:bg-[#0e141e] border-0">
        <Card.Content class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <Label>Preferable language</Label>
            <Language
              bind:selectedLanguage={$preferableLanguage}
              onChange={async () => {
                await saveSettings();
              }}
              languageOptions={LANGUAGE_OPTIONS}
            />
          </div>
          {#if !$isMobile}
            <div class="flex items-center">
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
          {/if}
        </Card.Content>
      </Card.Root>
      {#if !$isMobile}
        <div class="border-b-4 my-4 text-center relative rounded-xl">
          <span
            class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white dark:bg-black px-4 dark:text-gray-300 font-bold"
          >
            Player
          </span>
        </div>
        <Card.Root class="bg-slate-100 dark:bg-[#0e141e] border-0">
          <Card.Content class="flex flex-col gap-4">
            <div class="flex items-center">
              <Checkbox
                id="use-mpv"
                bind:checked={$useMpv}
                class="flex-shrink-0 mr-2"
                onCheckedChange={async () => {
                  await saveSettings();
                }}
              />
              <Label class="cursor-pointer" for="use-mpv">
                Use MPV player <span class="text-gray-500">
                  (you'll need to install it first)
                </span>
              </Label>
            </div>
          </Card.Content>
        </Card.Root>
      {/if}
      <!-- <div class="border-b-4 my-4 text-center relative rounded-xl">
        <span
          class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white dark:bg-black px-4 dark:text-gray-300 font-bold"
        >
          Others
        </span>
      </div>
      <Card.Root class="bg-slate-100 dark:bg-[#0e141e] border-0">
        <Card.Content class="flex flex-col gap-4">
          <Label>Default page</Label>
          <div class="flex">
            <DefaultPage onChange={async () => await saveSettings()} />
          </div>
        </Card.Content>
      </Card.Root> -->
    </ScrollArea>
    <!-- <AlertDialog.Footer></AlertDialog.Footer> -->
  </AlertDialog.Content>
</AlertDialog.Root>
