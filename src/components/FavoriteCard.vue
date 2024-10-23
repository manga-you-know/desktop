<script setup lang="ts">
  import { FavoriteDB } from '~/database';
  import type { Favorite, User } from '~/models';
  const { favorite } = defineProps<{
    favorite: Favorite;
  }>();
  const user = useState<User>('user');
  const isFavoriteOpen = useState<boolean>('isFavoriteOpen', () => false);
  const isEditFavoriteOpen = useState<boolean>('isEditFavoriteOpen', () => false);
  const favoriteOpen = useState<Favorite>('favorite');
  const favorites = useState<Favorite[]>('favorites');
  const isSelecting = useState<boolean>('isSelecting');
  const openPopover = ref(false);
  function openFavorite() {
    favoriteOpen.value = favorite;
    isFavoriteOpen.value = true;
  }

  function openEditFavorite() {
    favoriteOpen.value = favorite;
    isEditFavoriteOpen.value = true;
  }

  async function deleteFavorite() {
    await FavoriteDB.deleteFavorite(favorite);
    favorites.value = await FavoriteDB.getFavorites(user.value.id);
  }
</script>

<template>
  <div class="relative bg-gray-900 rounded-xl h-[280px] w-40 flex flex-col  !p-0 items-center hover:bg-gray-800 hover:cursor-pointer hover:shadow-lg transition-transform duration-300 ease-in-out transform hover:scale-[1.08] hover:z-50 border border-transparent hover:border-white hover:border-1 outline-none focus:bg-gray-800 focus:shadow-lg focus:scale-[1.08] focus:z-50 focus:border-white focus:border-1" @click="openFavorite" @keydown.enter="openFavorite" @mouseleave="openPopover = false" tabindex="1">
    <UCheckbox
      v-if="isSelecting"
    />
    <UTooltip :prevent="favorite.name.length < 17" :text=favorite.name>
      <UBadge class="w-36 m-1 flex justify-center cursor-default" color="white" variant="solid" >
        {{ favorite.name.substring(0, 16) + (favorite.name.length > 16? "..." : "") }}
      </UBadge>
    </UTooltip>
    <div class="w-36 h-52">
      <NuxtImg :src="favorite.cover" class="w-36 h-52 object-contain rounded-xl select-none "/>
    </div>
    <UButtonGroup orientation="horizontal" class="w-full h-10 flex justify-center">
      <UButton
        @click="openFavorite"
        class="h-10 hover:bg-gray-900"
        color="gray"
        variant="ghost"
        icon="i-heroicons-book-open-solid"
        tabindex="-1"
      />
      <UButton
        @click.stop
        @click="openEditFavorite"
        color="gray"
        class="hover:bg-gray-900"
        variant="ghost"
        icon="i-heroicons-pencil-square-solid"
        tabindex="-1"
      />
      <UPopover
        v-model:open="openPopover"
        :popper="{ arrow: true, placement: 'left' }"
      >
        <UButton
          class="h-10 hover:bg-gray-900"
          @click.stop
          @click="openPopover = true"
          color="gray"
          variant="ghost"
          icon="i-heroicons-x-circle-solid"
          tabindex="-1"
        />
        <template #panel>
          <div class="p-2 flex flex-row rounded-lg hover:cursor-auto" @click.stop>
            <UBadge class="rounded-xl" color="white">Delete?</UBadge>
            <UButton
              @click="deleteFavorite"
              color="primary"
              class="m-0.5 rounded-xl"
            >
              Yes
            </UButton>
            <UButton
              @click="openPopover = false"
              color="red"
              class="m-0.5 rounded-xl"
            >
              No
            </UButton>
          </div>
        </template>
      </UPopover>
    </UButtonGroup>
  </div>
</template>