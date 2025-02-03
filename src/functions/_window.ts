import { isFullscreen, defaultPage, autoEnterFullscreen } from "@/store";
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
