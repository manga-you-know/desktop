import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { ask, message } from "@tauri-apps/plugin-dialog";
import { fetch } from "@tauri-apps/plugin-http";

export async function checkForAppUpdates(onUserClick: boolean = false) {
  const [update, response] = await Promise.all([
    check(),
    fetch(
      "https://github.com/manga-you-know/desktop/releases/latest/download/latest.json",
    ),
  ]);

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
      },
    );
    if (yes) {
      let downloaded = 0;
      let contentLength = 0;
      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            contentLength = event.data.contentLength || 0;
            console.log(
              `started downloading ${event.data.contentLength} bytes`,
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
  } else if (onUserClick) {
    await message("You are on the latest version. Stay awesome!", {
      title: "No Update Available",
      kind: "info",
      okLabel: "OK",
    });
  }
}
