<script setup lang="ts">
import { FavoriteDB } from "~/database";
import type { Favorite, User } from "~/models";
const user = useState<User>("user");
const query = useState<string>("favoriteQuery", () => "");
const favorites = useState<Favorite[]>("favorites", () => []);
const selectedFavorites = useState<Favorite[]>("selectedFavorites", () => []);
const isSelecting = useState<boolean>("isSelecting", () => false);
const sourceSearch = useState<string>("sourceQuery", () => "-");
const order = useState<string>("order", () => "upper");
const isLoading = ref(false);
const sources = ref<string[]>([]);
definePageMeta({
    name: "Favorites",
});
async function search() {
    await new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, 10);
    });
    if (query.value === "") {
        isLoading.value = false;
        favorites.value = await FavoriteDB.getFavorites(user.value.id);
        return;
    }
    isLoading.value = true;
    favorites.value = await FavoriteDB.getFavorites(user.value.id);
    isLoading.value = false;
}
async function resetResults() {
    query.value = "";
    isLoading.value = false;
    favorites.value = await FavoriteDB.getFavorites(user.value.id);
}
onMounted(async () => {
    favorites.value = await FavoriteDB.getFavorites(user.value.id);
    sources.value = [
        "-",
        ...(await FavoriteDB.getFavoriteSources(user.value.id)),
    ];
    sourceSearch.value = sources.value[0];
});
watch(isSelecting, () => {
    selectedFavorites.value = [];
});
</script>

<template>
    <div class="w-full h-full">
        <div class="w-full h-12 p-2 flex justify-center z-10 bg-gray-850">
            <div class="relative gap-3 flex">
                <SelectOrder @change="search" />
                <UInput
                    v-model="query"
                    v-on:update:model-value="search"
                    :loading="isLoading"
                    placeholder="Search..."
                    color="cyan"
                    icon="i-heroicons-magnifying-glass-solid"
                    class="w-full"
                >
                    <template #trailing>
                        <UButton
                            tabindex="-1"
                            color="gray"
                            variant="link"
                            icon="i-heroicons-x-mark-20-solid"
                            class="pointer-events-auto"
                            @click="resetResults"
                        />
                    </template>
                </UInput>
                <USelectMenu
                    class="w-32"
                    searchable
                    clear-search-on-close
                    v-on:update:model-value="search"
                    v-model="sourceSearch"
                    :options="sources"
                    color="cyan"
                />
                <UButtonGroup
                    orientation="horizontal"
                    class="gap-0 flex justify-center"
                >
                    <UButton
                        color="white"
                        @click="isSelecting = !isSelecting"
                        :icon="
                            isSelecting
                                ? 'i-heroicons-pencil-square-solid'
                                : 'i-heroicons-pencil-square'
                        "
                    />
                    <SelectedDropdown />
                </UButtonGroup>
            </div>
        </div>
        <div
            class="w-full h-[calc(100vh-3rem)] pb-5 overflow-y-auto overflow-x-hidden flex flex-row justify-start gap-2 flex-wrap"
        >
            <div class="" v-for="favorite in favorites" :key="favorite.id">
                <FavoriteCard :favorite="favorite" />
            </div>
        </div>
    </div>
</template>
