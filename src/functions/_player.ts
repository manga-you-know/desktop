import { Command } from "@tauri-apps/plugin-shell";
import { autoEnterFullscreen } from "@/store";
import type { Episode } from "@/interfaces";
import { get } from "svelte/store";

export async function openPlayer(episode: Episode, title?: string) {
  const command = Command.create("powershell", [
    "mpv",
    `"${episode.url}"`,
    episode.subtitles?.map((s) => `--sub-file=${s.file}`).join(" ") ?? "",
    `--http-header-fields=${Object.entries(episode.headers ?? {})
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ")}`,
    get(autoEnterFullscreen) ? "--fs" : "",
    // "--focus-on-open",
    `--title="${title ?? "MangaYouKnow videos!"}"`,
    "--sub-scale=0.7",
    // '--no-border',
    //  '--ontop',
    // '--save-position-on-quit',
    // '--no-resume-playback',
  ]);
  command.on("close", (data) => {
    console.log(
      `command finished with code ${data.code} and signal ${data.signal}`
    );
  });
  command.on("error", (error) => console.error(`command error: "${error}"`));
  command.stdout.on("data", (line) => console.log(`command stdout: "${line}"`));
  command.stderr.on("data", (line) => console.log(`command stderr: "${line}"`));
  await command.execute();
}
