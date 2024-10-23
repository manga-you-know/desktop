export default defineNuxtRouteMiddleware((to, from) => {
	const activeSidebar = useState<boolean>('activeSidebar');
	const isFavoriteOpen = useState<boolean>('isFavoriteOpen');
	isFavoriteOpen.value = false;
	activeSidebar.value = !to.path.startsWith('/reader');
	if (to.path === '/reader') return navigateTo('/')
})
