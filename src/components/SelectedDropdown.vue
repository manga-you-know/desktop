<script lang="ts" setup>
import { confirm } from "@tauri-apps/plugin-dialog";
import { FavoriteDB, MarkDB, MarkFavoriteDB } from "~/database";
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
const items = [
    [
        {
            label: "Add to Mark",
            icon: "i-heroicons-archive-box-20-solid",
            click: () => {
                isMarkSelectedModalOpen.value = true;
            },
        },
        //     {
        //         label: "Edit",
        //         icon: "i-heroicons-pencil-square-20-solid",
        //     },
        // ],
        // [
        //     {
        //         label: "Add selected to Mark",
        //         icon: "i-heroicons-archive-box-20-solid",
        //     },
        //     {
        //         label: "Ultrafavorite selected",
        //         icon: "i-heroicons-star-20-solid",
        //         click: async () => {
        //             await FavoriteDB.ultraFavoriteAll(selectedFavorites.value);
        //             isSelecting.value = false;
        //         },
        //     },
    ],
    [
        // {
        //     label: "Remove ultrafavorite",
        //     icon: "i-heroicons-star",
        // },
        {
            label: `Remove from ${currentlyMark.value}`,
            icon: "i-heroicons-minus-circle-solid",
            //    disabled: currentlyMark.value == "-",
            click: async () => {
                await MarkFavoriteDB.deleteMarkFavorites(
                    selectedFavorites.value,
                    await MarkDB.getMarkId(currentlyMark.value),
                );
                favorites.value = await FavoriteDB.getFavorites(user.value.id);
                isSelecting.value = false;
            },
        },
        {
            label: "Delete selected",
            icon: "i-heroicons-trash-20-solid",
            click: async () => {
                const answer = await confirm(
                    `This will delete ${selectedFavorites.value.length} favorite(s). Are you sure?`,
                    { title: "Delete selected", kind: "warning" },
                );
                if (answer) {
                    await FavoriteDB.deleteFavorites(selectedFavorites.value);
                    favorites.value = await FavoriteDB.getFavorites(
                        user.value.id,
                    );
                    isSelecting.value = false;
                }
            },
        },
    ],
];
</script>

<template>
    <UDropdown :items="items" :popper="{ placement: 'bottom-start' }">
        <UButton
            color="white"
            :label="isSelecting ? selectedFavorites.length.toString() : ''"
            :disabled="!isSelecting"
            trailing-icon="i-heroicons-chevron-down-20-solid"
        />
    </UDropdown>
</template>
