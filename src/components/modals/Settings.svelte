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
  import type { Attachment } from "svelte/attachments";
  import { Language, Theme, Select, AddRepo } from "@/components";
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
  import { openSettings, retroMode, suwayomi } from "@/states";
  import { suwaManager } from "@/lib/helpers";
  import { fly } from "svelte/transition";

  let isSearchingUpdates = $state(false);
  let version = $state("");
  let autoStart = $state(false);
  let startInTray = $state(false);
  let store: Store | null = null;

  // onMount(async () => {
  //   version = await getVersion();
  //   store = await load("settings.json");
  //   autoStart = (await store.get<boolean>("auto_start")) ?? false;
  //   startInTray = (await store.get<boolean>("start_in_tray")) ?? false;
  //   if (autoStart) {
  //     const isAutoStartEnabled = await isEnabled();
  //     if (!isAutoStartEnabled) {
  //       await enable();
  //     }
  //   }
  // });
  // openSettings.subscribe(async (open) => {
  //   open
  //     ? await setDiscordActivity("Changing settings...")
  //     : await stopDiscordPresence();
  // });

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

  const sections: {
    id: string;
    label: string;
    items: { value: any; label: string; description?: string }[];
  }[] = [
    { id: "general", label: "General", items: [] },
    { id: "appearance", label: "Appearance", items: [] },
    { id: "extensions", label: "Extensions", items: [] },
    { id: "reader", label: "Reader", items: [] },
    { id: "advanced", label: "Advanced", items: [] },
  ];

  let scrollDiv: HTMLDivElement = $state(null!);
  let activeSection = $state(sections[0].id);

  openSettings.onchange = (v) => {
    if (v) {
      suwaManager.getRepos();
      suwaManager.getExtensionsAvailable();
    }
    delay(10).then(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              activeSection = entry.target.id;
            }
          }
        },
        { root: scrollDiv, rootMargin: "-50% 0px -50% 0px" },
      );
      if (v) {
        sections.forEach(({ id }) => {
          const el = document.getElementById(id);
          if (el) observer.observe(el);
        });
      } else {
        observer.disconnect();
      }
    });
  };

  let repoToDelete = $state("");
  let openAddRepo = $state(false);

  // onMount(async () => {
  //   isSuwaConnected = await suwaManager.isConnected();
  // });

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }
</script>

<AlertDialog.Root bind:open={openSettings.active}>
  <AlertDialog.Content class="flex flex-col items-center px-2 pt-2 pb-0">
    <AddRepo bind:open={openAddRepo} />
    <div class="absolute -left-20">
      <div class="mr-2 flex flex-col gap-[0.apx]">
        <Button class="rounded-t-xl rounded-b-none" variant="info"
          >Search</Button
        >
        {#each sections as section (section.id)}
          <Button
            class="rounded-none font-bold last:rounded-b-xl"
            variant={activeSection === section.id ? "default" : "secondary"}
            onclick={() => scrollTo(section.id)}
          >
            {section.label}
          </Button>
        {/each}
      </div>
    </div>
    <div class="max-h-140 overflow-scroll" bind:this={scrollDiv}>
      <div class="flex w-110 flex-col gap-1 overflow-y-hidden">
        <!-- {#each sections as section (section.id)} -->
        <!--   <Card.Root -->
        <!--     class="bg-secondary/60 rounded-3xl border-0" -->
        <!--     id={section.id} -->
        <!--   > -->
        <!--     <Card.Content class="flex flex-col gap-4 pb-40"> -->
        <!--       <Label>{section.label}</Label> -->
        <!--     </Card.Content> -->
        <!--   </Card.Root> -->
        <!-- {/each} -->
        <Card.Root
          class="bg-secondary/60 min-h-100 rounded-3xl border-0"
          id="general"
        >
          <Card.Content class="flex flex-col items-center gap-4 pb-40">
            <Label class="text-2xl">General</Label>
            <Label>{suwayomi.isConnected ? "Connected" : "Disconnected"}</Label>
          </Card.Content>
        </Card.Root>
        <Card.Root
          class="bg-secondary/60 min-h-100 rounded-3xl border-0"
          id="appearance"
        >
          <Card.Content class="flex flex-col items-center gap-4 pb-40">
            <Label class="text-2xl">Appearance</Label>

            <div class="flex w-full flex-col gap-2">
              <button
                class="flex cursor-pointer items-center gap-3"
                onclick={retroMode.toggle}
              >
                <Switch id="check-retro" checked={retroMode.value} />
                <Label class="cursor-pointer">Retro mode</Label>
              </button>
              <span class="text-sm text-gray-400"
                >| This makes everything go square brrrr (looks strangely nice)</span
              >
            </div>
          </Card.Content>
        </Card.Root>
        <Card.Root
          class="bg-secondary/60 min-h-100 rounded-3xl border-0"
          id="extensions"
        >
          <Card.Content class="flex flex-col items-center gap-4 pb-40">
            <Label class="text-2xl">Extensions</Label>
            <div class="flex w-full flex-col gap-2">
              <Label>Repositories</Label>
              <Card.Root
                class="bg-background/60 h-60 w-full rounded-2xl border-0"
              >
                <Card.Content
                  class="flex h-full flex-col items-center justify-between gap-4 p-3"
                >
                  <div
                    class="flex h-full w-full flex-col items-center gap-1 overflow-y-scroll"
                  >
                    {#each suwayomi.extensionRepos as repo}
                      <div class="flex w-full gap-1">
                        <Input
                          divClass="w-full"
                          class="w-full rounded-r-none"
                          variant="outline"
                          readonly
                          value={repo}
                        />
                        <Button
                          class="rounded-l-none pr-2 transition-all"
                          variant="destructive"
                          onclick={() => {
                            if (repoToDelete === repo) {
                              suwayomi.extensionRepos =
                                suwayomi.extensionRepos.filter(
                                  (rp) => rp !== repo,
                                );
                              suwaManager
                                .setRepos()
                                .then(() => (repoToDelete = ""));
                            } else {
                              repoToDelete = repo;
                            }
                          }}
                          onmouseout={() => {
                            delay(700).then(() => {
                              if (repoToDelete === repo) {
                                repoToDelete = "";
                              }
                            });
                          }}
                        >
                          <Icon icon="lucide:trash" />
                          <!-- <Label class="transition-all duration-500" -->
                          <!--   >{repoToDelete === repo ? "Are you sure?" : ""}</Label -->
                          <!-- > -->
                          <span
                            class="overflow-hidden whitespace-nowrap transition-all duration-500 ease-in-out"
                            style="max-width: {repoToDelete === repo
                              ? '120px'
                              : '-0px'}"
                          >
                            Are you sure?
                          </span>
                        </Button>
                      </div>
                    {:else}
                      <span class="text-lg"
                        >You don't seem to have any repositories...
                      </span>
                      <span class="text-3xl">(￢_￢;)</span>
                    {/each}
                  </div>
                  <div class="flex w-full items-center justify-between">
                    <Label class="text-lg"
                      >{suwayomi.extensionsAvailable.length} extensions available</Label
                    >
                    <Button
                      class="h-10 rounded-xl"
                      effect="ringHover"
                      onclick={() => (openAddRepo = true)}
                    >
                      <Icon icon="lucide:plus" /> Add
                    </Button>
                  </div>
                </Card.Content>
              </Card.Root>
            </div>
          </Card.Content>
        </Card.Root>
        <Card.Root
          class="bg-secondary/60 min-h-100 rounded-3xl border-0"
          id="reader"
        >
          <Card.Content class="flex flex-col items-center gap-4 pb-40">
            <Label class="text-2xl">Reader</Label>
          </Card.Content>
        </Card.Root>
        <Card.Root
          class="bg-secondary/60 min-h-100 rounded-3xl border-0"
          id="advanced"
        >
          <Card.Content class="flex flex-col items-center gap-4 pb-40">
            <Label class="text-2xl">Advanced</Label>
          </Card.Content>
        </Card.Root>
      </div>
    </div>
  </AlertDialog.Content>
</AlertDialog.Root>
