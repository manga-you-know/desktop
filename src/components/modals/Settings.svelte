<script lang="ts">
  import { getVersion } from "@tauri-apps/api/app";
  import { enable, isEnabled, disable } from "@tauri-apps/plugin-autostart";
  import { load, Store } from "@tauri-apps/plugin-store";
  import { relaunch } from "@tauri-apps/plugin-process";
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
    customTitlebar,
    notifyFavorites,
    showCountIcon,
    windowEffects,
    customNotificator,
    theme,
  } from "@/store";
  import { onMount } from "svelte";
  import { Language, Theme } from "@/components";
  import { IS_MOBILE, LANGUAGE_OPTIONS } from "@/constants";
  import Icon from "@iconify/svelte";
  import { cn } from "@/lib/utils";
  import { emit } from "@tauri-apps/api/event";

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
          class="absolute -top-3 left-1/2 transform -translate-x-1/2 rounded-lg bg-white dark:bg-background px-6 dark:text-gray-300 font-bold select-none"
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
              class="w-44 "
              effect="ringHover"
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
                onCheckedChange={saveSettings}
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
                onCheckedChange={saveSettings}
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
                onCheckedChange={saveSettings}
              />
              <Label class="cursor-pointer" for="minimize">
                When closed, keep running in background
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
              <Label class="cursor-pointer" for="auto-start">
                Start app with system
              </Label>
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
              <Label class="cursor-pointer" for="start-in-tray">
                Start in background
              </Label>
            </div>
            <div class="flex items-center">
              <Checkbox
                id="notify-favorites"
                bind:checked={$notifyFavorites}
                class="flex-shrink-0 mr-2"
                onCheckedChange={saveSettings}
              />
              <Label class="cursor-pointer" for="notify-favorites">
                Desktop notification for new chapters from favorites
              </Label>
            </div>
            <div class="flex gap-2 items-center">
              <Separator
                class="border-y-[12px] border-x-2"
                orientation="vertical"
              />
              <Checkbox
                id="custom-notificator"
                disabled={!$notifyFavorites}
                bind:checked={$customNotificator}
                onCheckedChange={saveSettings}
              />
              <Label class="cursor-pointer" for="custom-notificator">
                Custom notifications (not natives & they appear on fullscreen in
                this version)
              </Label>
            </div>
            <div class="flex items-center">
              <Checkbox
                id="show-count-icon"
                bind:checked={$showCountIcon}
                class="flex-shrink-0 mr-2"
                onCheckedChange={saveSettings}
              />
              <Label class="cursor-pointer" for="show-count-icon">
                Show count of favorites with chapter to read in icon
              </Label>
            </div>
            <div class="flex items-center">
              <Checkbox
                id="window-effects"
                bind:checked={$windowEffects}
                class="flex-shrink-0 mr-2"
                onCheckedChange={saveSettings}
              />
              <Label class="cursor-pointer" for="window-effects">
                Window effects (experimental & Windows only)
              </Label>
            </div>
            <Label>Sidebar</Label>
            <div
              class="flex relative w-[21rem] text-sm items-center justify-center mr-2 p-2 gap-2 bg-background rounded-2xl z-10"
            >
              <div class="z-[1] absolute w-full h-9">
                <div
                  class={cn(
                    "h-9 bg-primary mx-2 rounded-xl transition-all duration-300 w-[5.5rem] translate-x-0",
                    $sidebarBehavior === "collapse" && "w-20 translate-x-24",
                    $sidebarBehavior === "on-hover" && "w-32 translate-x-48",
                  )}
                ></div>
              </div>
              <Button
                class={cn(
                  "z-[2] h-9 w-24 transition-colors duration-300 bg-transparent",
                  $sidebarBehavior === "expand" &&
                    "!text-secondary hover:bg-background/20",
                )}
                size="sm"
                variant="secondary"
                onclick={() => {
                  $sidebarBehavior = "expand";
                  saveSettings();
                }}
              >
                Expanded
              </Button>
              <Button
                class={cn(
                  "z-[2] h-9 w-24 transition-colors duration-300 bg-transparent ",
                  $sidebarBehavior === "collapse" &&
                    "!text-secondary hover:bg-background/20",
                )}
                size="sm"
                variant="secondary"
                onclick={() => {
                  $sidebarBehavior = "collapse";
                  saveSettings();
                }}
              >
                Compact
              </Button>
              <Button
                class={cn(
                  "z-[2] h-9 transition-colors duration-300 bg-transparent",
                  $sidebarBehavior === "on-hover" &&
                    "!text-secondary hover:bg-background/20",
                )}
                size="sm"
                variant="secondary"
                onclick={() => {
                  $sidebarBehavior = "on-hover";
                  saveSettings();
                }}
              >
                Expand on hover
              </Button>
            </div>
            <div class="flex flex-col gap-2 justify-center">
              <Label class="cursor-pointer" for="custom-titlebar">
                Custom Titlebar
              </Label>
              <div class="flex gap-2 items-center">
                <Label
                  class="cursor-pointer"
                  onclick={() => {
                    customTitlebar.set(false);
                    saveSettings();
                  }}>OFF</Label
                >
                <Switch
                  bind:checked={$customTitlebar}
                  onCheckedChange={saveSettings}
                />
                <Label
                  class="cursor-pointer"
                  onclick={() => {
                    customTitlebar.set(true);
                    saveSettings();
                  }}>ON</Label
                >
              </div>
            </div>
          {/if}
          <Label>Theme</Label>
          <Theme />
          <div class="flex gap-3">
            <Button class="w-44" effect="ringHover" onclick={relaunch}>
              <Icon icon="ic:round-refresh" class="!size-5" />
              Reload app
            </Button>
            <Button
              class="w-44"
              effect="ringHover"
              onclick={async () => {
                await resetSettings();
              }}
            >
              <Icon
                icon="material-symbols:rule-settings-rounded"
                class="!size-5"
              />
              Reset all settings
            </Button>
          </div>
        </Card.Content>
      </Card.Root>
      <div
        class="border-b-4 border-secondary my-5 text-center relative rounded-3xl"
      >
        <span
          class="absolute -top-3 left-1/2 transform -translate-x-1/2 rounded-lg bg-white dark:bg-background px-4 dark:text-gray-300 font-bold select-none"
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
                onCheckedChange={saveSettings}
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
            class="absolute -top-3 left-1/2 transform -translate-x-1/2 rounded-lg bg-white dark:bg-background px-4 dark:text-gray-300 font-bold select-none"
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
                onCheckedChange={saveSettings}
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
