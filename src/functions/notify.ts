import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import { customNotificator, theme } from "@/store";
import { get } from "svelte/store";
import { emit } from "@tauri-apps/api/event";

export async function notify(title: string, body: string, readEmit?: string, isChapter = false,) {
  if (!get(customNotificator)) {
    let permissionGranted = await isPermissionGranted();
    if (!permissionGranted) {
      const permission = await requestPermission();
      permissionGranted = permission === "granted";
    }
    if (permissionGranted) {
      sendNotification({ title, body, });
    }
  } else {
    emit("notificate", { title, body, isChapter, theme: get(theme), readEmit })
  }
}
