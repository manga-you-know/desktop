<script setup lang="ts">
	import { FavoriteDB } from '~/database';
	import { Favorite, User } from '~/models';

	const isEditFavoriteOpen = useState<Boolean>('isEditFavoriteOpen')
	const favorite = useState<Favorite>('favorite')
	const user = useState<User>('user')
	const isLoading = ref(false)
	const name = ref(favorite.value.name)
	const cover = ref(favorite.value.cover)
	const extra_name = ref(favorite.value.extra_name)
	const title_color = ref(favorite.value.title_color)
	const card_color = ref(favorite.value.card_color)
	const grade = ref(favorite.value.grade)
	const author = ref(favorite.value.author)

	async function onClose() {
		isEditFavoriteOpen.value = false
		await new Promise(resolve => {
			setTimeout(() => {
				resolve(true)
			}, 10)
		})
	}
	async function updateFavorite() {
		favorite.value.name = name.value || favorite.value.name
		favorite.value.cover = cover.value || favorite.value.cover
		favorite.value.extra_name = extra_name.value || favorite.value.extra_name
		favorite.value.title_color = title_color.value || favorite.value.title_color
		favorite.value.card_color = card_color.value || favorite.value.card_color
		favorite.value.grade = grade.value || 0
		favorite.value.author = author.value || favorite.value.author
		await FavoriteDB.updateFavorite(favorite.value)
	}

</script>

<template>
	<UModal class="rounded-xl" @close="onClose">
		<UInput v-model:model-value="name" v-on:update:model-value="updateFavorite"/>
		<UInput v-model:model-value="cover" v-on:update:model-value="updateFavorite" />
	</UModal>
</template>
