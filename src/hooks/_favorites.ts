import type { Favorite } from "~/models";

export function useFavorites() {
	const isFavoriteOpen = useState<boolean>("isFavoriteOpen", () => false);
	const isEditFavoriteOpen = useState<boolean>("isEditFavoriteOpen", () => false);
	const isAskModalOpen = useState<boolean>("isAskModalOpen", () => false);
	const askModalText = useState<string>("askModalText", () => "");
	const globalFavorite = useState<Favorite>("favorite");
	const ultraFavorites = useState<Favorite[]>("ultraFavorites", () => []);
	return {
		isFavoriteOpen,
		isEditFavoriteOpen,
		isAskModalOpen,
		askModalText,
		globalFavorite,
		ultraFavorites,
	};
}
