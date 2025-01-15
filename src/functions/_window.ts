import { getCurrentWindow } from "@tauri-apps/api/window";
import { get } from "svelte/store";

const currentWindow = getCurrentWindow();

export async function toggleFullscreen() {
  await currentWindow.setFullscreen(!(await currentWindow.isFullscreen()));
}

export async function setFullscreen(value: boolean) {
  await currentWindow.setFullscreen(value);
}
