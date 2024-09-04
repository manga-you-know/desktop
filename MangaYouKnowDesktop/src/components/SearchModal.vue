<script setup lang="ts">
  import type { Favorite } from '~/models/favorite';
  import { DownloadManager } from '~/managers/downloadManager';
  async function search() {
    isLoading.value = true
    try {
      
      results.value = await dlManager.search('naruto', 'MangaSee');
    } catch (error) {
      console.error('Search failed:', error);
      finished.value = error
    } finally {
      isLoading.value = false;
    }
    finished.value = 'Finished'
  }
  const finished = ref()
  const dlManager = new DownloadManager()
  const isLoading = ref(false)
  const results = ref<Favorite[]>([]);
</script>

<template>
  <UModal class="rounded-xl" :overlay="false">
    <div class="w-full  ">
      <UInput
        class="w-full "
        color="gray"
        :loading="isLoading"
        @change="search"
        placeholder="Search..."
        icon="i-heroicons-magnifying-glass-20-solid"
        
      />
    </div>
    <UDivider class="w-full h-6"/>
    <div>
      {{ finished }}
    </div>
    <div class="w-full h-96 overflow-y-auto">
      <div v-for="result in results">
        {{ result.name }}
      </div>
    </div>
    
  </UModal>
</template>