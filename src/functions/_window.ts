import {
  isFullscreen,
  lastPage,
  autoEnterFullscreen,
  discordIntegration,
} from "@/store";
import { start, setActivity, stop } from "tauri-plugin-drpc";
import { readFile } from "@tauri-apps/plugin-fs";
import {
  Activity,
  Button,
  Assets,
  ActivityType,
} from "tauri-plugin-drpc/activity";
import { TrayIcon, type TrayIconEvent } from "@tauri-apps/api/tray";
import { Menu } from "@tauri-apps/api/menu";
import { defaultWindowIcon, getVersion } from "@tauri-apps/api/app";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { fetch } from "@tauri-apps/plugin-http";
import { load } from "@tauri-apps/plugin-store";
import { get } from "svelte/store";
import { goto } from "$app/navigation";
import { toast } from "svelte-sonner";
import { type } from "@tauri-apps/plugin-os";
import {
  writeImageBase64,
  writeImageBinary,
  writeText,
} from "tauri-plugin-clipboard-api";
import { titleCase } from "@/utils";
import { FavoriteDB } from "@/repositories";
import { loadIcons } from "@iconify/svelte";
import { DISCORD_WEBHOOK_URL, ICONS_TO_LOAD } from "@/constants";
import { relaunch } from "@tauri-apps/plugin-process";
import { invoke } from "@tauri-apps/api/core";

const currentWindow = getCurrentWindow();
let isMaximized = false;

export async function getEnv(key: string): Promise<string> {
  return await invoke("get_env", { name: key });
}

export async function toggleFullscreen() {
  const isFullscreenNow = await currentWindow.isFullscreen();
  const isMaximizedNow = await currentWindow.isMaximized();
  if (!isFullscreenNow && isMaximizedNow) await currentWindow.unmaximize();
  await currentWindow.setFullscreen(!isFullscreenNow);
  if (isFullscreenNow && isMaximized) await currentWindow.maximize();
  isMaximized = isMaximizedNow;
  isFullscreen.set(!isFullscreenNow);
}

export async function setFullscreen(value: boolean) {
  const isMaximizedNow = await currentWindow.isMaximized();
  if (value && isMaximizedNow) await currentWindow.unmaximize();
  await currentWindow.setFullscreen(value);
  if (!value && isMaximized) await currentWindow.maximize();
  isMaximized = isMaximizedNow;
  isFullscreen.set(value);
}

export async function copyText(text: string, textType?: string) {
  await writeText(text);
  toast.info(titleCase(textType ?? "Text") + " copied!");
}

export async function copyImageFromPath(path: string) {
  const file = await readFile(path);
  let binary = "";
  const chunkSize = 0x8000; // 32KB chunks
  for (let i = 0; i < file.length; i += chunkSize) {
    const chunk = file.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  const b64 = "data:image/png;base64," + btoa(binary);
  await copyImageBase64(b64);
}

export async function copyImageBase64(imageBase64: string) {
  await writeImageBase64(imageBase64.replace(/^data:image\/\w+;base64,/, ""));
  toast.success("Image copied!");
}

export async function goDefaultPage() {
  const defaultPag = get(lastPage);
  if (get(autoEnterFullscreen)) {
    await setFullscreen(false);
  }
  goto(`/${defaultPag}`);
}

export async function reloadApp() {
  await relaunch();
}

export function loadAppIcons() {
  loadIcons(ICONS_TO_LOAD);
}

export async function sendMessageDiscord(message: string) {
  await fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: message,
    }),
  });
}

export async function sendLogDiscord() {
  const favsLength = (await FavoriteDB.getRawFavorites()).length;
  await sendMessageDiscord(`
### User logged! S2
- Date: **${Date()}**
- Version: **${await getVersion()}**
- Platform: **${titleCase(type())}**
- Favorites: **${favsLength}** of em!`);
}

export async function logNewUser() {
  const loadedSettings = await load("settings.json");
  const hasLogged = await loadedSettings.get<boolean>("has_logged_2");
  if (!hasLogged) {
    sendLogDiscord();
    await loadedSettings.set("has_logged_2", true);
  }
}

export async function startDiscordPresence() {
  // try {
  //   if (get(discordIntegration)) await start("1336775889366552597");
  // } catch (e) {
  //   console.log(e);
  // }
}

export async function setDiscordActivity(details: string, state?: string) {
  // if (!get(discordIntegration)) return;
  // await startDiscordPresence();
  // const button = new Button(
  //   "Download app",
  //   "https://github.com/manga-you-know/desktop/releases/latest/"
  // );
  // const activity = new Activity()
  //   .setButton([button])
  //   .setActivity(ActivityType.Watching)
  //   .setDetails(details);
  // if (state) {
  //   activity.setState(state);
  // }
  // await setActivity(activity);
}

export async function stopDiscordPresence() {
  // await stop();
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
