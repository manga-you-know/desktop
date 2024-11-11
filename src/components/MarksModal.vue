<script setup lang="ts">
import { MarkRepository } from "~/database";
import type { Favorite, Mark } from "~/models";
const mark = ref("");
const marks = ref<Mark[]>([]);

async function addMark() {
    if (mark.value == "-") {
        return;
    }
    if (mark.value) {
        if (await MarkRepository.addMark(mark.value)) {
            mark.value = "";
        }
    }
    marks.value = await MarkRepository.getMarks();
}

async function updateMark(mark: Mark) {
    await MarkRepository.updateMark(mark);
    marks.value = await MarkRepository.getMarks();
}

async function deleteMark(mark: Mark) {
    await MarkRepository.deleteMark(mark);
    marks.value = await MarkRepository.getMarks();
}

onMounted(async () => {
    marks.value = await MarkRepository.getMarks();
});
</script>

<template>
    <UModal>
        <div class="flex flex-col justify-center items-center gap-2 p-2">
            <UBadge color="white">Add a new Mark!</UBadge>
            <UButtonGroup orientation="horizontal">
                <UInput
                    v-model="mark"
                    placeholder="Mark..."
                    color="cyan"
                    icon="heroicons:archive-box"
                    class="w-[220px]"
                    @keydown.enter="addMark"
                />
                <UButton
                    color="cyan"
                    icon="heroicons:plus-circle-solid"
                    @click="addMark"
                />
            </UButtonGroup>
            <div class="h-40 overflow-y-scroll m-2">
                <div class="flex flex-col" v-for="mark in marks" :key="mark.id">
                    <UButtonGroup class="m-0.5" orientation="horizontal">
                        <UInput
                            v-model="mark.name"
                            color="cyan"
                            class="w-[200px]"
                            @keydown.enter="updateMark(mark)"
                        />
                        <UButton
                            color="red"
                            icon="heroicons:x-circle-solid"
                            @click="async () => await deleteMark(mark)"
                        />
                    </UButtonGroup>
                </div>
            </div>
        </div>
    </UModal>
</template>
