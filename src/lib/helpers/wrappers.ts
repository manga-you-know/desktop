import { fetch as f, type ClientOptions } from "@tauri-apps/plugin-http";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";

export function fetch(
  input: URL | Request | string,
  init: RequestInit & {
    bodyC?: Record<string, any>;
    args?: Record<string, string>;
  } & ClientOptions = {},
): Promise<Response> {
  if (init?.args) {
    input +=
      "?" +
      Object.entries(init.args)
        .map((k, v) => `${k}=${v}`)
        .join("&");
  }
  if (init?.bodyC) init.body = JSON.stringify(init.bodyC);
  return f(input, init);
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
