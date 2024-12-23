<script>
  import { Shortcuts, shortcuts } from "svelte-keyboard-shortcuts";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import "@/app.css";
  import { ModeWatcher } from "mode-watcher";
  let { children } = $props();
  const currentWindow = getCurrentWindow();
</script>

<ModeWatcher defaultMode="dark" />
<Shortcuts options={{ generateKbd: false, timeout: 100 }} />
<button
  class="hidden"
  use:shortcuts={{ keys: ["F11"] }}
  onclick={async () =>
    currentWindow.setFullscreen(!(await currentWindow.isFullscreen()))}
  >ok</button
>
{@render children?.()}
