<script setup lang="ts">
    import type { Favorite, User } from '@prisma/client';
    const user = useState<User>('user')
    const query = ref('')
    const isLoading = ref(false)
    const favorites = useState<Favorite[]>('favorites', () => [])
    async function search() {
        isLoading.value = true
        try {
            //@ts-ignore
            favorites.value = await $fetch('/api/favorites', {
                method: 'GET',
                params: {
                    userId: user.value.id,
                    query: query.value,
                }
            })
        } catch (error) {
            console.log(error)
        } finally {
            isLoading.value = false
        }
    }
    onMounted(async () => {
        //@ts-ignore
        favorites.value = await $fetch('/api/favorites', {
            method: 'GET',
            params: {
                userId: user.value.id,
            }
        })
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
                    icon="i-heroicons-magnifying-glass-solid" 
                    class="w-full"
                />
            </div>
        </div>
        <div class="w-full  flex flex-row justify-start gap-2 flex-wrap">
            <div 
                class=""
                v-for="favorite in favorites" 
                :key="favorite.name">
                <FavoriteCard :favorite="favorite" />
            </div>
        </div>
    </div> 
</template>

