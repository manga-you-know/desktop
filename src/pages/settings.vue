<script setup lang="ts">
import { load } from "@tauri-apps/plugin-store";
definePageMeta({
    name: "Settings",
});
const autoSearchUpdates = ref(true);
const theme = ref("dark");
const favoriteLanguage = ref("en");

const config = await load("config.json");
async function saveConfig(key: string, value: any) {
    await config.set(key, value);
}
onBeforeMount(async () => {
    const [autoSearchSaved, themeSaved, favoriteLanguageSaved] =
        await Promise.all([
            config.get<boolean>("auto_search_updates"),
            config.get<string>("theme"),
            config.get<string>("favorite_language"),
        ]);
    console.log(autoSearchSaved);
    autoSearchUpdates.value = autoSearchSaved ?? true;
    theme.value = themeSaved ?? "dark";
    favoriteLanguage.value = favoriteLanguageSaved ?? "en";
});
</script>

<template>
    <div class="w-full flex justify-center items-center">
        <UToggle
            color="cyan"
            v-model:model-value="autoSearchUpdates"
            v-on:update:model-value="
                saveConfig('auto_search_updates', autoSearchUpdates)
            "
        />
    </div>
</template>
