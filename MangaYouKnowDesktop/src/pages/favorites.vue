<script setup lang="ts">
    import type { Favorite } from '@prisma/client';

    const favorites = useState<Favorite[]>('favorites', () => [])
    //@ts-ignore
    favorites.value = await $fetch('/api/favorites')
</script>


<template class="w-full h-full ">
    <div>
        <div class="h-12">
            
        </div>
        <div class="flex flex-row flex-wrap">
            <div 
                class=""
                v-for="favorite in favorites" 
                :key="favorite.name">
                <FavoriteCard :favorite="favorite" />
            </div>
        </div>
    </div>
</template>

