<script lang="ts">
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { ModeWatcher } from "mode-watcher";
  import { NinjaKeys } from "ninja-keys";
  import { onMount } from "svelte";
  import "@/app.css";
  import { Search } from "@/components";
  import { shortcuts, Shortcuts } from "svelte-keyboard-shortcuts";
  let { children } = $props();
  const currentWindow = getCurrentWindow();
  let open = $state(false);

  interface Event {
    key: string;
  }
  const hotkeys = [
    {
      id: "search",
      title: "Open Search",
      hotkey: "ctrl+k",
      handler: () => {
        open = !open;
      },
    },
  ];

  onMount(() => {
    const ninja = document.querySelector("ninja-keys");
    if (ninja) {
      ninja.data = hotkeys;
    }
  });
</script>

<ModeWatcher defaultMode="dark" />
<Search bind:open />
<Shortcuts
  options={{
    generateKbd: false,
  }}
/>
<ninja-keys></ninja-keys>
<button
  class="hidden"
  use:shortcuts={{ keys: ["F9"] }}
  onclick={async () => (open = !open)}>ok</button
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
    open = !open;
    console.log("foda");
  }}>ok</button
>
{@render children?.()}
