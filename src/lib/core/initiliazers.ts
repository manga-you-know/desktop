import { Command } from "@tauri-apps/plugin-shell";
import { fetch } from "@/lib/helpers";
import { suwayomiUrl } from "@/states";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";

const command = Command.sidecar("binaries/suwayomi");
command.on("error", (err) => {
  console.log("Error in Suwayomi: ", err);
});

export async function startSuwayomi() {
  fetch(suwayomiUrl.value)
    .then((r) => {
      if (!r.ok) command.spawn();
    })
    .catch((e) => {
      console.log(e);
      command.spawn();
    });
}

export async function notify(title: string, body: string) {
  let permissionGranted = await isPermissionGranted();
  if (!permissionGranted) {
    const permission = await requestPermission();
    permissionGranted = permission === "granted";
  }
  if (permissionGranted) {
    sendNotification({ title, body });
  }
}
