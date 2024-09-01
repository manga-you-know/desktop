<script setup lang="ts">
  const isDivMainHidden = useState<Boolean>('isDivMainHidden', () => false)
    function enableSidebar() {
        isDivMainHidden.value = false
    }
</script>

<template>
    <div class="p-2 h-full w-full items-center grid justify-items-center" >
        <UButton @click="enableSidebar">Enable Sidebar</UButton>
    </div>
</template>