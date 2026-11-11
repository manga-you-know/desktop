import { fetch } from "@tauri-apps/plugin-http";

const cache = new Map<string, Promise<string>>();

export function loadBlobUrl(url: string): Promise<string> {
  let p = cache.get(url);
  if (!p) {
    p = fetch(url).then(async (res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return URL.createObjectURL(await res.blob());
    });
    p.catch(() => cache.delete(url)); // allow retry after a failure
    cache.set(url, p);
  }
  return p;
}
