import { getCurrentWindow } from "@tauri-apps/api/window";
import { load } from "@tauri-apps/plugin-store";
export default defineNuxtRouteMiddleware(async (to, from) => {
  const window = getCurrentWindow();
  const config = await load("config.json");
  const activeSidebar = useState<boolean>("activeSidebar");
  const isFavoriteOpen = useState<boolean>("isFavoriteOpen");
  const isSelecting = useState<boolean>("isSelecting");
  isSelecting.value = false;
  isFavoriteOpen.value = false;
  activeSidebar.value = !to.path.startsWith("/reader");
  const autoEnter = await config.get<boolean>("auto_enter_fullscreen");
  window.setFullscreen((to.path.startsWith("/reader") && autoEnter) || false);
  if (to.path === "/reader") return navigateTo("/");
  if (!to.path.startsWith("/reader"))
    window.setTitle(`MangaYouKnow - ${to.meta.name}`);
});
