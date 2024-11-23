<script setup lang="ts">
import { load } from "@tauri-apps/plugin-store";
import { FavoriteRepository } from "~/repositories";
import { MANGASOURCES } from "~/constants";
import type { DownloadManager } from "~/managers";
import type { Favorite, Readed, User } from "~/models";

const store = await load("config.json");
const user = useState<User>("user");
const query = ref("");
const divSearch = ref<HTMLDivElement>();
const dlManager = useState<DownloadManager>("dlManager");
const isLoading = ref(false);
const isFavoriteOpen = ref(false);
const favoriteView = ref<Favorite>();
const results = ref<Favorite[]>([]);
const globalFavorites = useState<Favorite[]>("favorites");
const favorites = ref<Favorite[]>([]);
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
        results.value = (
            await dlManager.value.search(query.value, sourceSearch.value)
        ).slice(0, 20);
        // @ts-ignore
        divSearch.value.scrollTop = 0;
    } catch (error) {
        finished.value = error;
    } finally {
        isLoading.value = false;
    }
}
async function verifyFavorites() {
    const favorites = await FavoriteRepository.getFavorites();
}
function isFavorite(favorite: Favorite) {
    return favorites.value.find(
        (f) =>
            f.name === favorite.name &&
            f.source === favorite.source &&
            f.source_id === favorite.source_id,
    );
}

onMounted(async () => {
    favorites.value = await FavoriteRepository.getRawFavorites();
});

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
watch(isSearchOpen, () => {
    if (isSearchOpen.value) {
        isFavoriteOpen.value = false;
    }
});
</script>

<template>
    <UModal class="rounded" :overlay="true">
        <template #content>
            <div class="relative overflow-hidden" style="min-height: 250px">
                <div
                    class="w-full absolute transition-all duration-500 ease-in-out"
                    :class="{
                        '-translate-x-full': isFavoriteOpen,
                        'translate-x-0': !isFavoriteOpen,
                    }"
                >
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
                        >
                            <template #trailing>
                                <div class="flex gap-2">
                                    <USelectMenu
                                        tabindex="-1"
                                        searchable
                                        class="w-[150px]"
                                        clear-search-on-close
                                        v-model="sourceSearch"
                                        :items="MANGASOURCES"
                                        v-on:update:model-value="search"
                                        color="neutral"
                                    />
                                    <UButton
                                        size="xl"
                                        tabindex="-1"
                                        color="neutral"
                                        variant="link"
                                        icon="heroicons:x-mark-20-solid"
                                        :padded="false"
                                        @click="resetResults"
                                    />
                                </div>
                            </template>
                        </UInput>
                    </div>
                    <USeparator class="w-full h-1" />
                    <div ref="divSearch" class="w-full h-48 flex flex-col overflow-y-scroll overflow-x-hidden">
                        <div v-for="(result, i) in results" :key="result.name">
                            <div
                                :tabindex="i + 1"
                                @keydown.enter="favorite(result)"
                                @keydown.space="console.log('fuck')"
                            >
                                <UButtonGroup
                                    orientation="horizontal"
                                    class="w-full"
                                >
                                    <UButton
                                        size="xl"
                                        tabindex="-1"
                                        @click="
                                            favoriteView = result;
                                            isFavoriteOpen = true;
                                        "
                                        color="neutral"
                                        variant="ghost"
                                        class="w-[93%] max-w-[93%] h-10 m-0.5 flex justify-between"
                                        :label="
                                            result.name.substring(0, 55) +
                                            (result.name.length > 55
                                                ? '...'
                                                : '')
                                        "
                                    />
                                    <UButton
                                        size="xl"
                                        tabindex="-1"
                                        :icon="
                                            isFavorite(result)
                                                ? 'heroicons:star-solid'
                                                : 'heroicons:star'
                                        "
                                        color="neutral"
                                        variant="link"
                                        class="h-10 m-0.5"
                                        @click="() => favorite(result)"
                                    />
                                </UButtonGroup>
                            </div>
                        </div>
                    </div>
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
                                    variant="soft"
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
