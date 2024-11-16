<script setup lang="ts">
import { load } from "@tauri-apps/plugin-store";
import { getVersion } from "@tauri-apps/api/app";
import { checkForAppUpdates } from "~/functions";
definePageMeta({
    name: "Settings",
});
const autoSearchUpdates = ref(true);
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
    const [autoSearchSaved, themeSaved, favoriteLanguageSaved, appVersion] =
        await Promise.all([
            config.get<boolean>("auto_search_updates"),
            config.get<string>("theme"),
            config.get<string>("favorite_language"),
            getVersion(),
        ]);
    console.log(autoSearchSaved);
    autoSearchUpdates.value = autoSearchSaved ?? true;
    theme.value = themeSaved ?? "dark";
    favoriteLanguage.value = favoriteLanguageSaved ?? "en";
    currentlyVersion.value = appVersion;
});
</script>

<template>
    <div class="w-full h-screen flex flex-col pt-8 gap-3">
        <UDivider label="Version" size="xl" />
        <div class="pl-3">
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
    </div>
</template>
