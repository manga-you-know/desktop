<script setup lang="ts">
  const isDivMainHidden = useState<Boolean>('isDivMainHidden', () => false)
    function enableSidebar() {
        isDivMainHidden.value = false
    }
</script>

<template>
    <div class="h-full w-full items-center grid justify-items-center" >
        <!-- <UButton @click="enableSidebar">Enable Sidebar</UButton> -->
        <NuxtImg src="https://scans-hot.leanbox.us/manga/Dandadan/0164-001.png" placeholder  class="max-h-screen w-max-screen" />
    </div>
</template>