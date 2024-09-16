
<script setup lang="ts">
  import { getCurrentWindow } from "@tauri-apps/api/window";
  const mangaSources = [
    'MangaSee', 'MangaDex'
  ]
  async function search() {
    // const response = await $fetch('/api/test', {method: 'POST'})
    // console.log(response.body)
  }



  const currentWindow = getCurrentWindow()
  const source = ref(mangaSources[0])
  const isOpen = useState<Boolean>('isSearchOpen', () => false)
  const diff = ref(true)
</script>

<template>
  <div class="flex m-5 gap-1 justify-end h-full w-full">
    <div>
      <UTooltip text="Search" :shortcuts="['Ctrl', 'K']">
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-magnifying-glass-20-solid"
          @click="isOpen = true"
        />
      </UTooltip>
    </div>
    <div>
      <USelectMenu 
        v-model="source"
        :options="mangaSources"
      />
    </div>
  </div>
</template>
