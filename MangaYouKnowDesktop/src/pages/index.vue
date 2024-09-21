
<script setup lang="ts">
import type { Favorite, User } from '@prisma/client';

  const mangaSources = [
    'MangaSee', 'MangaDex', 'TCB'
  ]
  const user = useState<User>('user')
  const source = ref(mangaSources[0])
  const rerender = useState<number>('rerenderIndex', () => 0)
  const isOpen = useState<Boolean>('isSearchOpen', () => false)
  const ultraFavorites = useState<Favorite[]>('ultraFavorites', () => [])
  onMounted(async () => {
    //@ts-ignore
    ultraFavorites.value = await $fetch('/api/ultrafavorites', {
        method: 'GET',
        params: {
            userId: user.value.id,
        }
    })
  })
</script>

<template>
  <div :key="rerender" class="flex flex-col h-full w-full">
    <div class="flex m-5 gap-1 justify-end">
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
          color="cyan"
        />
      </div>
    </div>
    <div class="flex flex-row flex-wrap gap-2">
      <div v-for="favorite in ultraFavorites" :key="favorite.name">
        <UltraFavoriteCard :favorite="favorite" />
      </div>
    </div>
  </div>
</template>
