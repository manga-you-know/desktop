<script setup lang="ts">
  import type { Favorite } from '~/models/favorite';
  import { DownloadManager } from '~/managers/downloadManager';
  function resetResults() {
    query.value = ''
    results.value = []
  }

  async function search() {
    await new Promise(resolve => {
      setTimeout(() => {
        resolve(true)
      }, 10)
    })
    if (query.value === '') {
      results.value = []
      return
    }
    isLoading.value = true
    try {
      results.value = (await dlManager.search(query.value, 'MangaSee')).slice(0, 10);
    } catch (error) {
      finished.value = error
    } finally {
      isLoading.value = false;
    }
  }
  const query = ref('')
  const dlManager = new DownloadManager()
  const isLoading = ref(false)
  const results = ref<Favorite[]>([]);
  const finished = ref()
</script>

<template>
  <UModal class="rounded" :overlay="false">
    <div class="w-full h-11 flex justify-center items-center">
      <UInput
        v-on:update:model-value="search"
        v-model="query"
        name="query"
        :loading="isLoading"
        variant="none"
        :padded="false"
        class="w-[97%]"
        placeholder="Search..."
        icon="i-heroicons-magnifying-glass-20-solid"
        autocomplete="off"
        :ui="{ icon: { trailing: { pointer: '' } } }"
      >
    <template #trailing>
      <UButton
        v-show="query !== ''"
        color="gray"
        variant="link"
        icon="i-heroicons-x-mark-20-solid"
        :padded="false"
        @click="resetResults"
      />
    </template>
  </UInput>
    </div>
    <UDivider class="w-full h-1"/>
    <div class="w-full h-48 flex flex-col overflow-y-auto">
      <div v-for="result in results" :key="result.name">
          <UButton 
            @click="console.log('nada')" 
            color="gray"
            variant="ghost"
            class="w-[99%] h-10 m-0.5 flex justify-between">
             {{ result.name.substring(0, 60) + (result.name.length > 60? "..." : "") }} 
             <template #trailing>
              <UButton 
                icon="i-heroicons-bookmark" 
                color="gray" 
                variant="link"
                class="h-7"
              />
            </template>
          </UButton>

      </div>
    </div> 
  </UModal >
</template>