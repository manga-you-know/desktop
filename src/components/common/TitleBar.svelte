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
  import { cn } from "@/lib/utils";
  import { isFullscreen, isMaximized } from "@/store";
  import { setFullscreen } from "@/functions";

  const window = getCurrentWindow();
  let version = $state("0.0.0");
  let appPath = $state("");
  let downloadPath = $state("");
  let documentsPath = $state("");

  onMount(async () => {
    version = await getVersion();
    appPath = await appDataDir();
    downloadPath = await downloadDir();
    documentsPath = await documentDir();
  });
</script>

<div
  class={cn(
    "bg-sidebar flex items-center justify-between w-full pl-2 !z-[80] h-10 translate-y-0 pointer-events-auto transition-all duration-300",
    page.route.id?.startsWith("/reader") &&
      $isFullscreen &&
      "h-0 translate-y-[-3rem]"
  )}
  data-tauri-drag-region
>
  <div class="h-full flex items-center select-none">
    <img src="/icon.png" alt="logo" class="h-6" data-tauri-drag-region />
    <Label class="p-3" data-tauri-drag-region>MangaYouKnow</Label>
    <Menubar.Root>
      <Menubar.Menu>
        <Menubar.Trigger>Folders</Menubar.Trigger>
        <Menubar.Content>
          <Menubar.Item
            class="pointer-events-auto"
            onclick={async () => openPath(await join(downloadPath, "mangas"))}
          >
            <Label>Downloads</Label>
            <Icon class="!size-5" icon="mingcute:folder-download-fill" />
          </Menubar.Item>
          <Menubar.Item
            class="pointer-events-auto"
            onclick={async () =>
              openPath(await join(documentsPath, "favorite-panels"))}
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
        <Menubar.Trigger>About</Menubar.Trigger>
        <Menubar.Content>
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
  </div>

  <div class="inline-flex justify-center items-center gap-0.5 mt-0.5 pr-1">
    <Button
      class="size-9 rounded-lg pointer-events-auto"
      variant="ghost"
      onclick={() => window.minimize()}
    >
      <Icon class="!size-6" icon="ic:round-minus" />
    </Button>
    <Button
      class="size-9 rounded-lg pointer-events-auto"
      variant="ghost"
      onclick={async () => {
        if ($isFullscreen) {
          await setFullscreen(false);
          isMaximized.set(await window.isMaximized());
          return;
        }
        if (await window.isMaximized()) {
          await window.unmaximize();
          isMaximized.set(false);
        } else {
          await window.maximize();
          isMaximized.set(true);
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
      class="size-9 rounded-lg pointer-events-auto hover:bg-red-900 transition-colors duration-300"
      variant="ghost"
      onclick={() => window.close()}
    >
      <Icon class="!size-6" icon="material-symbols:close-rounded" />
    </Button>
  </div>
</div>
