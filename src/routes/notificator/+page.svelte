<script lang="ts">
  import "@/app.css";
  import { Button, Label } from "@/lib/components";
  import { cn } from "@/lib/utils";
  import { delay } from "@/utils";
  import type { NotificationPayload } from "@/types";
  import { emit, listen } from "@tauri-apps/api/event";
  import { getCurrentWindow, Window } from "@tauri-apps/api/window";
  import { moveWindow, Position } from "@tauri-apps/plugin-positioner";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import Icon from "@iconify/svelte";

  const window = getCurrentWindow();
  let mainWindow: Window | null = $state(null);

  let open = $state(false);
  let isHover = $state(false);
  let theme = $state("dark");
  let title = $state("");
  let body = $state("");
  let isChapter = $state(false);
  let readEmit = $state("");
  const queue: NotificationPayload[] = $state([]);

  let isNotifying = $state(false);

  function isNotificationPayload(obj: any): obj is NotificationPayload {
    return (
      typeof obj === "object" &&
      obj !== null &&
      "title" in obj &&
      "body" in obj &&
      "isChapter" in obj &&
      "theme" in obj &&
      (typeof obj.title === "string" || obj.title === null) &&
      typeof obj.body === "string" &&
      typeof obj.isChapter === "boolean" &&
      typeof obj.theme === "string"
    );
  }

  async function notificate() {
    if (queue.length === 0) return;
    while (isNotifying) {
      await delay(20);
    }
    isNotifying = true;
    const next = queue.shift();
    if (next === undefined) return;
    title = next.title;
    body = next.body;
    theme = next.theme;
    isChapter = next.isChapter;
    readEmit = next.readEmit;
    open = true;
    await window.setIgnoreCursorEvents(false);
    await delay(5000);
    open = false;
    while (isHover) {
      await delay(20);
    }
    await window.setIgnoreCursorEvents(true);
    await delay(700);
    isNotifying = false;
  }

  onMount(async () => {
    await moveWindow(Position.BottomRight);
    await window.setIgnoreCursorEvents(true);
    mainWindow = await Window.getByLabel("main");
  });

  listen("notificate", async (e) => {
    if (!isNotificationPayload(e.payload)) return;
    const payload: NotificationPayload = e.payload;
    queue.push(payload);
    notificate();
  });
</script>

<div
  class={cn(
    "size-full relative flex flex-col bg-transparent",
    theme === "dark" && "dark",
  )}
>
  <div
    onmouseenter={() => (isHover = true)}
    onmouseleave={() => {
      isHover = false;
    }}
    class={cn(
      "absolute duration-600 transition-all w-44",
      open || isHover ? "translate-y-0" : "translate-y-60",
    )}
    role="note"
  >
    <button
      onclick={async () => {
        if (isChapter) emit(readEmit);
        await mainWindow?.show();
        await mainWindow?.unminimize();
        await mainWindow?.setFocus();
        await window.setIgnoreCursorEvents(true);
        open = false;
        isHover = false;
        isNotifying = false;
      }}
      class="w-[27rem] h-[4.5rem] flex items-center justify-between gap-3 p-3 bg-sidebar rounded-xl cursor-default border-[0.5px] border-secondary"
    >
      <div class="h-full items-start">
        <img class="h-6 object-contain" src="/icon.png" alt="logo" />
      </div>
      <div class="w-[22rem] flex flex-col items-start">
        <Label class="w-[20rem] flex justify-start text-lg truncate">
          {title}
        </Label>
        <Label class="text-md !text-primary/60">{body}</Label>
      </div>
      <div class="h-full flex flex-col">
        <Button
          onclick={(e) => {
            e.stopImmediatePropagation();
            isHover = false;
            open = false;
          }}
          class="size-7 rounded-full p-2"
          variant="outline"
        >
          <Icon class="!size-4" icon="lucide:x" />
        </Button>
      </div>
    </button>
  </div>
</div>

<style>
  :global(body) {
    background-color: "transparent";
  }
</style>
