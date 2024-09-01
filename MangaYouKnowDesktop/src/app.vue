<script setup lang="ts">
  const isDivMainHidden = useState<Boolean>('isDivMainHidden', () => false)
</script>


<template>
  <div class="flex" :class="{ 'hidden': isDivMainHidden }" >
    <Sidebar />
    <NuxtPage />
  </div>
  <div :class="isDivMainHidden ? 'visible' : 'hidden'" >
    <Reader />
  </div>
</template>
 