import { load } from "@tauri-apps/plugin-store";
import { get } from "svelte/store";
import {
  selectedSource,
  orderBy as orderBy,
  isAscending,
  autoSearchUpdates,
  favoriteLanguage,
  autoEnterFullscreen,
  theme,
  appLanguage,
} from "@/store";
import type { Language } from "@/interfaces";

const loadedSettings = await load("settings.json");

export async function loadSettings() {
  const [
    lSelectedSource,
    lAutoSearchUpdates,
    lAavoriteLanguage,
    lAutoOpenFullscreen,
    lTheme,
    lLanguage,
    lOrderBy,
    lIsAscending,
  ] = await Promise.all([
    loadedSettings.get<string>("selected_source"),
    loadedSettings.get<boolean>("auto_search_updates"),
    loadedSettings.get<Language>("favorite_language"),
    loadedSettings.get<boolean>("auto_open_fullscreen"),
    loadedSettings.get<string>("theme"),
    loadedSettings.get<string>("language"),
    loadedSettings.get<string>("order_by"),
    loadedSettings.get<boolean>("is_ascending"),
  ]);
  selectedSource.set(lSelectedSource ?? "MangaSee");
  autoSearchUpdates.set(lAutoSearchUpdates ?? true);
  favoriteLanguage.set(lAavoriteLanguage ?? { id: "en", label: "English" });
  autoEnterFullscreen.set(lAutoOpenFullscreen ?? true);
  theme.set(lTheme ?? "dark");
  appLanguage.set(lLanguage ?? "en");
  orderBy.set(lOrderBy ?? "id");
  isAscending.set(lIsAscending ?? true);
}

export async function saveSettings() {
  await Promise.all([
    loadedSettings.set("selected_source", get(selectedSource)),
    loadedSettings.set("auto_search_updates", get(autoSearchUpdates)),
    loadedSettings.set("favorite_language", get(favoriteLanguage)),
    loadedSettings.set("auto_open_fullscreen", get(autoEnterFullscreen)),
    loadedSettings.set("theme", get(theme)),
    loadedSettings.set("language", get(appLanguage)),
    loadedSettings.set("order_by", get(orderBy)),
    loadedSettings.set("is_ascending", get(isAscending)),
  ]);
}

export async function resetSettings() {
  await Promise.all([
    loadedSettings.set("selected_source", "MangaSee"),
    loadedSettings.set("auto_search_updates", true),
    loadedSettings.set("favorite_language", { id: "en", label: "English" }),
    loadedSettings.set("auto_open_fullscreen", true),
    loadedSettings.set("theme", "dark"),
    loadedSettings.set("language", "en"),
    loadedSettings.set("order_by", "id"),
    loadedSettings.set("is_ascending", true),
  ]);
  await loadSettings();
}
