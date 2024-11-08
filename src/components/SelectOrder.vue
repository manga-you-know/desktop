<script setup lang="ts">
const order = useState<{ id: string; icon: string }>("order", () => {
    return { id: "id asc", icon: "i-heroicons-chevron-up-solisd" };
});
const orders = [
    {
        id: "id asc",
        icon: "i-heroicons-chevron-up-solid",
    },
    {
        id: "id desc",
        icon: "i-heroicons-chevron-down-solid",
    },
    {
        id: "name asc",
        icon: "i-heroicons-chevron-double-up-solid",
    },
    {
        id: "name desc",
        icon: "i-heroicons-chevron-double-down-solid",
    },
];
</script>

<template>
    <USelectMenu class="w-20" v-model="order" :options="orders" color="cyan">
        <template #label>
            <UIcon :name="order.icon" class="w-5 h-5" />
        </template>
        <template #trailing>
            <UIcon name="i-heroicons-arrows-up-down-20-solid" class="w-5 h-5" />
        </template>
    </USelectMenu>
</template>
