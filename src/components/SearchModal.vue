<script setup lang="ts">
import { load } from "@tauri-apps/plugin-store";
import { FavoriteRepository } from "~/database";
import { MANGASOURCES } from "~/constants";
import type { DownloadManager } from "~/managers";
import type { Favorite, Readed, User } from "~/models";

const store = await load("config.json");
const user = useState<User>("user");
const query = ref("");
const dlManager = useState<DownloadManager>("dlManager");
const isLoading = ref(false);
const results = ref<Favorite[]>([]);
const favorites = useState<Favorite[]>("favorites");
const isSearchOpen = useState<boolean>("isSearchOpen");
const sourceSearch = useState<string>("sourceSearch", () => MANGASOURCES[0]);
const sourceResult = await store.get<string>("source_search");
sourceSearch.value = MANGASOURCES.includes(sourceResult ?? "")
    ? (sourceResult ?? "")
    : MANGASOURCES[0];
const finished = ref();

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
        favorites.value = await FavoriteRepository.getFavorites(user.value.id);
        results.value = (
            await dlManager.value.search(query.value, sourceSearch.value)
        ).slice(0, 20);
    } catch (error) {
        finished.value = error;
    } finally {
        isLoading.value = false;
    }
}
async function verifyFavorites() {
    const favorites = await FavoriteRepository.getFavorites(user.value.id);
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
        favorites.value = await FavoriteRepository.getFavorites(user.value.id);
        return;
    }
    await FavoriteRepository.createFavorite(favorite, user.value.id);
    favorites.value = await FavoriteRepository.getFavorites(user.value.id);
}
</script>

<template>
    <UModal class="rounded" :overlay="true">
        <div class="w-full h-11 flex justify-center items-center">
            <UInput
                v-model="query"
                v-on:update:model-value="search"
                name="query"
                :loading="isLoading"
                variant="none"
                :padded="false"
                class="w-[97%]"
                placeholder="Search..."
                icon="heroicons:magnifying-glass-20-solid"
                leading
                autocomplete="off"
                :autofocus="true"
                :ui="{ icon: { trailing: { pointer: '' } } }"
            >
                <template #trailing>
                    <div class="flex gap-2">
                        <USelectMenu
                            tabindex="-1"
                            searchable
                            class="w-[150px]"
                            clear-search-on-close
                            v-model="sourceSearch"
                            :options="MANGASOURCES"
                            v-on:update:model-value="search"
                            color="cyan"
                        />
                        <UButton
                            tabindex="-1"
                            color="gray"
                            variant="link"
                            icon="heroicons:x-mark-20-solid"
                            :padded="false"
                            @click="resetResults"
                        />
                    </div>
                </template>
            </UInput>
        </div>
        <UDivider class="w-full h-1" />
        <div class="w-full h-48 flex flex-col overflow-y-scroll">
            <div v-for="(result, i) in results" :key="result.name">
                <div
                    :tabindex="i + 1"
                    @keydown.enter="favorite(result)"
                    @keydown.space="console.log('fuck')"
                >
                    <UButtonGroup orientation="horizontal" class="w-full">
                        <UButton
                            tabindex="-1"
                            @click="console.log('nada')"
                            color="gray"
                            variant="ghost"
                            class="w-[93%] h-10 m-0.5 flex justify-between"
                        >
                            {{
                                result.name.substring(0, 60) +
                                (result.name.length > 60 ? "..." : "")
                            }}
                        </UButton>
                        <UButton
                            tabindex="-1"
                            :icon="
                                isFavorite(result)
                                    ? 'heroicons:star-solid'
                                    : 'heroicons:star'
                            "
                            color="gray"
                            variant="link"
                            class="h-10 m-0.5"
                            @click="() => favorite(result)"
                        />
                    </UButtonGroup>
                </div>
            </div>
        </div>
    </UModal>
</template>
