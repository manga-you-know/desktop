import { getCurrentWindow } from "@tauri-apps/api/window";
import { load } from "@tauri-apps/plugin-store";
export default defineNuxtRouteMiddleware(async (to, from) => {
  const currentlyPage = useState<string>("currentlyPage");
  const window = getCurrentWindow();
  const config = await load("config.json");
  const activeSidebar = useState<boolean>("activeSidebar");
  const isFavoriteOpen = useState<boolean>("isFavoriteOpen");
  const isSelecting = useState<boolean>("isSelecting");
  currentlyPage.value = "/myk.svg";
  isSelecting.value = false;
  isFavoriteOpen.value = false;
  activeSidebar.value = !to.path.startsWith("/read");
  const autoEnter = await config.get<boolean>("auto_enter_fullscreen");
  if (to.path.startsWith("/read")) window.setFullscreen(autoEnter ?? false);
  if (from.path.startsWith("/read") && autoEnter) window.setFullscreen(false);
  if (to.path === "/reader") return navigateTo("/");
  if (!to.path.startsWith("/reader"))
    window.setTitle(`MangaYouKnow - ${to.meta.name}`);
});
