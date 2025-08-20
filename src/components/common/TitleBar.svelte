<script lang="ts">
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { openPath, openUrl } from "@tauri-apps/plugin-opener";
  import { Button, Label } from "@/lib/components";
  import Icon from "@iconify/svelte";
  import { Menubar } from "@/lib/components";
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { getVersion } from "@tauri-apps/api/app";
  import {
    appDataDir,
    documentDir,
    downloadDir,
    join,
  } from "@tauri-apps/api/path";
  import { exists } from "@tauri-apps/plugin-fs";
  import { cn } from "@/lib/utils";
  import {
    isFullscreen,
    extraTitle,
    downloadings,
    openMenuChapters,
    isMaximized,
    favoritesLoaded,
    globalChapters,
    openPatchNotes,
    openFeedback,
    downloadPath,
  } from "@/store";
  import { setFullscreen } from "@/functions";
  import type { Downloading, FavoriteLoaded } from "@/types";
  import Tooltip from "./Tooltip.svelte";
  import { goto } from "$app/navigation";
  import { toast } from "svelte-sonner";

  const window = getCurrentWindow();
  let version = $state("0.0.0");
  let appPath = $state("");
  let dlDir = $state("");
  let documentsPath = $state("");
  let divFavs: HTMLDivElement = $state(null!);
  let favoritesWithChapters: FavoriteLoaded[] = $derived(
    Object.values($favoritesLoaded).filter((fv) =>
      fv.nextChapter !== null ? 1 : 0,
    ),
  );
  let downloadingCount = $derived(
    Object.values<Downloading>($downloadings).reduce(
      (a1, a2) => a1 + a2.downloading.length,
      0,
    ),
  );

  onMount(async () => {
    version = await getVersion();
    appPath = await appDataDir();
    dlDir = await downloadDir();
    documentsPath = await documentDir();
  });
</script>

<!--
<div
  class={cn(
    "absolute flex w-full h-10 items-center justify-center translate-y-0 transition-all duration-300",
    page.route.id?.startsWith("/(root)/reader") &&
      $isFullscreen &&
      !$openMenuChapters &&
      "h-0 -translate-y-[3rem]",
  )}
>
  <div class="size-8 rounded-full bg-primary/40"></div>
</div>
-->
<div
  class={cn(
    "bg-sidebar/60 backdrop-blur-sm flex items-center justify-between relative w-full pl-2 !z-[80] h-10 translate-y-0 pointer-events-auto transition-all duration-300",
    page.route.id?.startsWith("/(root)/reader") &&
      $isFullscreen &&
      !$openMenuChapters &&
      "h-0 -translate-y-[3rem]",
  )}
  data-tauri-drag-region={!$isFullscreen}
>
  <div class="h-full flex items-center select-none">
    <img
      src="/icon.png"
      alt="logo"
      class="h-6"
      data-tauri-drag-region={!$isFullscreen}
    />
    <Label class="p-3 z-20" data-tauri-drag-region={!$isFullscreen}>
      MangaYouKnow
    </Label>
    <Menubar.Root class="z-20">
      <Menubar.Menu>
        <Menubar.Trigger>Folders</Menubar.Trigger>
        <Menubar.Content class="z-[51]">
          <Menubar.Item
            class="pointer-events-auto"
            onclick={async () => {
              let path = "";
              if ($downloadPath === "Mangas/") {
                path = await join(dlDir, "Mangas");
              } else {
                path = $downloadPath;
              }
              if (await exists(path)) {
                openPath(path);
              } else {
                toast.warning("There's no downloadings");
              }
            }}
          >
            <Label>Downloads</Label>
            <Icon class="!size-5" icon="mingcute:folder-download-fill" />
          </Menubar.Item>
          <Menubar.Item
            class="pointer-events-auto"
            onclick={async () => {
              const pathToGo = await join(documentsPath, "favorite-panels");
              if (await exists(pathToGo)) {
                openPath(pathToGo);
              } else {
                toast.warning("There's no favorited panels");
              }
            }}
          >
            <Label>Panels</Label>
            <Icon class="!size-5" icon="ic:round-photo-library" />
          </Menubar.Item>
          <Menubar.Item
            class="pointer-events-auto"
            onclick={() => openPath(appPath)}
          >
            <Label>Appdata</Label>
            <Icon class="!size-5" icon="material-symbols:settings-rounded" />
          </Menubar.Item>
        </Menubar.Content>
      </Menubar.Menu>
      <Menubar.Menu>
        <Menubar.Trigger
          class={cn(
            page.route.id?.startsWith("/(root)/reader") && "hidden md:block",
          )}>About</Menubar.Trigger
        >
        <Menubar.Content class="z-[51]">
          <Menubar.Item
            class="pointer-events-auto"
            onclick={() => openPatchNotes.set(true)}
          >
            <Label>Patch notes</Label>
            <Icon
              class="!size-6 -my-0.5"
              icon="material-symbols-light:stylus-note-rounded"
            />
          </Menubar.Item>
          <!--
          <Menubar.Item
            class="pointer-events-auto"
            onclick={() => openFeedback.set(true)}
          >
            <Label>Give feedback</Label>
            <Icon class="!size-5" icon="mdi:github" />
          </Menubar.Item> -->
          <Menubar.Item
            class="pointer-events-auto"
            onclick={() => openUrl("https://github.com/ReiLoko4")}
          >
            <Label>Github</Label>
            <Icon class="!size-5" icon="mdi:github" />
          </Menubar.Item>
          <Menubar.Item
            class="pointer-events-auto"
            onclick={() => openUrl("https://discord.gg/EVqHFtP2r8")}
          >
            <Label>Discord</Label>
            <Icon class="!size-5" icon="ic:round-discord" />
          </Menubar.Item>
          <Menubar.Item
            class="pointer-events-auto"
            onclick={() =>
              openUrl("https://www.linkedin.com/in/thiagovianavargas/")}
          >
            <Label>Linkedin</Label>
            <Icon class="!size-5" icon="streamline:linkedin-solid" />
          </Menubar.Item>
          <Menubar.Separator />
          <Menubar.Item class="pointer-events-none">
            <Label>
              Made by ReiLoko4 with: <br /><br />
              <span class="inline-flex items-center gap-1">
                <Icon icon="devicon-plain:tauri" /> Tauri &
                <Icon icon="devicon-plain:svelte" /> SvelteKit &
              </span>
              <br />
              <span class="inline-flex items-center gap-1">
                <Icon class="!size-3" icon="simple-icons:shadcnui" /> Shadcnui for
                Svelte
              </span>
              <br />
              <br />
              Version -> v{version}
            </Label>
          </Menubar.Item>
        </Menubar.Content>
      </Menubar.Menu>
    </Menubar.Root>
    <Label
      class={cn(
        "ml-8 dark!text-gray-400 hidden underline select-none text-nowrap",
        downloadingCount > 0 && "block",
      )}
      data-tauri-drag-region={!$isFullscreen}
      >{downloadingCount} downloading...
    </Label>
  </div>
  <div
    class="w-full flex justify-center z-10 items-center gap-1 md:gap-6 lg:gap-16 lg"
    data-tauri-drag-region={!$isFullscreen}
  >
    <Label
      class="select-none text-nowrap !text-primary/70 z-[3]"
      data-tauri-drag-region={!$isFullscreen}
    >
      {$extraTitle}
    </Label>
    {#if favoritesWithChapters.length > 0 && page.route.id?.startsWith("/(root)/reader")}
      <div
        bind:this={divFavs}
        onwheel={(e) => {
          const scrollLeft = divFavs.scrollLeft;
          if (e.deltaY < 0) {
            divFavs.scroll({ left: scrollLeft - 50, behavior: "smooth" });
          } else {
            divFavs.scrollTo({ left: scrollLeft + 50, behavior: "smooth" });
          }
        }}
        class="flex !max-w-36 md:!max-w-52 lg:!max-w-96 2xl:!max-w-[30rem] 2xl:!ml-16 transition-all duration-400 overflow-x-scroll overflow-y-hidden bg-background/30 rounded-xl border border-secondary [&::-webkit-scrollbar]:size-0 [&::-webkit-scrollbar-thumb]:bg-transparent"
      >
        {#each favoritesWithChapters as fav}
          {#if fav.self.id.toString() !== page.params?.favoriteId}
            <Tooltip class="font-bold" text={fav.self.name} delay={200}>
              <Button
                class="w-10 h-8 rounded-xl"
                variant="link"
                onclick={() => {
                  openMenuChapters.set(false);
                  globalChapters.set(fav.chapters);
                  goto(
                    `/reader/${fav.self.id}/${$globalChapters.indexOf(
                      fav.nextChapter ?? fav.chapters[0],
                    )}`,
                  );
                }}
              >
                {fav?.nextChapter?.number}
              </Button>
            </Tooltip>
          {/if}
        {/each}
      </div>
    {/if}
  </div>
  <div class="inline-flex justify-center items-center gap-0.5 mt-0.5 pr-1">
    <Button
      class="size-9 z-20 rounded-lg pointer-events-auto"
      variant="ghost"
      onclick={() => window.minimize()}
    >
      <Icon class="!size-6" icon="ic:round-minus" />
    </Button>
    <Button
      class="size-9 z-20 rounded-lg pointer-events-auto"
      variant="ghost"
      onclick={async () => {
        if ($isFullscreen) {
          await setFullscreen(false);
          return;
        }
        if (await window.isMaximized()) {
          await window.unmaximize();
        } else {
          await window.maximize();
        }
      }}
    >
      <Icon
        class="!size-6"
        icon={$isFullscreen
          ? "ic:round-fullscreen-exit"
          : $isMaximized
            ? "fluent:square-multiple-16-regular"
            : "fluent:square-12-regular"}
      />
    </Button>
    <Button
      class="size-9 z-20 rounded-lg pointer-events-auto hover:bg-red-900 transition-colors duration-300"
      variant="ghost"
      onclick={() => window.close()}
    >
      <Icon class="!size-6" icon="material-symbols:close-rounded" />
    </Button>
  </div>
</div>
