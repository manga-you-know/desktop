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
            class="w-[0px]"
            :icon="order.icon"
            :search-input="false"
            v-model="order"
            :content="{
                align: 'center',
                side: 'bottom',
            }"
            :items="orders"
            color="neutral"
            variant="outline"
        >
            <template #label>
                <UIcon :name="order.icon" class="w-5 h-5" />
            </template>
        </USelectMenu>
        <UButton
            size="xl"
            color="neutral"
            variant="outline"
            :icon="isAsc ? 'typcn:arrow-sorted-up' : 'typcn:arrow-sorted-down'"
            @click="
                async () => {
                    isAsc = !isAsc;
                }
            "
        />
    </UButtonGroup>
</template>
