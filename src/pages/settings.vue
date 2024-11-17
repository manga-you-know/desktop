<script setup lang="ts">
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

import { load } from "@tauri-apps/plugin-store";
import { getVersion } from "@tauri-apps/api/app";
import { checkForAppUpdates } from "~/functions";
definePageMeta({
    name: "Settings",
});
const autoSearchUpdates = ref(true);
const autoEnterFullscreen = ref(true);
const theme = ref("dark");
const favoriteLanguage = ref("en");

const currentlyVersion = ref("loading version...");
const isSearchingUpdate = ref(false);
const config = await load("config.json");
async function saveConfig(key: string, value: any) {
    await config.set(key, value);
}
async function searchUpdate() {
    isSearchingUpdate.value = true;
    await checkForAppUpdates(true);
    isSearchingUpdate.value = false;
}
onBeforeMount(async () => {
    const [
        autoSearchSaved,
        autoEnterFullSaved,
        themeSaved,
        favoriteLanguageSaved,
        appVersion,
    ] = await Promise.all([
        config.get<boolean>("auto_search_updates"),
        config.get<boolean>("auto_enter_fullscreen"),
        config.get<string>("theme"),
        config.get<string>("favorite_language"),
        getVersion(),
    ]);
    autoSearchUpdates.value = autoSearchSaved ?? true;
    autoEnterFullscreen.value = autoEnterFullSaved ?? true;
    theme.value = themeSaved ?? "dark";
    favoriteLanguage.value = favoriteLanguageSaved ?? "en";
    currentlyVersion.value = appVersion;
});
</script>

<template>
    <div class="w-full h-screen flex flex-col pt-8 pr-4 gap-3">
        <UDivider label="Version" size="xl" />
        <div>
            <UAlert :title="`Current version: v${currentlyVersion}`">
                <template #description>
                    <UCheckbox
                        class="my-3"
                        label="Auto search for updates"
                        color="cyan"
                        v-model:model-value="autoSearchUpdates"
                        v-on:update:model-value="
                            saveConfig('auto_search_updates', autoSearchUpdates)
                        "
                    />
                    <UButton
                        color="cyan"
                        variant="outline"
                        icon="heroicons:magnifying-glass"
                        :loading="isSearchingUpdate"
                        @click="searchUpdate"
                    >
                        Search for updates
                    </UButton>
                </template>
            </UAlert>
        </div>
        <UDivider label="Reader" size="xl" />
        <UAlert>
            <template #description>
                <UCheckbox
                    class="my-3"
                    label="Auto enter in fullscreen"
                    color="cyan"
                    v-model:model-value="autoEnterFullscreen"
                    v-on:update:model-value="
                        saveConfig('auto_enter_fullscreen', autoEnterFullscreen)
                    "
                />
            </template>
        </UAlert>
    </div>
</template>
