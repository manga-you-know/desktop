<script lang="ts" setup>
import { confirm } from "@tauri-apps/plugin-dialog";
import {
    FavoriteRepository,
    MarkRepository,
    MarkFavoriteRepository,
} from "~/repositories";
import type { Favorite, User } from "~/models";
const selectedFavorites = useState<Favorite[]>("selectedFavorites", () => []);
const isSelecting = useState<boolean>("isSelecting", () => false);
const favorites = useState<Favorite[]>("favorites");
const currentlyMark = useState<string>("mark");
const askModalText = useState<string>("askModalText");
const isAskModalOpen = useState<boolean>("isAskModalOpen");
const isMarkSelectedModalOpen = useState<boolean>(
    "isMarkSelectedModalOpen",
    () => false,
);
</script>

<template>
    <UDropdownMenu
        :items="[
            [
                {
                    label: 'Add to Mark',
                    icon: 'heroicons:archive-box-20-solid',
                    onSelect: () => {
                        if (selectedFavorites.length === 0) return;
                        isMarkSelectedModalOpen = true;
                    },
                },
            ],
            [
                {
                    label: `Remove from ${currentlyMark}`,
                    icon: 'heroicons:minus-circle-solid',
                    disabled: currentlyMark === '-',
                    onSelect: async () => {
                        if (selectedFavorites.length === 0) return;
                        await MarkFavoriteRepository.deleteMarkFavorites(
                            selectedFavorites,
                            await MarkRepository.getMarkId(currentlyMark),
                        );
                        favorites = await FavoriteRepository.getFavorites();
                        isSelecting = false;
                    },
                },
                {
                    label: 'Delete selected',
                    icon: 'heroicons:trash-20-solid',
                    onSelect: async () => {
                        if (selectedFavorites.length === 0) return;
                        askModalText = `This action will delete ${selectedFavorites.length} favorite(s).`;
                        isAskModalOpen = true;
                    },
                },
            ],
        ]"
        :popper="{ placement: 'bottom-start' }"
    >
        <UButton
            size="xl"
            color="neutral"
            variant="outline"
            :label="isSelecting ? selectedFavorites.length.toString() : ''"
            :disabled="!isSelecting"
            trailing-icon="heroicons:chevron-down-20-solid"
        />
    </UDropdownMenu>
</template>
