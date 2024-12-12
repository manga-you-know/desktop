import { getCurrentWindow } from "@tauri-apps/api/window";
import { load } from "@tauri-apps/plugin-store";
import { invoke } from "@tauri-apps/api/core";
import { UserRepository } from "~/repositories";
import type { User } from "~/models";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useState<User>("user");
  if (to.path.includes("mode")) {
    if (to.path.includes("mode")) {
      const data = await invoke("get_data", { key: to.query.key });
      //@ts-ignore
      const userData = await UserRepository.getUser(data.user_id);
      user.value = userData;
    } else {
      return navigateTo("/");
    }
  }
  const currentlyPage = useState<string>("currentlyPage");
  const window = getCurrentWindow();
  const config = await load("config.json");
  const activeSidebar = useState<boolean>("activeSidebar");
  const isFavoriteOpen = useState<boolean>("isFavoriteOpen");
  const isSelecting = useState<boolean>("isSelecting");
  currentlyPage.value = "/myk.png";
  isSelecting.value = false;
  isFavoriteOpen.value = false;
  activeSidebar.value = !to.path.startsWith("/read");
  const autoEnter = await config.get<boolean>("auto_enter_fullscreen");
  const isFullscreen = await window.isFullscreen();
  if (to.path.startsWith("/read") && autoEnter && !isFullscreen)
    window.setFullscreen(true);
  if (
    from.path.startsWith("/read") &&
    !to.path.startsWith("/read") &&
    autoEnter
  )
    window.setFullscreen(false);
  if (to.path === "/reader") return navigateTo("/");
  if (!to.path.startsWith("/reader"))
    window.setTitle(`MangaYouKnow - ${to.meta.name}`);
});
