<script lang="ts" setup>
import type { Favorite } from '~/models';
import { FavoriteRepository } from '~/repositories';

const props = defineProps<{
    favorite: Favorite
}>()
const isUltrafavorite = ref(props.favorite.is_ultra_favorite);
</script>
<template>
    <UContextMenu class="w-24" :items="[
    {
        label: 'Open',
        icon: 'i-lucide-external-link',
    },
    {
        label: 'Edit',
        icon: 'i-lucide-square-pen',
    },
    {
        label: 'Ultrafavorite',
        icon: isUltrafavorite ? 'i-heroicons-star-solid' : 'i-lucide-star',
        onSelect: async () => {
            props.favorite.is_ultra_favorite = !props.favorite.is_ultra_favorite;
            await FavoriteRepository.setUltraFavorite(props.favorite);
            isUltrafavorite = !isUltrafavorite;
        },
    },
    {
        label: 'Delete',
        icon: 'i-lucide-trash',
    },
]" >
      <slot />
    </UContextMenu>
</template>


