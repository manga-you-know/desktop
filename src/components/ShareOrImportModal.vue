<script setup lang="ts">
import { writeText, readText } from "@tauri-apps/plugin-clipboard-manager";
import { FavoriteRepository, MarkRepository } from "~/repositories";
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
    <UModal title="Share, import or export your favorites.">
        <template #body>
            <div class="flex flex-col w-full justify-center">
                <UNavigationMenu
                    class="border-b border-gray-200 dark:border-gray-800"
                    color="neutral"
                    :items="[
                        {
                            label: 'Share',
                            active: localRoute === 'share',
                            icon: 'heroicons:share',
                            onSelect: () => (localRoute = 'share'),
                        },
                        {
                            label: 'Export',
                            active: localRoute === 'export',
                            icon: 'mdi:export-variant',
                            onSelect: () => (localRoute = 'export'),
                        },
                        {
                            label: 'Import',
                            active: localRoute === 'import',
                            icon: 'mdi:invoice-import-outline',
                            onSelect: () => (localRoute = 'import'),
                        }
                    ]"
                />
                <div class="" v-if="localRoute === 'share'">
                    <UBadge
                        class="w-full my-2"
                        color="neutral"
                        variant="soft"
                        size="md"
                    >
                        Export your favorites in a list to share them with
                        others.
                    </UBadge>
                    <div class="flex justify-center gap-4">
                        <UTextarea
                            color="neutral"
                            v-model="shareText"
                            :rows="5"
                        />
                        <div class="flex flex-col gap-1">
                            <UTooltip
                                :text="sourceSearch"
                                :prevent="
                                    sourceSearch === '-' ||
                                    sourceSearch.length < 15
                                "
                            >
                                <USelectMenu
                                    class="w-40"
                                    searchable
                                    clear-search-on-close
                                    v-model="sourceSearch"
                                    :items="sources"
                                    color="neutral"
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
                                    :items="marks"
                                    color="neutral"
                                    @click="fetchMarks"
                                />
                            </UTooltip>
                            <UButtonGroup class="mt-1">
                                <UButton
                                    size="xl"
                                    color="neutral"
                                    variant="soft"
                                    icon="mdi:database-search-outline"
                                    @click="
                                        async () => {
                                            shareText = (
                                                await FavoriteRepository.getFavorites()
                                            )
                                                .map(
                                                    (favorite) => favorite.name,
                                                )
                                                .join('\n');
                                        }
                                    "
                                    label="Fetch"
                                />
                                <UButton
                                    size="xl"
                                    color="neutral"
                                    variant="outline"
                                    icon="mdi:clipboard-multiple-outline"
                                    trailing
                                    @click="
                                        async () => {
                                            await writeText(shareText);
                                        }
                                    "
                                    label="Copy"
                                />
                            </UButtonGroup>
                        </div>
                    </div>
                </div>
                <div v-if="localRoute === 'export'">
                    <UBadge
                        class="w-full my-2"
                        color="neutral"
                        variant="soft"
                        size="md"
                    >
                        Export your favorites to use in other app.
                    </UBadge>
                    <div class="flex justify-center gap-4">
                        <UTextarea
                            color="neutral"
                            v-model="exportTextJson"
                            :rows="5"
                        />
                        <div class="flex flex-col gap-1">
                            <UTooltip
                                :text="sourceSearch"
                                :prevent="
                                    sourceSearch === '-' ||
                                    sourceSearch.length < 15
                                "
                            >
                                <USelectMenu
                                    class="w-40"
                                    searchable
                                    clear-search-on-close
                                    v-model="sourceSearch"
                                    :items="sources"
                                    color="neutral"
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
                                    :items="marks"
                                    color="neutral"
                                    @click="fetchMarks"
                                />
                            </UTooltip>
                            <UButtonGroup class="mt-1">
                                <UButton
                                    size="xl"
                                    color="neutral"
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
                                    label="Fetch"
                                />
                                <UButton
                                    size="xl"
                                    color="neutral"
                                    variant="outline"
                                    icon="mdi:clipboard-multiple-outline"
                                    trailing
                                    @click="
                                        async () => {
                                            await writeText(exportTextJson);
                                        }
                                    "
                                    label="Copy"
                                />
                            </UButtonGroup>
                        </div>
                    </div>
                </div>
                <div v-if="localRoute === 'import'">
                    <UBadge
                        class="w-full my-2"
                        color="neutral"
                        variant="soft"
                        size="md"
                    >
                        Import your favorites from other app.
                    </UBadge>
                    <div class="flex justify-center gap-4">
                        <UTextarea
                            color="neutral"
                            v-model="importTextJson"
                            :rows="5"
                        />
                        <div
                            class="flex flex-col justify-center items-center gap-1"
                        >
                            <UButtonGroup class="w-40">
                                <UButton
                                    size="xl"
                                    color="neutral"
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
                                    label="Import"
                                />
                                <UButton
                                    size="xl"
                                    color="neutral"
                                    variant="outline"
                                    icon="mdi:content-paste"
                                    trailing
                                    @click="
                                        async () => {
                                            importTextJson = await readText();
                                        }
                                    "
                                    label="Paste"
                                />
                            </UButtonGroup>
                            <UBadge
                                class="justify-center w-40 h-16 mt-1"
                                :color="
                                    !importError && !importSuccess
                                        ? 'neutral'
                                        : importSuccess
                                          ? 'primary'
                                          : 'error'
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
                                {{
                                    importSuccess
                                        ? "Sucess in your import!!"
                                        : ""
                                }}
                            </UBadge>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </UModal>
</template>
