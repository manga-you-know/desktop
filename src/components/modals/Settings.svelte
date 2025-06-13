<script lang="ts">
  import { getVersion } from "@tauri-apps/api/app";
  import { enable, isEnabled, disable } from "@tauri-apps/plugin-autostart";
  import { load, Store } from "@tauri-apps/plugin-store";
  import {
    checkForAppUpdates,
    saveSettings,
    stopDiscordPresence,
    setDiscordActivity,
    resetSettings,
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
    notifyUpdate,
    discordIntegration,
    updateInfo,
    openUpdate,
    sidebarBehavior,
  } from "@/store";
  import { onMount } from "svelte";
  import { Language, Theme } from "@/components";
  import type { Language as LanguageType } from "@/types";
  import Icon from "@iconify/svelte";
  import { IS_MOBILE, LANGUAGE_OPTIONS } from "@/constants";
  import { useSidebar } from "@/lib/components/ui/sidebar";

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
  <AlertDialog.Content class="py-0 px-2">
    <!-- <AlertDialog.Header class="font-bold">Settings</AlertDialog.Header> -->
    <ScrollArea
      class="h-[80vh] rounded-3xl select-none my-2 pr-3 scroll-smooth"
    >
      <div
        class="border-b-4 my-4 border-secondary text-center relative rounded-3xl"
      >
        <span
          class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white dark:bg-background px-4 dark:text-gray-300 font-bold select-none"
        >
          App
        </span>
      </div>
      <Card.Root class="bg-secondary/60 border-0 rounded-3xl">
        <Card.Content class="flex flex-col gap-4">
          <Label class="text-md"
            >Current version: <span class="text-xl font-bold">
              v{version}
            </span></Label
          >
          {#if !IS_MOBILE}
            <Button
              class="w-44 bg-background/50 "
              variant="ghost"
              disabled={isSearchingUpdates}
              onclick={async () => {
                if ($updateInfo.updateAvailable) {
                  openUpdate.set(true);
                  return;
                }
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
              <Label class="cursor-pointer" for="auto-update">
                Auto check for updates
              </Label>
            </div>
            <div class="flex gap-2 items-center">
              <Separator
                class="border-y-[12px] border-x-2"
                orientation="vertical"
              />
              <Checkbox
                id="notify-update"
                disabled={!$autoSearchUpdates}
                bind:checked={$notifyUpdate}
                onCheckedChange={async () => {
                  await saveSettings();
                }}
              />
              <Label class="cursor-pointer" for="notify-update">
                Desktop notication for new updates
              </Label>
            </div>
            <!-- <div class="flex items-center">
              <Checkbox
                id="discord-integration"
                bind:checked={$discordIntegration}
                class="flex-shrink-0 mr-2"
                onCheckedChange={async () => {
                  await saveSettings();
                  await stopDiscordPresence();
                }}
              />
              <Label
                class="cursor-pointer flex items-center "
                for="discord-integration"
              >
                Discord <Icon
                  class="!w-5 !h-5 mr-1 m-0.5"
                  icon="ic:round-discord"
                />integration
              </Label>
            </div> -->
            <div class="flex gap-2 items-center">
              <Checkbox
                id="minimize"
                bind:checked={$closeTray}
                onCheckedChange={async () => {
                  await saveSettings();
                }}
              />
              <Label class="cursor-pointer" for="minimize">
                Minize to tray apps instead of closing
              </Label>
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
              <Label class="cursor-pointer" for="auto-start"
                >Start app with system</Label
              >
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
              <Label class="cursor-pointer" for="start-in-tray"
                >Start in tray apps</Label
              >
            </div>
            <Label>Sidebar</Label>
            <div
              class="flex w-[21rem] items-center justify-center mr-2 p-2 gap-2 bg-slate-300 dark:bg-background/70 rounded-2xl z-10"
            >
              <Button
                class="h-9 transition-colors duration-300"
                size="sm"
                onclick={() => {
                  $sidebarBehavior = "expand";
                  saveSettings();
                }}
                variant={$sidebarBehavior === "expand"
                  ? "default"
                  : "secondary"}
              >
                Expanded
              </Button>
              <Button
                class="h-9 transition-colors duration-300"
                size="sm"
                onclick={() => {
                  $sidebarBehavior = "collapse";
                  saveSettings();
                }}
                variant={$sidebarBehavior === "collapse"
                  ? "default"
                  : "secondary"}
              >
                Compact
              </Button>
              <Button
                class="h-9 transition-colors duration-300"
                size="sm"
                onclick={() => {
                  $sidebarBehavior = "on-hover";
                  saveSettings();
                }}
                variant={$sidebarBehavior === "on-hover"
                  ? "default"
                  : "secondary"}
              >
                Expand on hover
              </Button>
            </div>
          {/if}
          <Label>Theme</Label>
          <Theme />
          <Button
            class="w-44 bg-background/50 "
            variant="ghost"
            onclick={async () => {
              await resetSettings();
            }}
          >
            <Icon
              icon="material-symbols:rule-settings-rounded"
              class="!w-5 !h-5"
            />
            Reset all settings
          </Button>
        </Card.Content>
      </Card.Root>
      <div
        class="border-b-4 border-secondary my-5 text-center relative rounded-3xl"
      >
        <span
          class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white dark:bg-background px-4 dark:text-gray-300 font-bold select-none"
        >
          Reader
        </span>
      </div>

      <Card.Root class="bg-secondary/60 border-0 rounded-3xl">
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
          {#if !IS_MOBILE}
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
      {#if !IS_MOBILE}
        <div
          class="border-b-4 border-secondary my-4 text-center relative rounded-3xl"
        >
          <span
            class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white dark:bg-background px-4 dark:text-gray-300 font-bold select-none"
          >
            Player
          </span>
        </div>
        <Card.Root class="bg-secondary/60 border-0 rounded-3xl">
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
      <!-- <div class="border-b-4 my-4 text-center relative rounded-3xl">
        <span
          class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white dark:bg-background px-4 dark:text-gray-300 font-bold"
        >
          Others
        </span>
      </div>
      <Card.Root class="bg-secondary/60 border-0 rounded-3xl">
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
