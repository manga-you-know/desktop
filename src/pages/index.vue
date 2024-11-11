<script setup lang="ts">
import { load } from "@tauri-apps/plugin-store";
import { FavoriteRepository } from "~/database";
import { MANGASOURCES } from "~/constants";
import type { Favorite, User } from "~/models";

const store = await load("config.json");
const user = useState<User>("user");
const rerender = useState<number>("rerenderIndex", () => 0);
const isOpen = useState<boolean>("isSearchOpen", () => false);
const ultraFavorites = useState<Favorite[]>("ultraFavorites", () => []);
const sourceSearch = useState<string>("sourceSearch", () => MANGASOURCES[0]);
const sourceResult = await store.get<string>("source_search");
sourceSearch.value = MANGASOURCES.includes(sourceResult ?? "")
    ? (sourceResult ?? "")
    : MANGASOURCES[0];
definePageMeta({
    name: "Home",
});
defineShortcuts({
    meta_r: {
        usingInput: true,
        handler: () => {
            rerender.value++;
        },
    },
});
onMounted(async () => {
    ultraFavorites.value = await FavoriteRepository.getUltraFavorites(
        user.value.id,
    );
});
</script>

<template>
    <div :key="rerender" class="h-full w-full flex flex-col">
        <div class="w-full h-16 flex relative justify-end">
            <div class="m-5 gap-1 flex">
                <div>
                    <UTooltip text="Search" :shortcuts="['Ctrl', 'K']">
                        <UButton
                            color="gray"
                            variant="ghost"
                            icon="heroicons:magnifying-glass-20-solid"
                            @click="isOpen = true"
                        />
                    </UTooltip>
                    <UTooltip text="Refresh" :shortcuts="['Ctrl', 'R']">
                        <UButton
                            color="gray"
                            variant="ghost"
                            icon="heroicons:arrow-path-solid"
                            @click="rerender++"
                        />
                    </UTooltip>
                </div>
                <div>
                    <USelectMenu
                        searchable
                        class="w-[150px]"
                        clear-search-on-close
                        v-model="sourceSearch"
                        v-on:update:model-value="
                            async () =>
                                await store.set('source_search', sourceSearch)
                        "
                        :options="MANGASOURCES"
                        color="cyan"
                    />
                </div>
            </div>
        </div>
        <div
            class="h-[calc(100vh-4rem)] w-full pb-5 flex flex-row flex-wrap justify-start gap-2 overflow-y-auto overflow-x-hidden"
        >
            <div v-for="favorite in ultraFavorites" :key="favorite.name">
                <UltraFavoriteCard :favorite="favorite" />
            </div>
        </div>
    </div>
</template>
