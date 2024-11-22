<script lang="ts" setup>
import type { Favorite } from "~/models";
import { FavoriteRepository } from "~/repositories";
const isOpen = useState<boolean>("isAskModalOpen", () => false);
const text = useState<string>("askModalText", () => "");
const globalFavorite = useState<Favorite>("favorite");
const selectedFavorites = useState<Favorite[]>("selectedFavorites");
const isSelecting = useState<boolean>("isSelecting");
const favorites = useState<Favorite[]>("favorites");
const ultraFavorites = useState<Favorite[]>("ultraFavorites", () => []);
async function deleteFavorite() {
    if (isSelecting.value) {
        await FavoriteRepository.deleteFavorites(selectedFavorites.value);
        favorites.value = await FavoriteRepository.getFavorites();
        ultraFavorites.value = await FavoriteRepository.getUltraFavorites();
        selectedFavorites.value = [];
        isSelecting.value = false;
        isOpen.value = false;
        return;
    }
    await FavoriteRepository.deleteFavorite(globalFavorite.value);
    favorites.value = await FavoriteRepository.getFavorites();
    ultraFavorites.value = await FavoriteRepository.getUltraFavorites();
    isOpen.value = false;
}

</script>

<template>
    <UModal class="w-72 max-h-48" v-model:open="isOpen" title="Are you sure?" :description="text" :default-open="false">
        <template #body>
            <div class="w-full flex justify-center gap-1">
                <UButton color="error" icon="i-lucide-trash" @click="deleteFavorite" label="Delete" />
                <UButton color="neutral" icon="i-lucide-x" trailing @click="isOpen = false" label="Cancel" />
            </div>
        </template>
    </UModal>
</template>

