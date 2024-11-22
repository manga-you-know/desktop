import type { Favorite } from "~/models";
import { FavoriteRepository } from "~/repositories";



export function openFavorite(favorite: Favorite) {
    const { isFavoriteOpen, globalFavorite } = useFavorites();
    globalFavorite.value = favorite;
    isFavoriteOpen.value = true;
}

export function editFavorite(favorite: Favorite) {
    const { isEditFavoriteOpen, globalFavorite } = useFavorites();
    globalFavorite.value = favorite;
    isEditFavoriteOpen.value = true;
}

export async function ultraFavorite(favorite: Favorite) {
    const { ultraFavorites } = useFavorites();
    await FavoriteRepository.setUltraFavorite(favorite);
    ultraFavorites.value = await FavoriteRepository.getUltraFavorites();
}

export function deleteFavorite(favorite: Favorite) {
    const { globalFavorite, askModalText, isAskModalOpen } = useFavorites();
    globalFavorite.value = favorite;
    askModalText.value = `This action will delete ${favorite.name}.`;
    isAskModalOpen.value = true;
}
