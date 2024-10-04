
<script setup lang="ts">
  import { FavoriteDB } from '~/database';
  import type { Favorite, User } from '~/models';

  const user = useState<User>('user')
  const rerender = useState<number>('rerenderIndex', () => 0)
  const isOpen = useState<Boolean>('isSearchOpen', () => false)
  const ultraFavorites = useState<Favorite[]>('ultraFavorites', () => [])
  const sourceQuery = ref('')
  const mangaSources = [
    'MangaSee', 'MangaDex', 'TCB'
  ]
  const sourceSearch = useState<string>('sourceSearch', () => mangaSources[0])
  defineShortcuts({
    meta_r: {
      usingInput: true,
      handler: () => {
        rerender.value++
      }
    },
  })
  onMounted(async () => {
    ultraFavorites.value = await FavoriteDB.getUltraFavorites(user.value.id)
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
        <UTooltip text="Refresh" :shortcuts="['Ctrl', 'R']">
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-arrow-path-solid"
            @click="rerender++"
          />
        </UTooltip>
      </div>
      <div>
        <USelectMenu
          searchable
          class="w-[115px] "
          v-on:open="sourceQuery = ''"
          v-model:query="sourceQuery"
          v-model="sourceSearch"
          :options="mangaSources"
          color="cyan"
        />
      </div>
    </div>
    <div class="pb-5 flex flex-row flex-wrap gap-2">
      <div v-for="favorite in ultraFavorites" :key="favorite.name">
        <UltraFavoriteCard :favorite="favorite" />
      </div>
    </div>
  </div>
</template>
