<script setup lang="ts">
import { load } from "@tauri-apps/plugin-store";
import { FavoriteRepository } from "~/repositories";
import { MANGASOURCES } from "~/constants";
import type { DownloadManager } from "~/managers";
import type { Favorite, Readed, User } from "~/models";

const store = await load("config.json");
const user = useState<User>("user");
const query = ref("");
const dlManager = useState<DownloadManager>("dlManager");
const isLoading = ref(false);
const isFavoriteOpen = ref(false);
const favoriteView = ref<Favorite>();
const results = ref<{id: string, label: string, self: Favorite}[]>([]);
const globalFavorites = useState<Favorite[]>("favorites");
const favorites = ref<Favorite[]>([]);
const isSearchOpen = useState<boolean>("isSearchOpen");
const sourceSearch = useState<string>("sourceSearch", () => MANGASOURCES[0]);
const sourceResult = await store.get<string>("source_search");
sourceSearch.value = MANGASOURCES.includes(sourceResult ?? "")
    ? (sourceResult ?? "")
    : MANGASOURCES[0];

function resetResults() {
    if (query.value === "") {
        isSearchOpen.value = false;
        return;
    }
    query.value = "";
    results.value = [];
}

async function search() {
    await store.set("source_search", sourceSearch.value);
    isLoading.value = true;
    await new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, 10);
    });
    if (query.value === "") {
        isLoading.value = false;
        results.value = [];
        return;
    }
    try {
        results.value = (
            await dlManager.value.search(query.value, sourceSearch.value)
        ).slice(0, 20).map((result) => ({
            id: result.source_id,
            label: result.name,
            avatar: {src: result.cover, alt: result.name},
            onSelect: () => {
                favoriteView.value = result;
                isFavoriteOpen.value = true;
            },
            self: result,
        }));
        console.log(query.value)
    } catch (error) {
        console.log(error);
    } finally {
        isLoading.value = false;
    }
}

function isFavorite(favorite: Favorite) {
    return favorites.value.find(
        (f) =>
            f.name === favorite.name &&
            f.source === favorite.source &&
            f.source_id === favorite.source_id,
    );
}

async function favorite(favorite: Favorite) {
    const isFavoriteh = isFavorite(favorite);
    if (isFavoriteh) {
        await FavoriteRepository.deleteFavorite(isFavoriteh);
    } else {
        await FavoriteRepository.createFavorite(favorite, user.value.id);
    }
    favorites.value = await FavoriteRepository.getRawFavorites();
    globalFavorites.value = await FavoriteRepository.getFavorites();
}

onMounted(async () => {
    favorites.value = await FavoriteRepository.getRawFavorites();
});

watch(isSearchOpen, () => {
    if (isSearchOpen.value) {
        isFavoriteOpen.value = false;
    }
});
watch(query, async () => {
    await search();
});
</script>

<template>
    <UModal :overlay="true">
        <template #content>
            <div class="relative overflow-hidden" style="min-height: 250px">
                <div
                    class="w-full absolute transition-all duration-500 ease-in-out"
                    :class="{
                        '-translate-x-full': isFavoriteOpen,
                        'translate-x-0': !isFavoriteOpen,
                    }"
                >
                    <UCommandPalette v-model:searchTerm="query" placeholder="Search..." :close="{onClick: () => {
                        if (query === '') {
                            isSearchOpen = false;
                        } else {
                            query = '';
                        }
                    }}"  :loading="isLoading" :groups="[{id: 'results', filter: false, items: results}]" >
                        <template #trailing>
                            FODASSE
                        </template>
                    </UCommandPalette>
                </div>
                <div
                    class="w-full p-2 absolute transition-all duration-500 ease-in-out"
                    :class="{
                        'translate-x-0': isFavoriteOpen,
                        'translate-x-full': !isFavoriteOpen,
                    }"
                >
                    <div class="w-full flex">
                        <UButton
                            size="xl"
                            class="w-8 h-8"
                            icon="mdi:arrow-left-thick"
                            color="neutral"
                            variant="outline"
                            tabindex="-1"
                            @click="isFavoriteOpen = false"
                        />
                        <div
                            v-if="favoriteView"
                            class="w-[calc(100%-2rem)] p-2 flex"
                        >
                            <NuxtImg
                                :src="favoriteView.cover"
                                class="w-40 h-56 object-contain rounded-xl select-none"
                                draggable="false"
                            />
                            <div
                                class="w-full flex flex-col justify-center p-2 gap-2"
                            >
                                <UBadge
                                    class="text-center"
                                    color="neutral"
                                    variant="outline"
                                >
                                    {{ favoriteView.name }}
                                </UBadge>

                                <UBadge
                                    v-if="
                                        favoriteView.name !==
                                            favoriteView.extra_name &&
                                        favoriteView.extra_name
                                    "
                                    class="text-center"
                                    color="neutral"
                                >
                                    {{ favoriteView.extra_name }}
                                </UBadge>
                                <UBadge
                                    class="text-center"
                                    color="neutral"
                                    variant="soft"
                                >
                                    FROM: {{ favoriteView.author }}
                                </UBadge>
                                <UButton
                                    size="xl"
                                    :icon="
                                        isFavorite(favoriteView)
                                            ? 'ic:round-star'
                                            : 'ic:round-star-border'
                                    "
                                    color="neutral"
                                    variant="outline"
                                    @click="favorite(favoriteView)"
                                    label="Favorite"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </UModal>
</template>
