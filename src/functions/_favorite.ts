import type { Favorite } from "~/models";
import { FavoriteRepository } from "~/repositories";

const isFavoriteOpen = useState<boolean>("isFavoriteOpen", () => false);
const isEditFavoriteOpen = useState<boolean>("isEditFavoriteOpen", () => false);
const isAskModalOpen = useState<boolean>("isAskModalOpen", () => false);
const askModalText = useState<string>("askModalText", () => "");
const globalFavorite = useState<Favorite>("favorite");
const ultraFavorites = useState<Favorite[]>("ultraFavorites", () => []);

export function openFavorite(favorite: Favorite) {
    globalFavorite.value = favorite;
    isFavoriteOpen.value = true;
}

export function editFavorite(favorite: Favorite) {
    globalFavorite.value = favorite;
    isEditFavoriteOpen.value = true;
}

export async function ultraFavorite(favorite: Favorite) {
    await FavoriteRepository.setUltraFavorite(favorite);
    ultraFavorites.value = await FavoriteRepository.getUltraFavorites();
}

export function deleteFavorite(favorite: Favorite) {
    globalFavorite.value = favorite;
    askModalText.value = `This action will delete ${favorite.name}.`;
    isAskModalOpen.value = true;
}
