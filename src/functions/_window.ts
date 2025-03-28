import { isFullscreen, defaultPage, autoEnterFullscreen } from "@/store";
import { start, setActivity, destroy } from "tauri-plugin-drpc";
import {
  Activity,
  Button,
  Assets,
  ActivityType,
} from "tauri-plugin-drpc/activity";
import { TrayIcon, type TrayIconEvent } from "@tauri-apps/api/tray";
import { Menu } from "@tauri-apps/api/menu";
import { defaultWindowIcon } from "@tauri-apps/api/app";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { load } from "@tauri-apps/plugin-store";
import { get } from "svelte/store";
import { goto } from "$app/navigation";

const currentWindow = getCurrentWindow();

export async function toggleFullscreen() {
  await currentWindow.setFullscreen(!(await currentWindow.isFullscreen()));
  isFullscreen.set(await currentWindow.isFullscreen());
}

export async function setFullscreen(value: boolean) {
  await currentWindow.setFullscreen(value);
  isFullscreen.set(await currentWindow.isFullscreen());
}

export async function goDefaultPage() {
  const defaultPag = get(defaultPage);
  if (get(autoEnterFullscreen)) {
    await setFullscreen(false);
  }
  goto(`/${defaultPag}`);
}

export async function startDiscordPresence() {
  try {
    await start("1336775889366552597");
  } catch (e) {
    console.log(e);
  }
}

export async function setDiscordActivity(details: string, state?: string) {
  await startDiscordPresence();
  const button = new Button(
    "Download app",
    "https://github.com/manga-you-know/desktop/releases/latest/"
  );
  const activity = new Activity()
    .setButton([button])
    .setActivity(ActivityType.Watching)
    .setDetails(details);
  if (state) {
    activity.setState(state);
  }
  await setActivity(activity);
}

export async function stopDiscordPresence() {
  setDiscordActivity("Slacking off...");
}

export async function createTray() {
  const store = await load("settings.json");
  if (!((await store.get("start_in_tray")) ?? false)) {
    currentWindow.show();
    currentWindow.setFocus();
  }
  const exists = await TrayIcon.getById("myk-tray");
  if (exists !== null) {
    return;
  }
  const menu = await Menu.new({
    items: [
      {
        id: "open",
        text: "Open",
        action: async () => {
          await currentWindow.show();
          await currentWindow.setFocus();
        },
      },
      {
        id: "hide",
        text: "Hide",
        action: async () => {
          await currentWindow.hide();
        },
      },
      {
        id: "quit",
        text: "Quit",
        action: () => {
          currentWindow.destroy();
        },
      },
    ],
  });
  const options = {
    id: "myk-tray",
    icon: (await defaultWindowIcon()) ?? "/icon.png",
    tooltip: "MangaYouKnow",
    menu: menu,
    menuOnLeftClick: false,
    action: async (e: TrayIconEvent) => {
      if (e.type === "DoubleClick") {
        await currentWindow.show();
        await currentWindow.setFocus();
      }
    },
  };
  const tray = await TrayIcon.new(options);
}
