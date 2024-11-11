<script setup lang="ts">
const order = useState<{ type: string; icon: string }>("order", () => {
    return { type: "id", icon: "mdi:sort" };
});
const isAsc = useState<boolean>("isAsc", () => true);
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
