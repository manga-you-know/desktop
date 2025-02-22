import { fetch } from "@tauri-apps/plugin-http";
import { version } from "@tauri-apps/plugin-os";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { ask, message } from "@tauri-apps/plugin-dialog";
import { open as openPath } from "@tauri-apps/plugin-shell";
import { isMobile } from "@/store";
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
      const yes = await ask(
        `Update to ${update.version} is available!\n\nRelease url: https://github.com/manga-you-know/desktop/releases/tag/${update.version}\n\nDo you want to update now?`,
        {
          title: "New Update Available",
          kind: "info",
          okLabel: "Update",
          cancelLabel: "Cancel",
        }
      );
      if (yes) {
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
      }
    } else if (isUserClick) {
      await message("You are on the latest version. Stay awesome!", {
        title: "No Update Available",
        kind: "info",
        okLabel: "OK",
      });
    }
  } else {
    const update = await fetch(UPDATE_URL);
    if (update.ok) {
      const data = await update.json();
      if (data.version != version()) {
        const yes = await ask(
          `Update to ${data.version} is available!\n\nRelease url: https://github.com/manga-you-know/desktop/releases/tag/${data.version}\n\nDo you want to update now?`,
          {
            title: "New Update Available",
            kind: "info",
            okLabel: "Open to download",
            cancelLabel: "Cancel",
          }
        );
        if (yes) {
          await openPath(
            "https://github.com/manga-you-know/desktop/releases/tag/" +
              data.version
          );
        }
      } else if (isUserClick) {
        await message("You are on the latest version. Stay awesome!", {
          title: "No Update Available",
          kind: "info",
          okLabel: "OK",
        });
      }
    }
  }
}
