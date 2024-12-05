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
  const config = await load("config.json");
  async function saveConfig(key: string, value: any) {
    await config.set(key, value);
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
  <div v-once class="w-full h-screen flex flex-col pt-8 pr-4 gap-3">
    <USeparator label="Version" size="xl" />
    <div>
      <UAlert
        color="neutral"
        variant="soft"
        :title="`Current version: v${currentlyVersion}`"
      >
        <template #description>
          <UCheckbox
            class="my-3 select-none"
            label="Auto search for updates"
            color="neutral"
            v-model:model-value="autoSearchUpdates"
            v-on:update:model-value="
              saveConfig('auto_search_updates', autoSearchUpdates)
            "
          />
          <UButton
            size="xl"
            color="neutral"
            variant="soft"
            icon="heroicons:magnifying-glass"
            loadingAuto
            @click="async () => await checkForAppUpdates(true)"
            label="Search for updates"
          />
        </template>
      </UAlert>
    </div>
    <USeparator label="Reader" size="xl" />
    <UAlert color="neutral" variant="soft">
      <template #description>
        <UCheckbox
          class="my-3 select-none"
          label="Auto enter in fullscreen"
          color="neutral"
          v-model:model-value="autoEnterFullscreen"
          v-on:update:model-value="
            saveConfig('auto_enter_fullscreen', autoEnterFullscreen)
          "
        />
      </template>
    </UAlert>
  </div>
</template>
