import type { Favorite } from "@/models";
import { FavoriteRepository } from "@/repositories";

export function openFavorite(favorite: Favorite) {
  const isFavoriteOpen = useState<boolean>("isFavoriteOpen", () => false);
  const globalFavorite = useState<Favorite>("favorite");
  globalFavorite.value = favorite;
  isFavoriteOpen.value = true;
}

export function editFavorite(favorite: Favorite) {
  const isEditFavoriteOpen = useState<boolean>(
    "isEditFavoriteOpen",
    () => false
  );
  const globalFavorite = useState<Favorite>("favorite");
  globalFavorite.value = favorite;
  isEditFavoriteOpen.value = true;
}

export async function ultraFavorite(favorite: Favorite) {
  const ultraFavorites = useState<Favorite[]>("ultraFavorites", () => []);
  await FavoriteRepository.setUltraFavorite(favorite);
  ultraFavorites.value = await FavoriteRepository.getUltraFavorites();
}

export function deleteFavorite(favorite: Favorite) {
  const isAskModalOpen = useState<boolean>("isAskModalOpen", () => false);
  const askModalText = useState<string>("askModalText", () => "");
  const globalFavorite = useState<Favorite>("favorite");
  globalFavorite.value = favorite;
  askModalText.value = `This action will delete ${favorite.name}.`;
  isAskModalOpen.value = true;
}
