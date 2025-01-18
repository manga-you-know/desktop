import { load } from "@tauri-apps/plugin-store";
import { get } from "svelte/store";
import {
  selectedSource,
  orderBy,
  isAscending,
  autoSearchUpdates,
  preferableLanguage,
  autoEnterFullscreen,
  theme,
  appLanguage,
  defaultPage,
  useMpv,
} from "@/store";
import { goto } from "$app/navigation";
import { checkForAppUpdates } from "@/functions";
import type { Language } from "@/interfaces";

export async function loadSettings() {
  const loadedSettings = await load("settings.json");
  const [
    lSelectedSource,
    lAutoSearchUpdates,
    lPreferableLanguage,
    lAutoOpenFullscreen,
    lTheme,
    lLanguage,
    lOrderBy,
    lIsAscending,
    lDefaultPage,
    lUseMpv,
  ] = await Promise.all([
    loadedSettings.get<string>("selected_source"),
    loadedSettings.get<boolean>("auto_search_updates"),
    loadedSettings.get<Language>("preferable_language"),
    loadedSettings.get<boolean>("auto_open_fullscreen"),
    loadedSettings.get<string>("theme"),
    loadedSettings.get<string>("language"),
    loadedSettings.get<string>("order_by"),
    loadedSettings.get<boolean>("is_ascending"),
    loadedSettings.get<string>("default_page"),
    loadedSettings.get<boolean>("use_mpv"),
  ]);
  selectedSource.set(lSelectedSource ?? "MangaSee");
  autoSearchUpdates.set(lAutoSearchUpdates ?? true);
  preferableLanguage.set(lPreferableLanguage ?? { id: "en", label: "English" });
  autoEnterFullscreen.set(lAutoOpenFullscreen ?? true);
  theme.set(lTheme ?? "dark");
  appLanguage.set(lLanguage ?? "en");
  orderBy.set(lOrderBy ?? "id");
  isAscending.set(lIsAscending ?? true);
  defaultPage.set(lDefaultPage ?? "home");
  useMpv.set(lUseMpv ?? false);
  if (get(defaultPage) !== "home") {
    goto(`/${get(defaultPage)}`);
  }
}

export async function saveSettings() {
  const loadedSettings = await load("settings.json");
  await Promise.all([
    loadedSettings.set("selected_source", get(selectedSource)),
    loadedSettings.set("auto_search_updates", get(autoSearchUpdates)),
    loadedSettings.set("preferable_language", get(preferableLanguage)),
    loadedSettings.set("auto_open_fullscreen", get(autoEnterFullscreen)),
    loadedSettings.set("theme", get(theme)),
    loadedSettings.set("language", get(appLanguage)),
    loadedSettings.set("order_by", get(orderBy)),
    loadedSettings.set("is_ascending", get(isAscending)),
    loadedSettings.set("default_page", get(defaultPage)),
    loadedSettings.set("use_mpv", get(useMpv)),
  ]);
}

export async function resetSettings() {
  const loadedSettings = await load("settings.json");
  await Promise.all([
    loadedSettings.set("selected_source", "MangaSee"),
    loadedSettings.set("auto_search_updates", true),
    loadedSettings.set("preferable_language", { id: "en", label: "English" }),
    loadedSettings.set("auto_open_fullscreen", true),
    loadedSettings.set("theme", "dark"),
    loadedSettings.set("language", "en"),
    loadedSettings.set("order_by", "id"),
    loadedSettings.set("is_ascending", true),
    loadedSettings.set("default_page", "home"),
    loadedSettings.set("use_mpv", false),
  ]);
  await loadSettings();
}
