<script lang="ts">
  import "@/app.css";
  import { Button, Label } from "@/lib/components";
  import { cn } from "@/lib/utils";
  import { delay } from "@/utils";
  import type { NotificationPayload } from "@/types";
  import { emit, listen } from "@tauri-apps/api/event";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { moveWindow, Position } from "@tauri-apps/plugin-positioner";
  import { onMount } from "svelte";
  import Icon from "@iconify/svelte";

  const window = getCurrentWindow();

  let open = $state(false);
  let isHover = $state(false);
  let theme = $state("dark");
  let title = $state("");
  let body = $state("");
  let isChapter = $state(false);
  let readEmit = $state("");
  let queue: NotificationPayload[] = $state([]);

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
  async function notificate(payload: NotificationPayload, isQueue = false) {
    while (isHover || open) {
      await delay(20);
    }
    if (isQueue) {
      await delay(500);
    }
    theme = payload.theme;
    title = payload.title;
    body = payload.body;
    isChapter = payload.isChapter;
    readEmit = payload.readEmit;
    open = true;
    await window.setIgnoreCursorEvents(false);
    await delay(2600);
    open = false;
    const next = queue.shift();
    if (next) {
      notificate(next, true);
    }
    if (!isHover) await window.setIgnoreCursorEvents(true);
  }

  onMount(async () => {
    await moveWindow(Position.BottomRight);
    await window.setIgnoreCursorEvents(true);
  });

  listen("notificate", async (e) => {
    if (!isNotificationPayload(e.payload)) return;
    const payload: NotificationPayload = e.payload;
    queue.push(payload);
    if (!open && !isHover && queue.length === 1) {
      queue.length = 0;
      notificate(payload);
    }
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
      if (!open) window.setIgnoreCursorEvents(true);
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
        await window.show();
        await window.setFocus();
        open = false;
        isHover = false;
        await window.setIgnoreCursorEvents(true);
      }}
      class="w-[27rem] h-[4.5rem] flex items-center justify-between gap-3 p-3 bg-sidebar rounded-xl cursor-default border-[0.5px] border-secondary"
    >
      <div class="h-full items-start">
        <img class="h-6 object-contain" src="/icon.png" alt="logo" />
      </div>
      <div class="w-full flex flex-col items-start">
        <Label class="text-lg truncate">{title}</Label>
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
