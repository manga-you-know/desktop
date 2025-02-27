import { fetch } from "@tauri-apps/plugin-http";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { message } from "@tauri-apps/plugin-dialog";
import { isMobile, updateInfo, openUpdate } from "@/store";
import { get } from "svelte/store";

const UPDATE_URL =
  "https://github.com/manga-you-know/desktop/releases/latest/download/latest.json";

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
    } else if (update?.available) {
      updateInfo.set({
        version: update.version,
        updateAvaible: true,
        changelog: update.body,
        url: `https://github.com/manga-you-know/desktop/releases/tag/${update.version}`,
        fetchUpdate: async () => {
          let downloaded = 0;
          let contentLength = 0;
          await update.downloadAndInstall((event) => {
            switch (event.event) {
              case "Started":
                contentLength = event.data.contentLength || 0;
                console.log(
                  `started downloading ${event.data.contentLength} bytes`
                );
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
          await relaunch();
        },
      });
      openUpdate.set(true);
    } else if (isUserClick) {
      updateInfo.set({
        updateAvaible: false,
        url: "",
        fetchUpdate: () => Promise.resolve(),
      });
      openUpdate.set(true);
    }
  }
}
