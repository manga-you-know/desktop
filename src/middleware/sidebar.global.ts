import { getCurrentWindow } from '@tauri-apps/api/window';
export default defineNuxtRouteMiddleware((to, from) => {
	const window = getCurrentWindow();
	const activeSidebar = useState<boolean>('activeSidebar');
	const isFavoriteOpen = useState<boolean>('isFavoriteOpen');
	isFavoriteOpen.value = false;
	activeSidebar.value = !to.path.startsWith('/reader');
	window.setFullscreen(to.path.startsWith('/reader'));
	if (to.path === '/reader') return navigateTo('/')
	if (!to.path.startsWith('/reader')) window.setTitle(`MangaYouKnow - ${to.meta.name}`)
})
