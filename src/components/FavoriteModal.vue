<script setup lang="ts">
import { FavoriteRepository, ReadedRepository } from "~/repositories";
import { addReadedBelow } from "~/functions";
import type { ChaptersResponse } from "~/interfaces";
import type { DownloadManager } from "~/managers";
import type { Chapter, Favorite, Readed, User } from "~/models";
const favorite = useState<Favorite>("favorite");
const dlManager = useState<DownloadManager>("dlManager");
const chapters = useState<Chapter[]>("chapters");
const chaptersDisplayed = ref<Chapter[]>([]);
const isFavoriteOpen = useState<boolean>("isFavoriteOpen");
const rerenderIndex = useState<number>("rerenderIndex");
const readeds = useState<Readed[]>("readeds");
const ultraFavorites = useState<Favorite[]>("ultraFavorites");
const chapterQuery = ref("");
const isSearching = ref(false);
const currentChapter = ref<Chapter>();
const user = useState<User>("user");
const chaptersResponse = ref<ChaptersResponse>();
const sourceLanguage = ref("default");
const languageOptions = ref(["default"]);
const isLanguagesDisable = ref(false);
async function searchChapters() {
    isSearching.value = true;
    await new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, 10);
    });
    if (chapterQuery.value === "") {
        chaptersDisplayed.value = chapters.value;
        isSearching.value = false;
        return;
    }
    chaptersDisplayed.value = chapters.value
        .filter((chapter) =>
            chapter.number.toString().includes(chapterQuery.value),
        )
        .reverse();
    isSearching.value = false;
}
function resetChapters() {
    isSearching.value = true;
    chapterQuery.value = "";
    chaptersDisplayed.value = chapters.value;
    isSearching.value = false;
}
async function updateFavoriteHandler() {
    favorite.value.is_ultra_favorite = !favorite.value.is_ultra_favorite;
    await FavoriteRepository.updateFavorite(favorite.value);
}
function isReaded(chapter: Chapter) {
    return readeds.value.find(
        (r) =>
            r.chapter_id === chapter.chapter_id &&
            r.source === favorite.value.source &&
            r.language === chapter.language,
    );
}
async function addReaded(chapter: Chapter) {
    await addReadedBelow(
        chapter,
        chapters.value,
        favorite.value,
        readeds.value,
    );
    readeds.value = await ReadedRepository.getReadeds(favorite.value);
    currentChapter.value = getNextForRead();
}
function getLastReaded() {
    return chapters.value.filter((chapter) => isReaded(chapter))[0];
}
function getNextForRead() {
    return chapters.value.filter((chapter) => !isReaded(chapter)).reverse()[0];
}
async function onClose() {
    ultraFavorites.value = await FavoriteRepository.getUltraFavorites(
        user.value.id,
    );
    rerenderIndex.value++;
}
async function updateLanguage() {
    await new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, 10);
    });
    console.log(chaptersResponse.value);
    //@ts-ignore
    chapters.value = chaptersResponse.value.chapters[sourceLanguage.value];
    chaptersDisplayed.value = chapters.value;
    currentChapter.value = getNextForRead();
}
let isChapterFetched = false;
onBeforeMount(async () => {
    chaptersDisplayed.value = [];
    //@ts-ignore
    chaptersResponse.value = await dlManager.value.getChapters(favorite.value);
    //@ts-ignore
    if (chaptersResponse.value.isMultipleLanguage) {
        //@ts-ignore
        languageOptions.value = Object.keys(chaptersResponse.value.chapters);
        sourceLanguage.value = languageOptions.value[0];
        //@ts-ignore
        chapters.value = chaptersResponse.value.chapters[sourceLanguage.value];
    } else {
        //@ts-ignore
        chapters.value = chaptersResponse.value.chapters;
        chaptersDisplayed.value = chapters.value;
        isLanguagesDisable.value = true;
    }
    isChapterFetched = true;
});
onMounted(async () => {
    if (!favorite.value) {
        return;
    }
    readeds.value = await ReadedRepository.getReadeds(favorite.value);
    chaptersDisplayed.value = [];
    while (!isChapterFetched) {
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve(true);
            }, 10);
        });
    }
    chaptersDisplayed.value = chapters.value;
    currentChapter.value = getNextForRead();
});
watch(isFavoriteOpen, async () => {
    if (isFavoriteOpen.value) {
        readeds.value = await ReadedRepository.getReadeds(favorite.value);
        currentChapter.value = getNextForRead();
    }
});
</script>

<template>
    <UModal :title="favorite.name" @close="onClose">
        <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
        />
        <template #body>
            <div
                v-if="favorite"
                class="flex flex-col justify-center items-center"
            >
                <div class="flex flex-row justify-between">
                    <div class="w-[50%] flex flex-col h-80">
                        <NuxtImg
                            :src="favorite.cover"
                            class="h-60 w-40 object-contain rounded-xl"
                        />
                        <div class="flex flex-row justify-center">
                            <UButton
                                size="xl"
                                :icon="
                                    favorite.is_ultra_favorite
                                        ? 'heroicons:star-solid'
                                        : 'heroicons:star'
                                "
                                color="neutral"
                                variant="link"
                                class="h-10 w-10 m-0.5"
                                @click="updateFavoriteHandler"
                            />
                            <!-- @vue-ignore -->
                            <USelectMenu
                                :disabled="isLanguagesDisable"
                                class="w-20 pt-2"
                                searchable
                                v-on:update:model-value="updateLanguage"
                                clear-search-on-close
                                v-model="sourceLanguage"
                                :items="languageOptions"
                                color="neutral"
                            />
                        </div>
                        <ULink
                            :to="favorite.link"
                            target="_blank"
                            class="transition-transform duration-300 ease-in-out transform hover:scale-[1.08] hover:text-violet-600"
                            >Favorite link</ULink
                        >
                    </div>
                    <div class="w-[50%] flex flex-col h-80">
                        <div
                            class="w-[200px] bg-gray-800 rounded-xl p-1 flex justify-center"
                        >
                            <div
                                class="inline-flex -space-x-px overflow-hidden rounded-md border border-gray-500 bg-slate-700 shadow-sm"
                            >
                                <button
                                    :class="[
                                        'w-[115px]',
                                        'p-0.5',
                                        'flex',
                                        'justify-start',
                                        'bg-slate-800',
                                        'font-medium',
                                        'text-white',
                                        currentChapter
                                            ? 'hover:bg-transparent'
                                            : '',
                                    ]"
                                    @click="
                                        () =>
                                            currentChapter
                                                ? navigateTo(
                                                      `/reader/${favorite.id}/${currentChapter.chapter_id}`,
                                                  )
                                                : console.log('nada')
                                    "
                                >
                                    {{
                                        currentChapter?.number || "all readed!"
                                    }}
                                </button>
                                <button
                                    class="w-[40px] bg-slate-800 font-medium text-white hover:bg-transparent"
                                    @click="console.log('nada')"
                                >
                                    <i class="fa fa-download"></i>
                                </button>
                                <button
                                    class="w-[33px] bg-slate-800 font-medium text-white hover:bg-transparent"
                                    @click="
                                        () =>
                                            currentChapter
                                                ? addReaded(currentChapter)
                                                : console.log('nada')
                                    "
                                >
                                    <i class="fa fa-angle-right" />
                                </button>
                            </div>
                        </div>
                        <UInput
                            v-model="chapterQuery"
                            v-on:update:model-value="searchChapters"
                            :loading="isSearching"
                            color="neutral"
                            placeholder="Chapters..."
                            icon="heroicons:magnifying-glass-solid"
                            class="w-50 m-0.5"
                            autocomplete="off"
                            :ui="{ icon: { trailing: { pointer: '' } } }"
                        >
                            <template #trailing>
                                <UButton
                                    size="xl"
                                    v-show="chapterQuery !== ''"
                                    color="neutral"
                                    variant="link"
                                    icon="heroicons:x-mark-20-solid"
                                    :padded="false"
                                    @click="resetChapters"
                                />
                            </template>
                        </UInput>
                        <div
                            class="h-72 bg-gray-800 rounded-xl m-1 p-1 flex flex-col overflow-y-scroll"
                        >
                            <div
                                class="m-0.5 flex flex-col items-center"
                                v-for="chapter in chaptersDisplayed"
                                :key="chapter.chapter_id"
                            >
                                <!-- Uses nested components to better performance :) -->
                                <div
                                    class="inline-flex -space-x-px overflow-hidden rounded-md border border-gray-500 bg-slate-700 shadow-sm"
                                >
                                    <button
                                        class="w-28 p-0.5 flex justify-start bg-slate-800 font-medium text-white hover:bg-transparent"
                                        @click="
                                            () =>
                                                navigateTo(
                                                    `/reader/${favorite.id}/${chapter.chapter_id}`,
                                                )
                                        "
                                    >
                                        {{ chapter.number }}
                                    </button>
                                    <button
                                        class="w-7 bg-slate-800 font-medium text-white hover:bg-transparent"
                                        @click="console.log('nada')"
                                    >
                                        <i class="fa fa-download"></i>
                                    </button>
                                    <button
                                        class="w-7 bg-slate-800 font-medium text-white hover:bg-transparent"
                                        @click="() => addReaded(chapter)"
                                    >
                                        <i
                                            :class="
                                                isReaded(chapter)
                                                    ? 'fa fa-check'
                                                    : 'fa fa-minus'
                                            "
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </UModal>
</template>
