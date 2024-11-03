import type { Favorite } from "~/models";

const selectedFavorites = useState<Favorite[]>('selectedFavorites', () => []);

export async function addSelected(favorite: Favorite) {
  if (selectedFavorites.value.includes(favorite)) {
    selectedFavorites.value = selectedFavorites.value.filter((fav) => fav.id !== favorite.id);
  } else {
    selectedFavorites.value.push(favorite);
  }
}
