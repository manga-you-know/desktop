import { fetch } from "@tauri-apps/plugin-http";
import { check, Update } from "@tauri-apps/plugin-updater";
import { message } from "@tauri-apps/plugin-dialog";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { isMobile, updateInfo, openUpdate, notifyUpdate } from "@/store";
import { notify, reloadApp } from "@/functions";
import { get } from "svelte/store";

const UPDATE_URL =
  "https://github.com/manga-you-know/desktop/releases/latest/download/latest.json";

const window = getCurrentWindow();
let isDownloaded = false;
let lastUpdateFound = "";

async function fetchUpdate(update: Update) {
  let downloaded = 0;
  let contentLength = 0;
  await update.download((event) => {
    switch (event.event) {
      case "Started":
        contentLength = event.data.contentLength || 0;
        console.log(`started downloading ${event.data.contentLength} bytes`);
        break;
      case "Progress":
        downloaded += event.data.chunkLength;
        console.log(`downloaded ${downloaded} from ${contentLength}`);
        break;
      case "Finished":
        console.log("download finished");
        break;
    }
  });
  isDownloaded = true;
}

export async function checkForAppUpdates(isUserClick: boolean = false) {
  if (!get(isMobile)) {
    const [update, response] = await Promise.all([check(), fetch(UPDATE_URL)]);
    if (update === null && !response.ok) {
      await message("Failed to check for updates.\nPlease try again later.", {
        title: "Error",
        kind: "error",
        okLabel: "OK",
      });
      return;
    } else if (update) {
      const isFocus = await window.isFocused();
      if (!isDownloaded) fetchUpdate(update);
      updateInfo.set({
        version: update.version,
        updateAvailable: true,
        changelog: update.body,
        url: `https://github.com/manga-you-know/desktop/releases/tag/v${update.version}`,
        fetchUpdate: async () => {
          while (!isDownloaded) {
            await new Promise((resolve) => setTimeout(resolve, 80));
          }
          await update.install();
          await reloadApp();
        },
      });
      openUpdate.set(true);
      if (!isFocus) {
        if (update.version !== lastUpdateFound && get(notifyUpdate)) {
          notify(
            `Update v${update.version} avaible!`,
            "Open the app to update"
          );
        }
        lastUpdateFound = update.version;
      }
    } else if (isUserClick) {
      updateInfo.set({
        updateAvailable: false,
        url: "",
        fetchUpdate: () => Promise.resolve(),
      });
      openUpdate.set(true);
    }
  }
}
