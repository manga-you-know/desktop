<script lang="ts" setup>
import { confirm } from "@tauri-apps/plugin-dialog";
import {
    FavoriteRepository,
    MarkRepository,
    MarkFavoriteRepository,
} from "~/database";
import type { Favorite, User } from "~/models";
const selectedFavorites = useState<Favorite[]>("selectedFavorites", () => []);
const isSelecting = useState<boolean>("isSelecting", () => false);
const favorites = useState<Favorite[]>("favorites");
const user = useState<User>("user");
const currentlyMark = useState<string>("mark");
const isMarkSelectedModalOpen = useState<boolean>(
    "isMarkSelectedModalOpen",
    () => false,
);
</script>

<template>
    <UDropdown
        :items="[
            [
                {
                    label: 'Add to Mark',
                    icon: 'heroicons:archive-box-20-solid',
                    click: () => (isMarkSelectedModalOpen = true),
                },
            ],
            [
                {
                    label: `Remove from ${currentlyMark}`,
                    icon: 'heroicons:minus-circle-solid',
                    disabled: currentlyMark === '-',
                    click: async () => {
                        await MarkFavoriteRepository.deleteMarkFavorites(
                            selectedFavorites,
                            await MarkRepository.getMarkId(currentlyMark),
                        );
                        favorites = await FavoriteRepository.getFavorites(
                            user.id,
                        );
                        isSelecting = false;
                    },
                },
                {
                    label: 'Delete selected',
                    icon: 'heroicons:trash-20-solid',
                    click: async () => {
                        const answer = await confirm(
                            `This will delete ${selectedFavorites.length} favorite(s). Are you sure?`,
                            { title: 'Delete selected', kind: 'warning' },
                        );
                        if (answer) {
                            await FavoriteRepository.deleteFavorites(
                                selectedFavorites,
                            );
                            favorites = await FavoriteRepository.getFavorites(
                                user.id,
                            );
                            isSelecting = false;
                        }
                    },
                },
            ],
        ]"
        :popper="{ placement: 'bottom-start' }"
    >
        <UButton
            color="white"
            :label="isSelecting ? selectedFavorites.length.toString() : ''"
            :disabled="!isSelecting"
            trailing-icon="heroicons:chevron-down-20-solid"
        />
    </UDropdown>
</template>
