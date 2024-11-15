<script setup lang="ts">
import { load } from "@tauri-apps/plugin-store";
import { FavoriteRepository, MarkRepository } from "~/database";
import type { Favorite, User } from "~/models";
const user = useState<User>("user");
const query = useState<string>("favoriteQuery", () => "");
const favorites = useState<Favorite[]>("favorites", () => []);
const selectedFavorites = useState<Favorite[]>("selectedFavorites", () => []);
const isSelecting = useState<boolean>("isSelecting", () => false);
const sourceSearch = useState<string>("sourceQuery", () => "-");
const currentlyMark = useState<string>("mark", () => "-");
const isAsc = useState<boolean>("isAsc");
const order = useState<{ type: string; icon: string }>("order");
const isLoading = ref(false);
const isMarkModalOpen = ref(false);
const isMarkSelectedModalOpen = useState<boolean>(
    "isMarkSelectedModalOpen",
    () => false,
);
const sources = ref<string[]>([]);
const marks = ref<string[]>([]);
const isOrderFetched = ref(false);
const config = await load("config.json");
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
        isLoading.value = true;
        favorites.value = await FavoriteRepository.getFavorites(user.value.id);
        isLoading.value = false;
        return;
    }
    isLoading.value = true;
    favorites.value = await FavoriteRepository.getFavorites(user.value.id);
    isLoading.value = false;
}
async function resetResults() {
    query.value = "";
    isLoading.value = false;
    favorites.value = await FavoriteRepository.getFavorites(user.value.id);
}
async function fetchMarks() {
    marks.value = [
        "-",
        ...(await MarkRepository.getMarks()).map((mark) => mark.name),
    ];
}

onMounted(async () => {
    favorites.value = await FavoriteRepository.getFavorites(user.value.id);
    sources.value = [
        "-",
        ...(await FavoriteRepository.getFavoriteSources(user.value.id)),
    ];
    await fetchMarks();
    sourceSearch.value = sources.value[0];
});
watch(isSelecting, () => {
    selectedFavorites.value = [];
});
watch(order, async () => {
    await Promise.all([search(), config.set("order_type", order.value.type)]);
});
watch(isAsc, async () => {
    await Promise.all([search(), config.set("is_asc", isAsc.value)]);
});
</script>

<template>
    <MarksModal v-model="isMarkModalOpen" />
    <MarkSelectedModal v-model="isMarkSelectedModalOpen" />
    <div class="w-full h-full">
        <div class="w-full h-12 p-2 flex justify-center z-10 bg-gray-850">
            <div class="relative gap-1 flex z-50">
                <UButton
                    class="w-8 justify-center pointer-events-none"
                    color="white"
                    :loading="isLoading"
                >
                    {{ isLoading ? "" : favorites.length }}
                </UButton>
                <SelectOrder />
                <UInput
                    v-model="query"
                    v-on:update:model-value="search"
                    :loading="isLoading"
                    placeholder="Search..."
                    color="cyan"
                    icon="heroicons:magnifying-glass-solid"
                    class="w-[160px]"
                >
                    <template #trailing>
                        <UButton
                            tabindex="-1"
                            color="gray"
                            variant="link"
                            icon="heroicons:x-mark-20-solid"
                            class="pointer-events-auto"
                            @click="resetResults"
                        />
                    </template>
                </UInput>
                <UTooltip :text="sourceSearch" :prevent="sourceSearch === '-'">
                    <USelectMenu
                        class="w-24"
                        searchable
                        clear-search-on-close
                        v-on:update:model-value="search"
                        v-model="sourceSearch"
                        :options="sources"
                        color="cyan"
                    />
                </UTooltip>
                <UTooltip
                    :text="currentlyMark"
                    :prevent="currentlyMark === '-'"
                >
                    <USelectMenu
                        class="w-24"
                        searchable
                        clear-search-on-close
                        @click="fetchMarks"
                        v-on:update:model-value="search"
                        v-model="currentlyMark"
                        :options="marks"
                        color="cyan"
                    />
                </UTooltip>
                <UButton
                    color="white"
                    icon="heroicons:archive-box"
                    @click="isMarkModalOpen = true"
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
                                ? 'heroicons:pencil-square-solid'
                                : 'heroicons:pencil-square'
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
