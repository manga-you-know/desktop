<script lang="ts">
  import { getVersion } from "@tauri-apps/api/app";
  import { open as openFolder } from "@tauri-apps/plugin-dialog";
  import { enable, isEnabled, disable } from "@tauri-apps/plugin-autostart";
  import { load, Store } from "@tauri-apps/plugin-store";
  import { relaunch } from "@tauri-apps/plugin-process";
  import {
    checkForAppUpdates,
    saveSettings,
    stopDiscordPresence,
    setDiscordActivity,
    resetSettings,
    notify,
    clearCache,
  } from "@/functions";
  import {
    Card,
    Label,
    Button,
    AlertDialog,
    Input,
    Separator,
    ScrollArea,
    Checkbox,
    Switch,
    Slider,
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
    markReaded,
    keepReading,
    filter,
    useFilter,
    blackWhiteMode,
    saturation,
    sepia,
    brightness,
    contrast,
    chapterPagesCounter,
    chapterPercentage,
    showCurrentChapter,
    readerClock,
    filterReader,
    downloadPath,
  } from "@/store";
  import { onMount } from "svelte";
  import { Language, Theme, Select } from "@/components";
  import { IS_MOBILE, LANGUAGE_OPTIONS } from "@/constants";
  import Icon from "@iconify/svelte";
  import { cn } from "@/lib/utils";
  import { emit, listen } from "@tauri-apps/api/event";
  import { delay } from "@/utils";
  import { toast } from "svelte-sonner";

  let isSearchingUpdates = $state(false);
  let version = $state("");
  let autoStart = $state(false);
  let startInTray = $state(false);
  let receivedNotification = $state(false);
  let currentTab = $state<"behavior" | "appearance" | "reader" | "player">(
    "behavior",
  );
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

  async function pickFolder() {
    const path = await openFolder({
      title: "Select a folder for downloads",
      multiple: false,
      directory: true,
      defaultPath: $downloadPath === "Mangas/" ? undefined : $downloadPath,
    });
    if (path) {
      downloadPath.set(path);
      saveSettings();
    }
  }

  const filters = [
    "bg-amber-500/20",
    "bg-amber-900/10",
    "bg-red-900/20",
    "bg-teal-200/20",
    "bg-red-500/20",
    "bg-blue-500/20",
    "bg-amber-900/25",
    "bg-green-400/10",
    "bg-violet-200/20",
    "bg-purple-300/20",
    "bg-orange-500/20",
  ];
  const filtersLabel = {
    "bg-amber-500/20": "Portable Mexico",
    "bg-teal-200/20": "Shine emerald",
    "bg-amber-900/10": "Warm heart",
    "bg-red-900/20": "Great wine",
    "bg-blue-500/20": "Frozen ice",
    "bg-violet-200/20": "Violet dream",
    "bg-green-400/10": "Small florest",
    "bg-amber-900/25": "Fine wood",
    "bg-purple-300/20": "Cool grape",
    "bg-red-500/20": "Gentle blood",
    "bg-orange-500/20": "Strong Autumn",
  };
</script>

<AlertDialog.Root bind:open={$openSettings}>
  <AlertDialog.Content
    class="flex flex-col items-center pb-0 pt-2 px-2 overflow-hidden"
  >
    <!-- <AlertDialog.Header class="font-bold">Settings</AlertDialog.Header> -->
    <div
      class="flex relative w-[20.2rem] text-sm items-center justify-center p-1 gap-1 bg-primary rounded-xl z-10"
    >
      <div class="z-[1] absolute w-full h-6">
        <div
          class={cn(
            "h-6 bg-background mx-2 rounded-lg transition-all duration-500 w-[4.5rem] translate-x-0",
            currentTab === "appearance" && "w-[6rem] translate-x-[4.8rem]",
            currentTab === "reader" && "w-[4rem] translate-x-[11rem]",
            currentTab === "player" && "w-[4rem] translate-x-[15.3rem]",
          )}
        ></div>
      </div>
      <Button
        class={cn(
          "z-[2] h-6 w-[4.5rem] rounded-lg duration-500 bg-transparent hover:!text-primary !text-background",
          currentTab === "behavior" && "!text-primary hover:bg-primary/20",
        )}
        size="sm"
        variant="secondary"
        onclick={() => {
          currentTab = "behavior";
        }}
      >
        Behavior
      </Button>
      <Button
        class={cn(
          "z-[2] h-6 w-24 rounded-lg duration-500 bg-transparent hover:!text-primary !text-background",
          currentTab === "appearance" && "!text-primary hover:bg-primary/20",
        )}
        size="sm"
        variant="secondary"
        onclick={() => {
          currentTab = "appearance";
        }}
      >
        Appearance
      </Button>
      <Button
        class={cn(
          "z-[2] h-6 w-16 rounded-lg duration-500 bg-transparent hover:!text-primary !text-background",
          currentTab === "reader" && "!text-primary hover:bg-primary/20",
        )}
        size="sm"
        variant="secondary"
        onclick={() => {
          currentTab = "reader";
        }}
      >
        Reader
      </Button>
      <Button
        class={cn(
          "z-[2] h-6 w-16 rounded-lg duration-500 bg-transparent hover:!text-primary !text-background",
          currentTab === "player" && "!text-primary hover:bg-primary/20",
        )}
        size="sm"
        variant="secondary"
        onclick={() => {
          currentTab = "player";
        }}
      >
        Player
      </Button>
    </div>

    <div class="relative overflow-hidden max-h-[75vh] w-full mb-2">
      <div
        class="flex transition-transform duration-500 ease-in-out"
        style="width: 400%; transform: translateX({currentTab === 'behavior'
          ? '0%'
          : currentTab === 'appearance'
            ? '-25%'
            : currentTab === 'reader'
              ? '-50%'
              : currentTab === 'player'
                ? '-75%'
                : '0%'})"
      >
        <ScrollArea
          class="w-1/4 max-h-[75vh] rounded-3xl select-none mb-2 pr-3 scroll-smooth transition-all duration-500"
        >
          <div
            class="border-b-4 my-4 border-secondary text-center relative rounded-3xl"
          >
            <span
              class="absolute -top-3 left-1/2 transform -translate-x-1/2 rounded-lg bg-white dark:bg-background px-6 dark:text-gray-300 font-bold select-none"
            >
              Behavior
            </span>
          </div>
          <Card.Root class="bg-secondary/60 border-0 rounded-3xl">
            <Card.Content class="flex flex-col gap-4">
              <Label class="text-md">
                Current version: <span class="text-xl font-bold">
                  v{version}
                </span>
              </Label>
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
                <Label>System</Label>
                <div class="flex items-center">
                  <Switch
                    id="auto-update"
                    bind:checked={$autoSearchUpdates}
                    class="flex-shrink-0 mr-2"
                    onCheckedChange={saveSettings}
                  />
                  <Label class="cursor-pointer" for="auto-update">
                    Auto check for updates
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
                  <Switch
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
                <div class="flex gap-2 items-center">
                  <Switch
                    id="minimize"
                    bind:checked={$closeTray}
                    onCheckedChange={saveSettings}
                  />
                  <Label class="cursor-pointer" for="minimize">
                    When closed, keep running in background
                  </Label>
                </div>
                <div class="flex items-center">
                  <Switch
                    id="show-count-icon"
                    bind:checked={$showCountIcon}
                    class="flex-shrink-0 mr-2"
                    onCheckedChange={saveSettings}
                  />
                  <Label class="cursor-pointer" for="show-count-icon">
                    Show count of favorites with chapter to read in icon
                  </Label>
                </div>
                <div class="flex flex-col gap-2">
                  <Label>Default reading language</Label>
                  <Language
                    bind:selectedLanguage={$preferableLanguage}
                    onChange={saveSettings}
                    languageOptions={LANGUAGE_OPTIONS}
                  />
                </div>
                <Label>Download path</Label>
                <div class="inline-flex">
                  <Input
                    class="w-80 rounded-r-none"
                    id="downloadPath"
                    placeholder="Path base for download"
                    floatingLabel
                    readonly
                    required
                    variant="outline"
                    onchange={saveSettings}
                    onenter={saveSettings}
                    bind:value={$downloadPath}
                  />
                  <Button
                    class="rounded-l-none"
                    variant="outline"
                    onclick={pickFolder}
                  >
                    <Icon class="!size-4" icon="lucide:paperclip" />
                  </Button>
                </div>
                <Label>Notifications</Label>
                <div class="flex gap-2 items-center">
                  <Switch
                    id="notify-update"
                    disabled={!$autoSearchUpdates}
                    bind:checked={$notifyUpdate}
                    onCheckedChange={saveSettings}
                  />
                  <Label class="cursor-pointer" for="notify-update">
                    Desktop notication for new updates
                  </Label>
                </div>
                <div class="flex items-center">
                  <Switch
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
                  <Switch
                    id="custom-notificator"
                    disabled={!$notifyUpdate && !$notifyFavorites}
                    bind:checked={$customNotificator}
                    onCheckedChange={saveSettings}
                  />
                  <Label class="cursor-pointer" for="custom-notificator">
                    Custom notifications (not natives & they open the chapter
                    when clicked)
                  </Label>
                </div>
                <Button
                  class="w-44 flex gap-3"
                  variant={receivedNotification ? "outline" : "default"}
                  effect={receivedNotification
                    ? "ringHoverSecondary"
                    : "ringHover"}
                  onclick={async () => {
                    await notify(
                      "One Piece",
                      "+1 thrilion chapters",
                      "insane_click",
                      true,
                    );
                    await listen("insane_click", async () => {
                      if (receivedNotification) return;
                      receivedNotification = true;
                      await delay(2500);
                      receivedNotification = false;
                    });
                  }}
                >
                  <Icon
                    class="!size-5"
                    icon={receivedNotification
                      ? "lucide:check"
                      : "material-symbols:notifications-rounded"}
                  />
                  {receivedNotification
                    ? "Click received!"
                    : "Test notification"}
                </Button>
              {:else}
                <Label>Theme</Label>
                <Theme />
              {/if}
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
          {#if !IS_MOBILE}{/if}
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
        <ScrollArea
          class="w-1/4 max-h-[80vh] rounded-3xl select-none mb-2 pr-3 scroll-smooth transition-all duration-500"
        >
          <div
            class="border-b-4 my-4 border-secondary text-center relative rounded-3xl"
          >
            <span
              class="absolute -top-3 left-1/2 transform -translate-x-1/2 rounded-lg bg-white dark:bg-background px-6 dark:text-gray-300 font-bold select-none"
            >
              Appearance
            </span>
          </div>
          <Card.Root class="bg-secondary/60 border-0 rounded-3xl">
            <Card.Content class="flex flex-col gap-4">
              <Label>Style</Label>

              <div class="flex gap-2 items-center">
                <Slider
                  class="max-w-36"
                  type="single"
                  bind:value={$brightness}
                  onValueChange={saveSettings}
                  min={0.1}
                  max={10}
                  step={0.05}
                  disabled={$blackWhiteMode}
                />
                <Label
                  class="cursor-pointer text-nowrap !w-28"
                  onclick={() => {
                    brightness.set(1);
                    saveSettings();
                  }}
                >
                  Brightness
                  <span class="text-gray-500">
                    {Math.floor($brightness * 100)}%
                  </span>
                </Label>
              </div>
              <div class="flex gap-2 items-center">
                <Slider
                  class="max-w-36"
                  type="single"
                  bind:value={$contrast}
                  onValueChange={saveSettings}
                  min={0.1}
                  max={10}
                  step={0.05}
                  disabled={$blackWhiteMode}
                />
                <Label
                  class="cursor-pointer text-nowrap !w-28"
                  onclick={() => {
                    contrast.set(1);
                    saveSettings();
                  }}
                >
                  Contrast
                  <span class="text-gray-500">
                    {Math.floor($contrast * 100)}%
                  </span>
                </Label>
              </div>
              <div class="flex gap-2 items-center">
                <Slider
                  class="max-w-36"
                  type="single"
                  bind:value={$saturation}
                  onValueChange={saveSettings}
                  max={10}
                  step={0.05}
                  disabled={$blackWhiteMode}
                />
                <Label
                  class="cursor-pointer text-nowrap !w-28"
                  onclick={() => {
                    saturation.set(1);
                    saveSettings();
                  }}
                >
                  Saturation
                  <span class="text-gray-500">
                    {Math.floor($saturation * 100)}%
                  </span>
                </Label>
              </div>
              <div class="flex gap-2 items-center">
                <Slider
                  class="max-w-36"
                  type="single"
                  bind:value={$sepia}
                  onValueChange={saveSettings}
                  max={1}
                  step={0.05}
                  disabled={$blackWhiteMode}
                />
                <Label
                  class="cursor-pointer text-nowrap !w-28"
                  onclick={() => {
                    sepia.set(0);
                    saveSettings();
                  }}
                >
                  Sepia
                  <span class="text-gray-500">
                    {Math.floor($sepia * 100)}%
                  </span>
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
                  Window high transparency
                </Label>
              </div>
              <Label>Filter</Label>
              <Select
                class="w-44"
                classPopup="w-44"
                wheelControls
                bind:selected={$filter}
                items={filters}
                itemsLabel={filtersLabel}
                onselect={saveSettings}
                closeButton={false}
              />

              <div class="flex gap-2 items-center">
                <Switch
                  id="use-filter"
                  bind:checked={$useFilter}
                  onCheckedChange={saveSettings}
                />
                <Label class="cursor-pointer" for="use-filter">Use filter</Label
                >
              </div>
              <div class="flex gap-2 items-center">
                <Separator
                  class="border-y-[12px] border-x-2"
                  orientation="vertical"
                />
                <Switch
                  id="filter-only-reader"
                  disabled={!$useFilter}
                  bind:checked={$filterReader}
                  onCheckedChange={saveSettings}
                />
                <Label class="cursor-pointer" for="filter-only-reader">
                  Only in reader
                </Label>
              </div>
              <div class="flex gap-2 items-center">
                <Switch
                  id="black-white"
                  bind:checked={$blackWhiteMode}
                  onCheckedChange={saveSettings}
                />
                <Label class="cursor-pointer" for="black-white">
                  Black & White
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
                      $sidebarBehavior === "collapse" &&
                        "w-[5.5rem] translate-x-[5.8rem]",
                      $sidebarBehavior === "on-hover" &&
                        "w-[8.5rem] translate-x-[11.7rem]",
                    )}
                  ></div>
                </div>
                <Button
                  class={cn(
                    "z-[2] h-9 w-24 duration-300 bg-transparent",
                    $sidebarBehavior === "expand" &&
                      "!text-secondary hover:bg-background/20",
                  )}
                  size="sm"
                  variant="secondary"
                  effect={$sidebarBehavior === "expand" ? "ringHover" : null}
                  onclick={() => {
                    $sidebarBehavior = "expand";
                    saveSettings();
                  }}
                >
                  Expanded
                </Button>
                <Button
                  class={cn(
                    "z-[2] h-9 w-24 duration-300 bg-transparent ",
                    $sidebarBehavior === "collapse" &&
                      "!text-secondary hover:bg-background/20",
                  )}
                  size="sm"
                  variant="secondary"
                  effect={$sidebarBehavior === "collapse" ? "ringHover" : null}
                  onclick={() => {
                    $sidebarBehavior = "collapse";
                    saveSettings();
                  }}
                >
                  Compact
                </Button>
                <Button
                  class={cn(
                    "z-[2] h-9 duration-300 bg-transparent",
                    $sidebarBehavior === "on-hover" &&
                      "!text-secondary hover:bg-background/20",
                  )}
                  size="sm"
                  variant="secondary"
                  effect={$sidebarBehavior === "on-hover" ? "ringHover" : null}
                  onclick={() => {
                    $sidebarBehavior = "on-hover";
                    saveSettings();
                  }}
                >
                  Expand on hover
                </Button>
              </div>
              <div class="flex gap-24">
                <div class="flex flex-col gap-2">
                  <Label>Theme</Label>
                  <Theme />
                </div>
                <div class="flex flex-col gap-2 justify-center">
                  <Label class="cursor-pointer" for="custom-titlebar">
                    Titlebar
                  </Label>
                  <div class="flex gap-2 items-center">
                    <Label
                      class="cursor-pointer"
                      onclick={() => {
                        customTitlebar.set(false);
                        saveSettings();
                      }}
                      >Native
                    </Label>
                    <Switch
                      bind:checked={$customTitlebar}
                      onCheckedChange={saveSettings}
                    />
                    <Label
                      class="cursor-pointer"
                      onclick={() => {
                        customTitlebar.set(true);
                        saveSettings();
                      }}
                      >Custom
                    </Label>
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card.Root>
        </ScrollArea>
        <ScrollArea
          class="w-1/4 max-h-[80vh] rounded-3xl select-none mb-2 pr-3 scroll-smooth transition-all duration-500"
        >
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
              <Label>Badges inside reader</Label>
              <div
                class="w-full inline-flex gap-2 items-center pointer-events-auto"
              >
                <Switch
                  id="chapter-count"
                  bind:checked={$chapterPagesCounter}
                  onCheckedChange={saveSettings}
                />
                <Label class="cursor-pointer select-none" for="chapter-count"
                  >Pages count</Label
                >
              </div>
              <div
                class="w-full inline-flex gap-2 items-center pointer-events-auto"
              >
                <Switch
                  id="chapter-percentage"
                  bind:checked={$chapterPercentage}
                  onCheckedChange={saveSettings}
                />
                <Label
                  class="cursor-pointer select-none"
                  for="chapter-percentage"
                >
                  Reading percentage
                </Label>
              </div>
              <div
                class="w-full inline-flex gap-2 items-center pointer-events-auto"
              >
                <Switch
                  id="show-current-chapter"
                  bind:checked={$showCurrentChapter}
                  onCheckedChange={saveSettings}
                />
                <Label
                  class="cursor-pointer select-none"
                  for="show-current-chapter"
                >
                  Chapter number
                </Label>
              </div>
              <div
                class="w-full inline-flex gap-2 items-center pointer-events-auto"
              >
                <Switch
                  id="reader-clock"
                  bind:checked={$readerClock}
                  onCheckedChange={saveSettings}
                />
                <Label class="cursor-pointer select-none" for="reader-clock"
                  >Show clock</Label
                >
              </div>

              <Label>Mark as read</Label>
              <div
                class="flex relative w-[20rem] text-sm items-center justify-center mr-2 p-2 gap-2 bg-background rounded-2xl z-10"
              >
                <div class="z-[1] absolute w-full h-9">
                  <div
                    class={cn(
                      "h-9 bg-primary mx-2 rounded-xl transition-all duration-300 w-[6rem] translate-x-0",
                      $markReaded === "end" && "translate-x-[6.5rem]",
                      $markReaded === "manual" && "translate-x-[13rem]",
                    )}
                  ></div>
                </div>
                <Button
                  class={cn(
                    "z-[2] h-9 w-24 duration-300 bg-transparent",
                    $markReaded === "start" &&
                      "!text-secondary hover:bg-background/20",
                  )}
                  size="sm"
                  variant="secondary"
                  effect={$markReaded === "start" ? "ringHover" : null}
                  onclick={() => {
                    $markReaded = "start";
                    saveSettings();
                  }}
                >
                  First page
                </Button>
                <Button
                  class={cn(
                    "z-[2] h-9 w-24 duration-300 bg-transparent",
                    $markReaded === "end" &&
                      "!text-secondary hover:bg-background/20",
                  )}
                  size="sm"
                  variant="secondary"
                  effect={$markReaded === "end" ? "ringHover" : null}
                  onclick={() => {
                    $markReaded = "end";
                    saveSettings();
                  }}
                >
                  Last page
                </Button>
                <Button
                  class={cn(
                    "z-[2] h-9 w-24 duration-300 bg-transparent",
                    $markReaded === "manual" &&
                      "!text-secondary hover:bg-background/20",
                  )}
                  size="sm"
                  variant="secondary"
                  effect={$markReaded === "manual" ? "ringHover" : null}
                  onclick={() => {
                    $markReaded = "manual";
                    saveSettings();
                  }}
                >
                  Manual
                </Button>
              </div>
              <Label>Chapter cache</Label>
              <div class="flex items-center gap-2">
                <Switch
                  id="keep-reading"
                  bind:checked={$keepReading}
                  onCheckedChange={saveSettings}
                />
                <Label for="keep-reading" class="cursor-pointer"
                  >Keep reading</Label
                >
              </div>
              <Button
                class="w-44"
                variant="destructive"
                effect="ringHoverDestructive"
                onclick={async () => {
                  await clearCache();
                  toast.info("Cache cleared!");
                }}
              >
                <Icon class="!size-4" icon="lucide:trash" />
                Clear cache
              </Button>

              {#if !IS_MOBILE}
                <div class="flex items-center">
                  <Checkbox
                    id="auto-fullscreen"
                    bind:checked={$autoEnterFullscreen}
                    class="flex-shrink-0 mr-2"
                    onCheckedChange={saveSettings}
                  />
                  <Label class="cursor-pointer" for="auto-fullscreen"
                    >Enter in fullscreen when reading</Label
                  >
                </div>
              {/if}
            </Card.Content>
          </Card.Root>
        </ScrollArea>
        <ScrollArea
          class="w-1/4 max-h-[80vh] rounded-3xl select-none mb-2 pr-3 scroll-smooth transition-all duration-500"
        >
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
        </ScrollArea>
      </div>
    </div>
    <!-- <AlertDialog.Footer></AlertDialog.Footer> -->
  </AlertDialog.Content>
</AlertDialog.Root>
