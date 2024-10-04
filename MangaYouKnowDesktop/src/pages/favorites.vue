<script setup lang="ts">
    import { FavoriteDB } from '~/database';
    import type { Favorite, User } from '~/models';
    const user = useState<User>('user')
    const query = ref('')
    const isLoading = ref(false)
    const favorites = useState<Favorite[]>('favorites', () => [])
    async function search() {
        isLoading.value = true
        favorites.value = await FavoriteDB.getFavorites(user.value.id, query.value)
        isLoading.value = false
    }
    onMounted(async () => {
        favorites.value = await FavoriteDB.getFavorites(user.value.id)
    })
</script>


<template>
    <div class="w-full h-full ">
        <div class="w-full h-12 mt-2 flex justify-center ">
            <div >
                <UInput 
                    v-model="query"
                    v-on:update:model-value="search"
                    :loading="isLoading" 
                    placeholder="Search..." 
                    color="cyan"
                    icon="i-heroicons-magnifying-glass-solid" 
                    class="w-full"
                />
            </div>
        </div>
        <div class="w-full pb-5 flex flex-row justify-start gap-2 flex-wrap">
            <div 
                class=""
                v-for="favorite in favorites" 
                :key="favorite.name">
                <FavoriteCard :favorite="favorite" />
            </div>
        </div>
    </div> 
</template>

