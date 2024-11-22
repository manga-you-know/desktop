<script lang="ts" setup>
import type { Favorite } from '~/models';
import { openFavorite, editFavorite, deleteFavorite, ultraFavorite } from '~/functions';

const props = defineProps<{
    favorite: Favorite
}>()
const reactiveFavorite = ref<Favorite>(props.favorite);

</script>
<template>
    <UContextMenu class="w-24" :items="[
    {
        label: 'Open',
        icon: 'i-lucide-external-link',
        onSelect: () => openFavorite(props.favorite),
    },
    {
        label: 'Edit',
        icon: 'i-lucide-square-pen',
        onSelect: () => editFavorite(props.favorite),
    },
    {
        label: 'Ultrafavorite',
        icon: reactiveFavorite.is_ultra_favorite ? 'i-heroicons-star-solid' : 'i-lucide-star',
        onSelect: async () => {
            reactiveFavorite.is_ultra_favorite = !reactiveFavorite.is_ultra_favorite;
            await ultraFavorite(reactiveFavorite);
        },
    },
    {
        label: 'Delete',
        icon: 'i-lucide-trash',
        onSelect: () => deleteFavorite(props.favorite),
    },
]" >
      <slot />
    </UContextMenu>
</template>


