import { fetch } from "@tauri-apps/plugin-http";
import { check, Update } from "@tauri-apps/plugin-updater";
import { message } from "@tauri-apps/plugin-dialog";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { updateInfo, openUpdate, notifyUpdate } from "@/store";
import { notify, reloadApp } from "@/functions";
import { get } from "svelte/store";
import { IS_MOBILE } from "@/constants";

const UPDATE_URL =
  "https://github.com/manga-you-know/desktop/releases/latest/download/latest.json";

const window = getCurrentWindow();
let isDownloaded = false;

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
  if (!IS_MOBILE) {
    const [update, response] = await Promise.all([check(), fetch(UPDATE_URL)]);
    if (update === null && !response.ok) {
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
        if (get(notifyUpdate)) {
          notify(
            `Update v${update.version} avaible!`,
            "Open the app to update"
          );
        }
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
