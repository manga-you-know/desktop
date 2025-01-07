<script lang="ts">
  import "@/app.css";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { ModeWatcher } from "mode-watcher";
  import { NinjaKeys } from "ninja-keys";
  import { onMount } from "svelte";
  import { Search, Settings } from "@/components";
  import { autoSearchUpdates, defaultPage, openSearch } from "@/store";
  import { shortcuts, Shortcuts } from "svelte-keyboard-shortcuts";
  import { checkForAppUpdates, initDatabase, loadSettings } from "@/functions";
  let { children } = $props();
  const currentWindow = getCurrentWindow();

  interface Event {
    key: string;
  }
  const hotkeys = [
    {
      id: "search",
      title: "Open Search",
      hotkey: "ctrl+k",
      handler: () => {
        $openSearch = !$openSearch;
      },
    },
  ];

  onMount(async () => {
    const ninja = document.querySelector("ninja-keys");
    if (ninja) {
      ninja.data = hotkeys;
    }
    await initDatabase();
    await loadSettings();
    if ($autoSearchUpdates) {
      await checkForAppUpdates();
    }
  });
</script>

<Search />
<Settings />
<ModeWatcher defaultMode="dark" />
<Shortcuts
  options={{
    generateKbd: false,
  }}
/>
<ninja-keys></ninja-keys>
<button
  class="hidden"
  use:shortcuts={{ keys: ["F9"] }}
  onclick={async () => ($openSearch = !$openSearch)}>ok</button
>
<button
  class="hidden"
  use:shortcuts={{ keys: ["F11"] }}
  onclick={async () =>
    currentWindow.setFullscreen(!(await currentWindow.isFullscreen()))}
  >ok</button
>
<button
  class="hidden"
  use:shortcuts={{ keys: ["Alt", "k"] }}
  onkeyup={(e: Event) => {
    if (e.key !== "k") return;
    $openSearch = !openSearch;
  }}>ok</button
>
{@render children?.()}
