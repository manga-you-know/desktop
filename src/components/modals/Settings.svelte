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
    openFavoriteChapter,
    sidebarSide,
    activatedSources,
  } from "@/store";
  import { onMount } from "svelte";
  import { Language, Theme, Select } from "@/components";
  import {
    ANIMESOURCES,
    COMICSOURCES,
    IS_MOBILE,
    LANGUAGE_OPTIONS,
    MANGASOURCES,
  } from "@/constants";
  import Icon from "@iconify/svelte";
  import { cn } from "@/lib/utils";
  import { emit, listen } from "@tauri-apps/api/event";
  import { delay } from "@/utils";
  import { toast } from "svelte-sonner";
  import { retroMode } from "@/states";
  import { suwaManager } from "@/lib/helpers";

  let isSearchingUpdates = $state(false);
  let version = $state("");
  let autoStart = $state(false);
  let startInTray = $state(false);
  let receivedNotification = $state(false);
  let currentTab = $state<
    "behavior" | "search" | "appearance" | "reader" | "player"
  >("behavior");
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
    class="flex flex-col items-center overflow-hidden px-2 pt-2 pb-0"
  >
    <!-- <AlertDialog.Header class="font-bold">Settings</AlertDialog.Header> -->
    <div
      class="bg-background relative z-10 flex w-[24.4rem] items-center justify-center gap-1 rounded-xl p-1 text-sm"
    >
      <div class="absolute z-1 h-6 w-full">
        <div
          class={cn(
            "bg-primary mx-2 h-6 w-18 translate-x-0 rounded-lg transition-all duration-500",
            currentTab === "search" && "w-16 translate-x-[4.7rem]",
            currentTab === "appearance" && "w-24 translate-x-[8.9rem]",
            currentTab === "reader" && "w-16 translate-x-[15.1rem]",
            currentTab === "player" && "w-16 translate-x-[19.3rem]",
          )}
        ></div>
      </div>
      <Button
        class={cn(
          "hover:bg-secondary/30! text-primary! z-2 h-6 w-18 rounded-lg bg-transparent duration-500",
          currentTab === "behavior" && "text-background! hover:bg-primary/20",
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
          "hover:bg-secondary/30! text-primary! z-2 h-6 w-16 rounded-lg bg-transparent duration-500",
          currentTab === "search" && "text-background! hover:bg-primary/20",
        )}
        size="sm"
        variant="secondary"
        onclick={() => {
          currentTab = "search";
        }}
      >
        Search
      </Button>
      <Button
        class={cn(
          "hover:bg-secondary/30! text-primary! z-2 h-6 w-24 rounded-lg bg-transparent duration-500",
          currentTab === "appearance" && "text-background! hover:bg-primary/20",
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
          "hover:bg-secondary/30! text-primary! z-2 h-6 w-16 rounded-lg bg-transparent duration-500",
          currentTab === "reader" && "text-background! hover:bg-primary/20",
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
          "hover:bg-secondary/30! text-primary! z-2 h-6 w-16 rounded-lg bg-transparent duration-500",
          currentTab === "player" && "text-background! hover:bg-primary/20",
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

    <div class="relative mb-2 max-h-[75vh] w-full overflow-hidden">
      <div
        class="flex transition-transform duration-500 ease-in-out"
        style="width: 500%; transform: translateX({currentTab === 'behavior'
          ? '0%'
          : currentTab === 'search'
            ? '-20%'
            : currentTab === 'appearance'
              ? '-40%'
              : currentTab === 'reader'
                ? '-60%'
                : currentTab === 'player'
                  ? '-80%'
                  : '0%'})"
      >
        <ScrollArea
          class="mb-2 max-h-[75vh] w-1/5 scroll-smooth rounded-3xl pr-3 transition-all duration-500 select-none"
        >
          <div
            class="border-secondary relative my-4 rounded-3xl border-b-4 text-center"
          >
            <span
              class="dark:bg-background absolute -top-3 left-1/2 -translate-x-1/2 transform rounded-lg bg-white px-6 font-bold select-none dark:text-gray-300"
            >
              Behavior
            </span>
          </div>
          <div class="my-8 w-full bg-red-500">
            <h1>TESTSSSS</h1>
            <Button onclick={suwaManager.setRepos}>Add repo</Button>
          </div>
          <Card.Root class="bg-secondary/60 rounded-3xl border-0">
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
                    class="h-5 w-5"
                  />
                  Search for updates
                </Button>
                <Label>System</Label>
                <div class="flex items-center">
                  <Switch
                    id="auto-update"
                    bind:checked={$autoSearchUpdates}
                    class="mr-2 shrink-0"
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
                class="shrink-0 mr-2"
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
                  class="w-5! h-5! mr-1 m-0.5"
                  icon="ic:round-discord"
                />integration
              </Label>
            </div> -->

                <div class="flex items-center gap-2">
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
                <div class="flex items-center gap-2">
                  <Separator
                    class="border-x-2 border-y-12"
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
                <div class="flex items-center gap-2">
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
                    class="mr-2 shrink-0"
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
                <Label>Favorite</Label>
                <div class="flex items-center">
                  <Switch
                    id="open-favorite-chapter"
                    bind:checked={$openFavoriteChapter}
                    class="mr-2 shrink-0"
                    onCheckedChange={saveSettings}
                  />
                  <Label class="cursor-pointer" for="open-favorite-chapter">
                    Click on favorite card opens the next chapter
                  </Label>
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
                    <Icon class="size-4!" icon="lucide:paperclip" />
                  </Button>
                </div>
                <Label>Notifications</Label>
                <div class="flex items-center gap-2">
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
                    class="mr-2 shrink-0"
                    onCheckedChange={saveSettings}
                  />
                  <Label class="cursor-pointer" for="notify-favorites">
                    Desktop notification for new chapters from favorites
                  </Label>
                </div>
                <div class="flex items-center gap-2">
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
                  class="flex w-44 gap-3"
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
                    class="size-5!"
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
                  <Icon icon="ic:round-refresh" class="size-5!" />
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
                    class="size-5!"
                  />
                  Reset all settings
                </Button>
              </div>
            </Card.Content>
          </Card.Root>
          {#if !IS_MOBILE}{/if}
        </ScrollArea>
        <ScrollArea
          class="mb-2 max-h-[75vh] w-1/5 scroll-smooth rounded-3xl pr-3 transition-all duration-500 select-none"
        >
          <div
            class="border-secondary relative my-4 rounded-3xl border-b-4 text-center"
          >
            <span
              class="dark:bg-background absolute -top-3 left-1/2 -translate-x-1/2 transform rounded-lg bg-white px-4 font-bold select-none dark:text-gray-300"
            >
              Search
            </span>
          </div>
          <Card.Root class="bg-secondary/60 rounded-3xl border-0">
            <Card.Content class="flex flex-col gap-4">
              <Label
                >Sources <span class="text-gray-500">
                  - Using less should improve performance on low end PC's
                </span></Label
              >

              <div class="flex flex-col gap-0">
                <div class="flex items-center gap-2">
                  <Checkbox
                    id="manga-sources"
                    checked={$activatedSources.some((s) =>
                      MANGASOURCES.map((s) => s.name).includes(s),
                    )}
                    onCheckedChange={() => {
                      if (
                        $activatedSources.some((s) =>
                          MANGASOURCES.map((s) => s.name).includes(s),
                        )
                      ) {
                        $activatedSources = $activatedSources.filter(
                          (s) => !MANGASOURCES.map((sr) => sr.name).includes(s),
                        );
                        saveSettings();
                      } else {
                        $activatedSources = $activatedSources.concat(
                          MANGASOURCES.map((s) => s.name),
                        );
                        saveSettings();
                      }
                    }}
                  />
                  <Label class="cursor-pointer" for="manga-sources">Manga</Label
                  >
                </div>
                {#each MANGASOURCES as source (source.name)}
                  <div class="flex items-center gap-2">
                    <Separator
                      class="border-x-2 border-y-12"
                      orientation="vertical"
                    />

                    <Checkbox
                      id="{source.name}-source"
                      checked={$activatedSources.includes(source.name)}
                      onCheckedChange={() => {
                        if ($activatedSources.includes(source.name)) {
                          $activatedSources = $activatedSources.filter(
                            (s) => s !== source.name,
                          );
                        } else {
                          $activatedSources.push(source.name);
                        }
                        saveSettings();
                      }}
                    />
                    <Label class="cursor-pointer" for="{source.name}-source"
                      >{source.name}</Label
                    ><span class="text-sm text-gray-500"
                      >- {source.language}</span
                    >
                  </div>
                {/each}
              </div>
              <div class="flex flex-col gap-0">
                <div class="flex items-center gap-2">
                  <Checkbox
                    id="comic-sources"
                    checked={$activatedSources.some((s) =>
                      COMICSOURCES.map((s) => s.name).includes(s),
                    )}
                    onCheckedChange={() => {
                      if (
                        $activatedSources.some((s) =>
                          COMICSOURCES.map((s) => s.name).includes(s),
                        )
                      ) {
                        $activatedSources = $activatedSources.filter(
                          (s) => !COMICSOURCES.map((sr) => sr.name).includes(s),
                        );
                        saveSettings();
                      } else {
                        $activatedSources = $activatedSources.concat(
                          COMICSOURCES.map((s) => s.name),
                        );
                        saveSettings();
                      }
                    }}
                  />
                  <Label class="cursor-pointer" for="comic-sources">Comic</Label
                  >
                </div>
                {#each COMICSOURCES as source (source.name)}
                  <div class="flex items-center gap-2">
                    <Separator
                      class="border-x-2 border-y-12"
                      orientation="vertical"
                    />

                    <Checkbox
                      id="{source.name}-source"
                      checked={$activatedSources.includes(source.name)}
                      onCheckedChange={() => {
                        if ($activatedSources.includes(source.name)) {
                          $activatedSources = $activatedSources.filter(
                            (s) => s !== source.name,
                          );
                        } else {
                          $activatedSources.push(source.name);
                        }
                        saveSettings();
                      }}
                    />
                    <Label class="cursor-pointer" for="{source.name}-source"
                      >{source.name}</Label
                    ><span class="text-sm text-gray-500"
                      >- {source.language}</span
                    >
                  </div>
                {/each}
              </div>
              <div class="flex flex-col gap-0">
                <div class="flex items-center gap-2">
                  <Checkbox
                    id="anime-sources"
                    checked={$activatedSources.some((s) =>
                      ANIMESOURCES.map((s) => s.name).includes(s),
                    )}
                    onCheckedChange={() => {
                      if (
                        $activatedSources.some((s) =>
                          ANIMESOURCES.map((s) => s.name).includes(s),
                        )
                      ) {
                        $activatedSources = $activatedSources.filter(
                          (s) => !ANIMESOURCES.map((sr) => sr.name).includes(s),
                        );
                        saveSettings();
                      } else {
                        $activatedSources = $activatedSources.concat(
                          ANIMESOURCES.map((s) => s.name),
                        );
                        saveSettings();
                      }
                    }}
                  />
                  <Label class="cursor-pointer" for="anime-sources">Anime</Label
                  >
                </div>
                {#each ANIMESOURCES as source (source.name)}
                  <div class="flex items-center gap-2">
                    <Separator
                      class="border-x-2 border-y-12"
                      orientation="vertical"
                    />
                    <Checkbox
                      id="{source.name}-source"
                      checked={$activatedSources.includes(source.name)}
                      onCheckedChange={() => {
                        if ($activatedSources.includes(source.name)) {
                          $activatedSources = $activatedSources.filter(
                            (s) => s !== source.name,
                          );
                        } else {
                          $activatedSources.push(source.name);
                        }
                        saveSettings();
                      }}
                    />
                    <Label class="cursor-pointer" for="{source.name}-source"
                      >{source.name}</Label
                    ><span class="text-sm text-gray-500"
                      >- {source.language}</span
                    >
                  </div>
                {/each}
              </div>
            </Card.Content>
          </Card.Root>
        </ScrollArea>
        <ScrollArea
          class="mb-2 max-h-[75vh] w-1/5 scroll-smooth rounded-3xl pr-3 transition-all duration-500 select-none"
        >
          <div
            class="border-secondary relative my-4 rounded-3xl border-b-4 text-center"
          >
            <span
              class="dark:bg-background absolute -top-3 left-1/2 -translate-x-1/2 transform rounded-lg bg-white px-6 font-bold select-none dark:text-gray-300"
            >
              Appearance
            </span>
          </div>
          <Card.Root class="bg-secondary/60 rounded-3xl border-0">
            <Card.Content class="flex flex-col gap-4">
              <Label>Style</Label>

              <div class="flex items-center gap-2">
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
                  class="w-28! cursor-pointer text-nowrap"
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
              <div class="flex items-center gap-2">
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
                  class="w-28! cursor-pointer text-nowrap"
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
              <div class="flex items-center gap-2">
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
                  class="w-28! cursor-pointer text-nowrap"
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
              <div class="flex items-center gap-2">
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
                  class="w-28! cursor-pointer text-nowrap"
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
                  class="mr-2 shrink-0"
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

              <div class="flex items-center gap-2">
                <Switch
                  id="use-filter"
                  bind:checked={$useFilter}
                  onCheckedChange={saveSettings}
                />
                <Label class="cursor-pointer" for="use-filter">Use filter</Label
                >
              </div>
              <div class="flex items-center gap-2">
                <Separator
                  class="border-x-2 border-y-12"
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
              <div class="flex items-center gap-2">
                <Switch
                  id="black-white"
                  bind:checked={$blackWhiteMode}
                  onCheckedChange={saveSettings}
                />
                <Label class="cursor-pointer" for="black-white">
                  Black & White
                </Label>
              </div>
              <div class="flex items-center gap-2">
                <Switch id="retro-mode" bind:checked={retroMode.value} />
                <Label class="cursor-pointer" for="retro-mode">
                  Retro style, without rounded corners
                </Label>
              </div>
              <Label>Sidebar</Label>
              <div
                class="bg-background relative z-10 mr-2 flex w-44 items-center justify-center gap-2 rounded-2xl p-2 text-sm"
              >
                <div class="absolute z-1 h-9 w-full">
                  <div
                    class={cn(
                      "bg-primary mx-2 h-9 w-[4.8rem] translate-x-0 rounded-xl transition-all duration-300",
                      $sidebarSide === "right" && "translate-x-[5.2rem]",
                    )}
                  ></div>
                </div>
                <Button
                  class={cn(
                    "z-2 h-9 w-24 bg-transparent duration-300",
                    $sidebarSide === "left" &&
                      "text-secondary! hover:bg-background/20",
                  )}
                  size="sm"
                  variant="secondary"
                  effect={$sidebarSide === "left" ? "ringHover" : null}
                  onclick={() => {
                    $sidebarSide = "left";
                    saveSettings();
                  }}
                >
                  Left
                </Button>
                <Button
                  class={cn(
                    "z-2 h-9 w-24 bg-transparent duration-300 ",
                    $sidebarSide === "right" &&
                      "text-secondary! hover:bg-background/20",
                  )}
                  size="sm"
                  variant="secondary"
                  effect={$sidebarSide === "right" ? "ringHover" : null}
                  onclick={() => {
                    $sidebarSide = "right";
                    saveSettings();
                  }}
                >
                  Right
                </Button>
              </div>

              <div
                class="bg-background relative z-10 mr-2 flex w-84 items-center justify-center gap-2 rounded-2xl p-2 text-sm"
              >
                <div class="absolute z-1 h-9 w-full">
                  <div
                    class={cn(
                      "bg-primary mx-2 h-9 w-22 translate-x-0 rounded-xl transition-all duration-300",
                      $sidebarBehavior === "collapse" &&
                        "w-22 translate-x-[5.8rem]",
                      $sidebarBehavior === "on-hover" &&
                        "w-34 translate-x-[11.7rem]",
                    )}
                  ></div>
                </div>
                <Button
                  class={cn(
                    "z-2 h-9 w-24 bg-transparent duration-300",
                    $sidebarBehavior === "expand" &&
                      "text-secondary! hover:bg-background/20",
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
                    "z-2 h-9 w-24 bg-transparent duration-300 ",
                    $sidebarBehavior === "collapse" &&
                      "text-secondary! hover:bg-background/20",
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
                    "z-2 h-9 bg-transparent duration-300",
                    $sidebarBehavior === "on-hover" &&
                      "text-secondary! hover:bg-background/20",
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
                <div class="flex flex-col justify-center gap-2">
                  <Label class="cursor-pointer" for="custom-titlebar">
                    Titlebar
                  </Label>
                  <div class="flex items-center gap-2">
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
          class="mb-2 max-h-[75vh] w-1/5 scroll-smooth rounded-3xl pr-3 transition-all duration-500 select-none"
        >
          <div
            class="border-secondary relative my-5 rounded-3xl border-b-4 text-center"
          >
            <span
              class="dark:bg-background absolute -top-3 left-1/2 -translate-x-1/2 transform rounded-lg bg-white px-4 font-bold select-none dark:text-gray-300"
            >
              Reader
            </span>
          </div>

          <Card.Root class="bg-secondary/60 rounded-3xl border-0">
            <Card.Content class="flex flex-col gap-4">
              <Label>Badges inside reader</Label>
              <div
                class="pointer-events-auto inline-flex w-full items-center gap-2"
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
                class="pointer-events-auto inline-flex w-full items-center gap-2"
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
                class="pointer-events-auto inline-flex w-full items-center gap-2"
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
                class="pointer-events-auto inline-flex w-full items-center gap-2"
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
                class="bg-background relative z-10 mr-2 flex w-[20rem] items-center justify-center gap-2 rounded-2xl p-2 text-sm"
              >
                <div class="absolute z-1 h-9 w-full">
                  <div
                    class={cn(
                      "bg-primary mx-2 h-9 w-24 translate-x-0 rounded-xl transition-all duration-300",
                      $markReaded === "end" && "translate-x-26",
                      $markReaded === "manual" && "translate-x-52",
                    )}
                  ></div>
                </div>
                <Button
                  class={cn(
                    "z-2 h-9 w-24 bg-transparent duration-300",
                    $markReaded === "start" &&
                      "text-secondary! hover:bg-background/20",
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
                    "z-2 h-9 w-24 bg-transparent duration-300",
                    $markReaded === "end" &&
                      "text-secondary! hover:bg-background/20",
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
                    "z-2 h-9 w-24 bg-transparent duration-300",
                    $markReaded === "manual" &&
                      "text-secondary! hover:bg-background/20",
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
                <Icon class="size-4!" icon="lucide:trash" />
                Clear cache
              </Button>

              {#if !IS_MOBILE}
                <div class="flex items-center">
                  <Checkbox
                    id="auto-fullscreen"
                    bind:checked={$autoEnterFullscreen}
                    class="mr-2 shrink-0"
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
          class="mb-2 max-h-[75vh] w-1/5 scroll-smooth rounded-3xl pr-3 transition-all duration-500 select-none"
        >
          <div
            class="border-secondary relative my-4 rounded-3xl border-b-4 text-center"
          >
            <span
              class="dark:bg-background absolute -top-3 left-1/2 -translate-x-1/2 transform rounded-lg bg-white px-4 font-bold select-none dark:text-gray-300"
            >
              Player
            </span>
          </div>
          <Card.Root class="bg-secondary/60 rounded-3xl border-0">
            <Card.Content class="flex flex-col gap-4">
              <div class="flex items-center">
                <Checkbox
                  id="use-mpv"
                  bind:checked={$useMpv}
                  class="mr-2 shrink-0"
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
