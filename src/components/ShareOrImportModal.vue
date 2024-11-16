<script setup lang="ts">
import { writeText, readText } from "@tauri-apps/plugin-clipboard-manager";
import { FavoriteRepository, MarkRepository } from "~/database";
const localRoute = ref("share");
const shareText = ref("");
const exportTextJson = ref("");
const importTextJson = ref("");
const importSuccess = ref(false);
const importError = ref(false);
const marks = ref([
    "-",
    ...(await MarkRepository.getMarks()).map((mark) => mark.name),
]);
const sources = ref(["-", ...(await FavoriteRepository.getFavoriteSources())]);
const sourceSearch = useState<string>("sourceQuery");
const currentlyMark = useState<string>("mark");
async function fetchMarks() {
    marks.value = [
        "-",
        ...(await MarkRepository.getMarks()).map((mark) => mark.name),
    ];
}
async function fetchSources() {
    sources.value = ["-", ...(await FavoriteRepository.getFavoriteSources())];
}
</script>

<template>
    <UModal>
        <div class="flex flex-col w-full justify-center p-4">
            <UBadge
                class="justify-center"
                size="xl"
                color="cyan"
                variant="outline"
            >
                Share, import or export your favorites.
            </UBadge>
            <UHorizontalNavigation
                color="cyan"
                :links="[
                    {
                        label: 'Share',
                        active: localRoute === 'share',
                        icon: 'heroicons:share',
                        click: () => (localRoute = 'share'),
                    },
                    {
                        label: 'Export',
                        active: localRoute === 'export',
                        icon: 'mdi:export-variant',
                        click: () => (localRoute = 'export'),
                    },
                    {
                        label: 'Import',
                        active: localRoute === 'import',
                        icon: 'mdi:invoice-import-outline',
                        click: () => (localRoute = 'import'),
                    },
                ]"
                tabindex="-1"
                class="border-b border-gray-200 dark:border-gray-800"
                :ui="{
                    active: 'after:bg-cyan-500 dark:after:bg-cyan-400',
                    base: 'focus-visible:ring-cyan-500 dark:focus-visible:ring-cyan-400',
                }"
            >
                <template #default="{ link }">
                    <span
                        class="group-hover:text-cyan-300 border-cyan-500 relative"
                        >{{ link.label }}</span
                    >
                </template>
            </UHorizontalNavigation>
            <div class="" v-if="localRoute === 'share'">
                <UBadge
                    class="w-full my-2"
                    color="cyan"
                    variant="soft"
                    size="md"
                >
                    Export your favorites in a list to share them with others.
                </UBadge>
                <div class="flex justify-center gap-4">
                    <UTextarea color="cyan" v-model="shareText" :rows="5" />
                    <div class="flex flex-col gap-1">
                        <UTooltip
                            :text="sourceSearch"
                            :prevent="
                                sourceSearch === '-' || sourceSearch.length < 15
                            "
                        >
                            <USelectMenu
                                class="w-40"
                                searchable
                                clear-search-on-close
                                v-model="sourceSearch"
                                :options="sources"
                                color="cyan"
                                @click="fetchSources"
                            />
                        </UTooltip>
                        <UTooltip
                            :text="currentlyMark"
                            :prevent="
                                currentlyMark === '-' ||
                                currentlyMark.length < 15
                            "
                        >
                            <USelectMenu
                                class="w-40"
                                searchable
                                clear-search-on-close
                                v-model="currentlyMark"
                                :options="marks"
                                color="cyan"
                                @click="fetchMarks"
                            />
                        </UTooltip>
                        <UButtonGroup class="mt-1">
                            <UButton
                                color="cyan"
                                variant="soft"
                                icon="mdi:database-search-outline"
                                @click="
                                    async () => {
                                        shareText = (
                                            await FavoriteRepository.getFavorites()
                                        )
                                            .map((favorite) => favorite.name)
                                            .join('\n');
                                    }
                                "
                            >
                                Fetch
                            </UButton>
                            <UButton
                                color="cyan"
                                variant="outline"
                                icon="mdi:clipboard-multiple-outline"
                                trailing
                                @click="
                                    async () => {
                                        await writeText(shareText);
                                    }
                                "
                            >
                                Copy
                            </UButton>
                        </UButtonGroup>
                    </div>
                </div>
            </div>
            <div v-if="localRoute === 'export'">
                <UBadge
                    class="w-full my-2"
                    color="cyan"
                    variant="soft"
                    size="md"
                >
                    Export your favorites to use in other app.
                </UBadge>
                <div class="flex justify-center gap-4">
                    <UTextarea
                        color="cyan"
                        v-model="exportTextJson"
                        :rows="5"
                    />
                    <div class="flex flex-col gap-1">
                        <UTooltip
                            :text="sourceSearch"
                            :prevent="
                                sourceSearch === '-' || sourceSearch.length < 15
                            "
                        >
                            <USelectMenu
                                class="w-40"
                                searchable
                                clear-search-on-close
                                v-model="sourceSearch"
                                :options="sources"
                                color="cyan"
                                @click="fetchSources"
                            />
                        </UTooltip>
                        <UTooltip
                            :text="currentlyMark"
                            :prevent="
                                currentlyMark === '-' ||
                                currentlyMark.length < 15
                            "
                        >
                            <USelectMenu
                                class="w-40"
                                searchable
                                clear-search-on-close
                                v-model="currentlyMark"
                                :options="marks"
                                color="cyan"
                                @click="fetchMarks"
                            />
                        </UTooltip>
                        <UButtonGroup class="mt-1">
                            <UButton
                                color="cyan"
                                variant="soft"
                                icon="mdi:database-search-outline"
                                @click="
                                    async () => {
                                        exportTextJson = JSON.stringify(
                                            await FavoriteRepository.getFavorites(),
                                            null,
                                            2,
                                        );
                                    }
                                "
                            >
                                Fetch
                            </UButton>
                            <UButton
                                color="cyan"
                                variant="outline"
                                icon="mdi:clipboard-multiple-outline"
                                trailing
                                @click="
                                    async () => {
                                        await writeText(exportTextJson);
                                    }
                                "
                            >
                                Copy
                            </UButton>
                        </UButtonGroup>
                    </div>
                </div>
            </div>
            <div v-if="localRoute === 'import'">
                <UBadge
                    class="w-full my-2"
                    color="cyan"
                    variant="soft"
                    size="md"
                >
                    Import your favorites from other app.
                </UBadge>
                <div class="flex justify-center gap-4">
                    <UTextarea
                        color="cyan"
                        v-model="importTextJson"
                        :rows="5"
                    />
                    <div
                        class="flex flex-col justify-center items-center gap-1"
                    >
                        <UButtonGroup class="w-40">
                            <UButton
                                color="cyan"
                                variant="soft"
                                icon="mdi:database-plus-outline"
                                @click="
                                    async () => {
                                        importSuccess = false;
                                        importError = false;
                                        try {
                                            const contentJson =
                                                JSON.parse(importTextJson);
                                            await FavoriteRepository.createFavoritesFromJson(
                                                contentJson,
                                            );
                                            importSuccess = true;
                                        } catch (e) {
                                            console.log(e);
                                            importError = true;
                                        }
                                    }
                                "
                            >
                                Import
                            </UButton>
                            <UButton
                                color="cyan"
                                variant="outline"
                                icon="mdi:content-paste"
                                trailing
                                @click="
                                    async () => {
                                        importTextJson = await readText();
                                    }
                                "
                            >
                                Paste
                            </UButton>
                        </UButtonGroup>
                        <UBadge
                            class="justify-center w-40 h-16 mt-1"
                            :color="
                                !importError && !importSuccess
                                    ? 'cyan'
                                    : importSuccess
                                      ? 'primary'
                                      : 'red'
                            "
                            variant="soft"
                        >
                            {{
                                !importError && !importSuccess
                                    ? "Waiting for import..."
                                    : ""
                            }}
                            {{
                                importError
                                    ? "There is a error in your database import"
                                    : ""
                            }}
                            {{ importSuccess ? "Sucess in your import!!" : "" }}
                        </UBadge>
                    </div>
                </div>
            </div>
        </div>
    </UModal>
</template>
