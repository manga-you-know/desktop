<script setup lang="ts">
    const isDivMainHidden = useState<Boolean>('isDivMainHidden', () => true)
    function disableSidebar() {
        isDivMainHidden.value = true
    }
    function enableSidebar() {
        isDivMainHidden.value = false
    }
</script>

<template>
    <div>
        <h1>Configs {{ isDivMainHidden }}</h1>
        <br>
        <UButton color="red" @click="disableSidebar">Disable Sidebar</UButton>
        <br>
        <br>
        <UButton @click="enableSidebar">Enable Sidebar</UButton>
    </div>
</template>
