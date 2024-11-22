<script setup lang="ts">
import { load } from "@tauri-apps/plugin-store";
import { getCurrentWindow } from "@tauri-apps/api/window";
import Database from "@tauri-apps/plugin-sql";
import { checkForAppUpdates } from "~/functions";
import { migrationQuery } from "~/repositories";
import type { Favorite, User } from "~/models";
import { DATABASE_NAME } from "./constants";
import { DownloadManager } from "./managers/_downloadManager";
const activeSidebar = useState<boolean>("activeSidebar", () => true);
const isLogged = useState<boolean>("isLogged", () => false);
const isSearchOpen = useState<boolean>("isSearchOpen", () => false);
const isFavoriteOpen = useState<boolean>("isFavoriteOpen", () => false);
const isEditFavoriteOpen = useState<boolean>("isEditFavoriteOpen", () => false);
const isAsc = useState<boolean>("isAsc");
const order = useState<{ type: string; icon: string }>("order");
const currentWindow = getCurrentWindow();
const user = useState<User>("user");
const favorite = useState<Favorite>("favorite");
useState<DownloadManager>("dlManager", () => new DownloadManager());
const config = await load("config.json");
const icons: { [key: string]: string } = {
    id: "mdi:sort",
    name: "mdi:sort-alphabetical-variant",
};
const appConfig = useAppConfig();
defineShortcuts({
    ctrl_k: {
        usingInput: true,
        handler: () => {
            if (user.value) {
                isSearchOpen.value = !isSearchOpen.value;
            }
        },
    },
    f11: {
        usingInput: true,
        handler: async () => {
            currentWindow.setFullscreen(!(await currentWindow.isFullscreen()));
        },
    },
    // Log any key combination
});
onBeforeMount(async () => {
    const [savedType, savedIsAsc] = await Promise.all([
        config.get<string>("order_type"),
        config.get<boolean>("is_asc"),
    ]);
    if (savedType && savedIsAsc !== undefined) {
        order.value = { type: savedType, icon: icons[savedType] };
        isAsc.value = savedIsAsc;
    }
    const db = await Database.load(`sqlite:${DATABASE_NAME}`);
    const autoSearchUpdates = await config.get<boolean>("auto_search_updates");
    if (autoSearchUpdates) {
        await checkForAppUpdates();
    }
    await db.execute(migrationQuery);
});
</script>

<template>
    <UApp>
        <!-- overlay's -->
        <SearchModal v-model:open="isSearchOpen" />
        <FavoriteModal
            v-if="favorite"
            v-model:open="isFavoriteOpen"
            :key="favorite.id"
        />
        <EditFavoriteModal
            v-if="favorite"
            v-model:open="isEditFavoriteOpen"
            :key="favorite.id"
        />
        <!-- main app -->
        <div v-if="isLogged">
            <div class="flex">
                <Sidebar v-if="activeSidebar" />
                <div
                    v-if="activeSidebar"
                    class="w-[30px] min-w-[30px] md:w-[100px] md:min-w-[100px] mr-5 -z-10"
                />
                <NuxtPage />
            </div>
        </div>
        <!-- login -->
        <div class="w-full" v-if="!isLogged">
            <Login />
        </div>
    </UApp>
</template>
