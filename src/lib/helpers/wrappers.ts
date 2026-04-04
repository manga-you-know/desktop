import { fetch as f, type ClientOptions } from "@tauri-apps/plugin-http";

export function fetch(
  input: URL | Request | string,
  init: RequestInit & {
    bodyC?: Record<string, any>;
    args?: Record<string, string>;
  } & ClientOptions = {},
): Promise<Response> {
  if (init.args) {
    input +=
      "?" +
      Object.entries(init.args)
        .map((k, v) => `${k}=${v}`)
        .join("&");
  }
  if (init.bodyC) init.body = JSON.stringify(init.bodyC);
  return f(input, init);
}
