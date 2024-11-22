<script setup lang="ts">
import { FavoriteRepository } from "~/repositories";
import type { Favorite, User } from "~/models";

const isEditFavoriteOpen = useState<boolean>("isEditFavoriteOpen");
const favorite = useState<Favorite>("favorite");
const user = useState<User>("user");
const isLoading = ref(false);
const name = ref(favorite.value.name);
const cover = ref(favorite.value.cover);
const extra_name = ref(favorite.value.extra_name);
const title_color = ref(favorite.value.title_color);
const card_color = ref(favorite.value.card_color);
const grade = ref(favorite.value.grade);
const author = ref(favorite.value.author);

async function onClose() {
    isEditFavoriteOpen.value = false;
    await new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, 10);
    });
}
async function updateFavorite() {
    favorite.value.name = name.value || favorite.value.name;
    favorite.value.cover = cover.value || favorite.value.cover;
    favorite.value.extra_name = extra_name.value || favorite.value.extra_name;
    favorite.value.title_color =
        title_color.value || favorite.value.title_color;
    favorite.value.card_color = card_color.value || favorite.value.card_color;
    favorite.value.grade = grade.value || 0;
    favorite.value.author = author.value || favorite.value.author;
    await FavoriteRepository.updateFavorite(favorite.value);
}
</script>

<template>
    <UModal title="Edit your favorite" class="rounded-xl" @close="onClose">
        <template #body>
            <div class="flex flex-col gap-2">
                <UInput
                    color="neutral"
                    v-model:model-value="name"
                    v-on:update:model-value="updateFavorite"
                />
                <UInput
                    color="neutral"
                    v-model:model-value="cover"
                    v-on:update:model-value="updateFavorite"
                />
            </div>
        </template>
    </UModal>
</template>
