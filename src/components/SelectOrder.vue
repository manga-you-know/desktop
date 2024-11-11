<script setup lang="ts">
import { load } from "@tauri-apps/plugin-store";

const config = await load("config.json");
const order = useState<{ type: string; icon: string }>("order", () => {
    return { type: "id", icon: "mdi:sort" };
});
const orders = [
    {
        type: "id",
        icon: "mdi:sort",
    },
    {
        type: "name",
        icon: "mdi:sort-alphabetical-variant",
    },
    // {
    //     type: "grade",
    //     icon: "mdi:sort-numeric-variant",
    // },
];
const icons: { [key: string]: string } = {
    id: "mdi:sort",
    name: "mdi:sort-alphabetical-variant",
};
const isAsc = useState<boolean>("isAsc", () => true);

onMounted(async () => {
    const [savedType, savedIsAsc] = await Promise.all([
        config.get<string>("order_type"),
        config.get<boolean>("is_asc"),
    ]);
    if (savedType && savedIsAsc) {
        order.value = { type: savedType, icon: icons[savedType] };
        isAsc.value = savedIsAsc;
    }
});
</script>

<template>
    <UButtonGroup>
        <USelectMenu
            class="w-16"
            v-model="order"
            :options="orders"
            color="white"
        >
            <template #label>
                <UIcon :name="order.icon" class="w-5 h-5" />
            </template>
        </USelectMenu>
        <UButton
            color="white"
            :icon="isAsc ? 'typcn:arrow-sorted-up' : 'typcn:arrow-sorted-down'"
            @click="
                async () => {
                    isAsc = !isAsc;
                }
            "
        />
    </UButtonGroup>
</template>
