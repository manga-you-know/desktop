<script setup lang="ts">
import { load } from "@tauri-apps/plugin-store";
import { FavoriteRepository, MarkRepository } from "~/repositories";
import type { Favorite, User } from "~/models";
const user = useState<User>("user");
const query = useState<string>("favoriteQuery", () => "");
const favorites = useState<Favorite[]>("favorites", () => []);
const favoritesDisplayed = ref<Favorite[]>([]);
const selectedFavorites = useState<Favorite[]>("selectedFavorites", () => []);
const isSelecting = useState<boolean>("isSelecting", () => false);
const sourceSearch = useState<string>("sourceQuery", () => "-");
const currentlyMark = useState<string>("mark", () => "-");
const isAsc = useState<boolean>("isAsc");
const order = useState<{ type: string; icon: string }>("order");
const isLoading = ref(false);
const isImportModalOpen = ref(false);
const isMarkModalOpen = ref(false);
const page = ref(1);
const itemsPerPage = 28;
const isMarkSelectedModalOpen = useState<boolean>(
    "isMarkSelectedModalOpen",
    () => false,
);
const sources = ref<string[]>([]);
const marks = ref<string[]>([]);
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
        favorites.value = await FavoriteRepository.getFavorites();
        page.value = 1;
        favoritesDisplayed.value = favorites.value.slice(0, itemsPerPage);
        isLoading.value = false;
        return;
    }
    isLoading.value = true;
    favorites.value = await FavoriteRepository.getFavorites();
    page.value = 1;
    favoritesDisplayed.value = favorites.value.slice(0, itemsPerPage);
    isLoading.value = false;
}
async function resetResults() {
    query.value = "";
    isLoading.value = false;
    favorites.value = await FavoriteRepository.getFavorites();
    page.value = 1;
    favoritesDisplayed.value = favorites.value.slice(0, itemsPerPage);
}
async function fetchMarks() {
    marks.value = [
        "-",
        ...(await MarkRepository.getMarks()).map((mark) => mark.name),
    ];
}

onMounted(async () => {
    favorites.value = await FavoriteRepository.getFavorites();
    favoritesDisplayed.value = favorites.value.slice(0, itemsPerPage);
    sources.value = ["-", ...(await FavoriteRepository.getFavoriteSources())];
    await fetchMarks();
    sourceSearch.value = sources.value[0];
});
watch(page, () => {
    favoritesDisplayed.value = favorites.value.slice((page.value - 1) * itemsPerPage, page.value * itemsPerPage);
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
watch(favorites, async () => {
    page.value = 1;
    favoritesDisplayed.value = favorites.value.slice(0, itemsPerPage);
});
</script>

<template>
    <ShareOrImportModal v-model:open="isImportModalOpen" />
    <MarksModal v-model:open="isMarkModalOpen" />
    <MarkSelectedModal v-model:open="isMarkSelectedModalOpen" />
    <div class="w-full h-full overflow-x-hidden overflow-y-hidden">
        <div class="w-full h-12 p-2 flex justify-center z-10 bg-gray-850">
            <div class="relative gap-1 flex z-50">
                <UButton
                    size="xl"
                    class="w-8 justify-center"
                    color="neutral"
                    icon="ic:outline-ios-share"
                    variant="outline"
                    @click="isImportModalOpen = true"
                />
                <UButton
                    size="md"
                    class="w-12 justify-center pointer-events-none"
                    color="neutral"
                    variant="outline"
                    :loading="isLoading"
                    :label="`${isLoading ? '' : favorites.length}`"
                />
                <SelectOrder />
                <UInput
                    v-model="query"
                    v-on:update:model-value="search"
                    :loading="isLoading"
                    placeholder="Search..."
                    color="neutral"
                    icon="heroicons:magnifying-glass-solid"
                    class="w-[160px]"
                >
                    <template #trailing>
                        <UButton
                            size="xl"
                            tabindex="-1"
                            color="neutral"
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
                        :items="sources"
                        color="neutral"
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
                        :items="marks"
                        color="neutral"
                    />
                </UTooltip>
                <UButton
                    size="xl"
                    color="neutral"
                    variant="outline"
                    icon="heroicons:archive-box"
                    @click="isMarkModalOpen = true"
                />
                <UButtonGroup
                    orientation="horizontal"
                    class="gap-0 flex justify-center"
                >
                    <UButton
                        size="xl"
                        color="neutral"
                        variant="soft"
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
        <div class="" v-for="favorite in favoritesDisplayed" :key="favorite.id">
            <FavoriteCard :favorite="favorite" />
        </div>
        <div class="w-full flex justify-center">
        <UPagination v-model:page="page" :items-per-page="itemsPerPage" :total="favorites.length" active-color="neutral" />
        </div>
    </div>
</div>
</template>
