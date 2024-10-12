<script setup lang="ts">
import { getCurrentWindow } from '@tauri-apps/api/window';
import type { Chapter } from '~/models';
const isOpen = ref(false)
const { chapters, currentlyChapter } = defineProps<{
	chapters: Chapter[],
	currentlyChapter: Chapter
}>()

const isDivMainHidden = useState<Boolean>('isDivMainHidden', () => true)
</script>

<template>
	<USlideover v-model="isOpen">
		<div>
			<div class="w-full h-11 flex justify-center items-center">
				<UButton
					@click="() => {
						isOpen = false
						isDivMainHidden = false
						getCurrentWindow().setFullscreen(false)
					}"
					icon="i-heroicons-home"
				/>
			</div>
			<UDivider class="w-full h-1"/>
		</div>
	</USlideover>
</template>