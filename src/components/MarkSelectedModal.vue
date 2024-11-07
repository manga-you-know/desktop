<script lang="ts" setup>
import { MarkDB, MarkFavoriteDB } from "~/database";
import type { Favorite, Mark } from "~/models";
const selectedFavorites = useState<Favorite[]>("selectedFavorites");
const marks = ref<Mark[]>([]);
const isSelecting = useState<boolean>("isSelecting", () => false);
const isMarkSelectedModalOpen = useState<boolean>(
    "isMarkSelectedModalOpen",
    () => false,
);

async function addSelectedToMark(mark: Mark) {
    await MarkFavoriteDB.addMarkFavorites(selectedFavorites.value, mark.id);
    isMarkSelectedModalOpen.value = false;
    isSelecting.value = false;
}

watch(isMarkSelectedModalOpen, async () => {
    marks.value = await MarkDB.getMarks();
});

onMounted(async () => {
    marks.value = await MarkDB.getMarks();
});
</script>

<template>
    <UModal>
        <div class="p-4 flex justify-center items-center flex-col w-full">
            <UBadge color="white">
                Select the marks you want to add to the
                {{ selectedFavorites.length }}
                favorites
            </UBadge>
            <div class="h-40 overflow-y-scroll m-2">
                <div
                    class="flex flex-col gap-2"
                    v-for="mark in marks"
                    :key="mark.id"
                >
                    <UButtonGroup class="m-0.5" orientation="horizontal">
                        <UInput
                            disabled
                            v-model="mark.name"
                            color="cyan"
                            icon="i-heroicons-archive-box"
                            class="w-[200px] pointer-events-none"
                        />
                        <UButton
                            color="cyan"
                            icon="i-heroicons-plus-circle-solid"
                            @click="async () => await addSelectedToMark(mark)"
                        />
                    </UButtonGroup>
                </div>
            </div>
        </div>
    </UModal>
</template>
