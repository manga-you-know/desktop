import { goto } from "$app/navigation";
import { isFullscreen, defaultPage, autoEnterFullscreen } from "@/store";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { get } from "svelte/store";

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
