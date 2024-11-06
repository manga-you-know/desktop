<script setup lang="ts">
import { MarkDB } from "~/database";
const mark = ref("");

async function addMark() {
    if (mark.value == "-") {
        return;
    }
    if (mark.value) {
        if (await MarkDB.addMark(mark.value)) {
            mark.value = "";
            return;
        }
    }
}
</script>

<template>
    <UModal>
        <div class="flex flex-col justify-center items-center">
            Add a new Mark!
            <UButtonGroup orientation="horizontal">
                <UInput
                    v-model="mark"
                    placeholder="Mark..."
                    color="cyan"
                    icon="i-heroicons-archive-box"
                    class="w-[200px]"
                    @keydown.enter="addMark"
                />
                <UButton
                    color="cyan"
                    icon="i-heroicons-plus-circle-solid"
                    @click="addMark"
                />
            </UButtonGroup>
        </div>
    </UModal>
</template>
