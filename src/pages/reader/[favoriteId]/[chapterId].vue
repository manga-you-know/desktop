<script setup lang="ts">
	import { getCurrentWindow } from '@tauri-apps/api/window';
	import { FavoriteDB, ReadedDB } from '~/database';
	import { addReadedBelow } from '~/functions';
	import type { DownloadManager } from '~/managers';
	import { Chapter } from '~/models';
	
	const { favoriteId, chapterId } = useRoute().params;
	const dlManager = useState<DownloadManager>('dlManager');
	const pages = ref<string[]>([]);
	const favorite = await FavoriteDB.getFavorite(favoriteId);
	const chapters = useState<Chapter[]>('chapters');
	let foundChapter = chapters.value?.find((chapter) => chapter.chapter_id == chapterId);
	if (!foundChapter) {
		//@ts-ignore
		foundChapter = new Chapter(0, '', chapterId, favorite.source);
	}
	const chapter = ref<Chapter>(foundChapter);
	const currentlyCount = useState<number>('currentlyCount', () => 1);
	const totalPage = useState<number>('totalPage');
	const currentlyPage = useState<string>('currentlyPage');
	const openMenuChapters = ref(false);
	
	function toNextPage() {
		if (currentlyCount.value === totalPage.value) return;
		currentlyCount.value++; 
		currentlyPage.value = pages.value[currentlyCount.value - 1];
	}
	function toPrevPage() {
		if (currentlyCount.value === 1) return;
		currentlyCount.value--;
		currentlyPage.value = pages.value[currentlyCount.value - 1];
	}
	async function readNextOrPrevChapter(way: 'next' | 'prev' = 'next') {
		const nextChapter =
			chapters.value[
				chapters.value.indexOf(chapter.value) - (way === 'next' ? 1 : -1)
			];
		pages.value = await dlManager.value.getChapterImages(nextChapter);
		chapter.value = nextChapter;
		currentlyCount.value = 1;
		currentlyPage.value = pages.value[currentlyCount.value - 1];
		totalPage.value = pages.value.length;
		fetchPages();
		await addReadedBelow(
			chapter.value,
			chapters.value,
			favorite,
			undefined,
			true,
		);
		closeMenu();
	}
	async function fetchPages() {
		useHead({
			title: favorite.name,
			link: pages.value.map((image) => {
				return {
					rel: 'preload',
					href: image,
					as: 'image',
				};
			}),
		});
	}
	function closeMenu() {
		openMenuChapters.value = false;
	}
	defineShortcuts(
		{
			f4: {
				usingInput: true,
				handler: () => {
					navigateTo(useRoute().redirectedFrom);
					getCurrentWindow().setFullscreen(false);
				},
			},
			arrowleft: {
				usingInput: true,
				handler: toPrevPage,
			},
			arrowright: {
				usingInput: true,
				handler: toNextPage,
			},
		},
		{ chainDelay: 400 },
	);
	onBeforeMount(async () => {
		await addReadedBelow(chapter.value, chapters.value, favorite, undefined, true);
	});
	onMounted(async () => {
		pages.value = await dlManager.value.getChapterImages(chapter.value);
		totalPage.value = pages.value.length;
		currentlyPage.value = pages.value[0];
		currentlyCount.value = 1;
		getCurrentWindow().setFullscreen(true);
		fetchPages();
	});
</script>

<template>
	<MenuChaptersSlideover
		v-model="openMenuChapters"
		:chapters="chapters" 
		:currentlyChapter="chapter"
		:readChapterNextOrPrev="readNextOrPrevChapter"
		:closeMenu="closeMenu"
	/>
	<div class="fixed w-screen h-screen flex">
			<button class="w-[50%] cursor-default outline-none border-none" tabindex="-1" @click="toPrevPage"/>
			<button class="w-[50%] cursor-default outline-none border-none" tabindex="-1" @click="toNextPage"/>
	</div>
	<div class="fixed w-screen gap-1 p-[1%] flex justify-end pointer-events-none">
			<UBadge class="m-1" color="white" variant="solid" >
					{{ currentlyCount }} / {{ totalPage }}
			</UBadge>
			<UButton
					class="pointer-events-auto"
					icon="i-heroicons-bars-3-solid"
					color="gray"
					@click="openMenuChapters = true"
			/>
			<UPopover 
					mode="hover"
					:popper="{ arrow: true, placement: 'left-start' }"
					class="pointer-events-auto"
			>
					<UButton
							icon="nimbus:arrows-horizontal"
							color="gray"
					/>
					<template #panel>
							<div class="p-2 gap-1 flex flex-row rounded-lg">
									<UButton
											icon="i-heroicons-arrow-left-solid"
											color="gray"
											@click="readNextOrPrevChapter('prev')"
									/>
									<UButton
											icon="i-heroicons-arrow-right-solid"
											color="gray"
											@click="readNextOrPrevChapter('next')"
									/>
							</div>
					</template>
			</UPopover>
	</div>
	<div>
			<NuxtImg :src=currentlyPage placeholder class="object-contain w-screen h-screen max-w-screen  max-h-screen" /> 
	</div>
</template>