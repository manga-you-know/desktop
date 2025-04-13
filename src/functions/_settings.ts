import { load } from "@tauri-apps/plugin-store";
import { get } from "svelte/store";
import {
  selectedSource,
  libraryOrder,
  isAscending,
  autoSearchUpdates,
  preferableLanguage,
  autoEnterFullscreen,
  theme,
  appLanguage,
  lastPage,
  useMpv,
  closeTray,
  showOnlyNew,
  fitMode,
  viewMode,
  zoomLevel,
} from "@/store";
import { goto } from "$app/navigation";
import type { Language } from "@/interfaces";
import { setTheme } from "@tauri-apps/api/app";

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
    lLastPage,
    lUseMpv,
    lCloseTray,
    lShowOnlyNew,
    lViewMode,
    lFitMode,
    lZoomLevel,
  ] = await Promise.all([
    loadedSettings.get<string>("selected_source"),
    loadedSettings.get<boolean>("auto_search_updates"),
    loadedSettings.get<Language>("preferable_language"),
    loadedSettings.get<boolean>("auto_open_fullscreen"),
    loadedSettings.get<"dark" | "light" | undefined>("theme"),
    loadedSettings.get<string>("language"),
    loadedSettings.get<string>("order_by"),
    loadedSettings.get<boolean>("is_ascending"),
    loadedSettings.get<string>("last_page"),
    loadedSettings.get<boolean>("use_mpv"),
    loadedSettings.get<boolean>("close_tray"),
    loadedSettings.get<boolean>("show_only_new"),
    loadedSettings.get<string>("view_mode"),
    loadedSettings.get<string>("fit_mode"),
    loadedSettings.get<number>("zoom_level"),
  ]);
  selectedSource.set(lSelectedSource ?? "WeebCentral");
  autoSearchUpdates.set(lAutoSearchUpdates ?? true);
  preferableLanguage.set(lPreferableLanguage ?? { id: "en", label: "English" });
  autoEnterFullscreen.set(lAutoOpenFullscreen ?? true);
  closeTray.set(lCloseTray ?? false);
  theme.set(lTheme ?? "dark");
  appLanguage.set(lLanguage ?? "en");
  libraryOrder.set(lOrderBy ?? "id");
  isAscending.set(lIsAscending ?? true);
  lastPage.set(lLastPage ?? "/home");
  useMpv.set(lUseMpv ?? false);
  showOnlyNew.set(lShowOnlyNew ?? false);
  viewMode.set(lViewMode ?? "single");
  fitMode.set(lFitMode ?? "");
  zoomLevel.set(lZoomLevel ?? 100);
  if (get(lastPage) !== "/home") {
    goto(get(lastPage));
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
    loadedSettings.set("order_by", get(libraryOrder)),
    loadedSettings.set("is_ascending", get(isAscending)),
    loadedSettings.set("last_page", get(lastPage)),
    loadedSettings.set("use_mpv", get(useMpv)),
    loadedSettings.set("close_tray", get(closeTray)),
    loadedSettings.set("show_only_new", get(showOnlyNew)),
    loadedSettings.set("view_mode", get(viewMode)),
    loadedSettings.set("fit_mode", get(fitMode)),
    loadedSettings.set("zoom_level", get(zoomLevel)),
  ]);
}

export async function resetSettings() {
  const loadedSettings = await load("settings.json");
  await Promise.all([
    loadedSettings.set("selected_source", "WeebCentral"),
    loadedSettings.set("auto_search_updates", true),
    loadedSettings.set("preferable_language", { id: "en", label: "English" }),
    loadedSettings.set("auto_open_fullscreen", true),
    loadedSettings.set("theme", "dark"),
    loadedSettings.set("language", "en"),
    loadedSettings.set("order_by", "id"),
    loadedSettings.set("is_ascending", true),
    loadedSettings.set("last_page", "/home"),
    loadedSettings.set("use_mpv", false),
    loadedSettings.set("close_tray", false),
    loadedSettings.set("show_only_new", false),
    loadedSettings.set("view_mode", "single"),
    loadedSettings.set("fit_mode", ""),
    loadedSettings.set("zoom_level", 100),
  ]);
  await loadSettings();
}
