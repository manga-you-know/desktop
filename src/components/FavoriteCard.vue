<script setup lang="ts">
  import { FavoriteRepository } from "~/repositories";
  import { addSelected } from "~/hooks";
  import { deleteFavorite } from "~/functions";
  import type { Favorite } from "~/models";
  const { favorite } = defineProps<{
    favorite: Favorite;
  }>();
  const isFavoriteOpen = useState<boolean>("isFavoriteOpen", () => false);
  const isEditFavoriteOpen = useState<boolean>(
    "isEditFavoriteOpen",
    () => false
  );
  const favoriteOpen = useState<Favorite>("favorite");
  const favorites = useState<Favorite[]>("favorites");
  const isSelecting = useState<boolean>("isSelecting");
  const isSelected = ref(false);
  const openPopover = ref(false);
  async function handleClick() {
    if (isSelecting.value) {
      isSelected.value = !isSelected.value;
      await addSelected(favorite);
    } else {
      favoriteOpen.value = favorite;
      isFavoriteOpen.value = true;
    }
  }
  function openFavorite() {
    favoriteOpen.value = favorite;
    isFavoriteOpen.value = true;
  }

  function openEditFavorite() {
    favoriteOpen.value = favorite;
    isEditFavoriteOpen.value = true;
  }

  watch(isSelecting, () => {
    if (isSelecting.value) {
      isSelected.value = false;
    }
  });
</script>

<template>
  <FavoriteContextMenu :favorite="favorite">
    <div
      :class="{
        'relative rounded-xl h-[280px] w-40 flex flex-col !p-0 items-center transition-transform duration-300 ease-in-out border border-transparent outline-none': true,
        'hover:bg-gray-800 hover:cursor-pointer hover:shadow-lg hover:z-30 transform hover:scale-[1.08] hover:border-white hover:border-1 focus:bg-gray-800 focus:shadow-lg focus:scale-[1.08] focus:border-white focus:border-1':
          !isSelecting,
        'z-50': openPopover,
        'bg-gray-900': !isSelecting,
        ' shadow-lg hover:scale-[1.04]': isSelecting && !isSelected,
        'border-white': isSelecting && !isSelected,
        'border-green-400 bg-gray-700': isSelected && isSelecting,
      }"
      @click="handleClick"
      @keydown.enter="handleClick"
      @mouseleave="openPopover = false"
      tabindex="1"
    >
      <UTooltip :disabled="favorite.name.length < 17" :text="favorite.name">
        <UBadge
          class="w-36 m-1 flex justify-center cursor-default"
          color="neutral"
          variant="outline"
        >
          {{
            favorite.name.substring(0, 16) +
            (favorite.name.length > 16 ? "..." : "")
          }}
        </UBadge>
      </UTooltip>
      <div class="w-36 h-52">
        <NuxtImg
          :src="favorite.cover"
          class="w-36 h-52 object-contain rounded-xl select-none"
          draggable="false"
        />
      </div>
      <UButtonGroup
        orientation="horizontal"
        class="w-full h-10 flex justify-center"
      >
        <UButton
          size="xl"
          @click="openFavorite"
          class="h-10 hover:bg-gray-900"
          color="neutral"
          variant="ghost"
          icon="i-lucide-book-open-text"
          tabindex="-1"
        />
        <UButton
          size="xl"
          @click.stop
          @click="openEditFavorite"
          color="neutral"
          class="hover:bg-gray-900"
          variant="ghost"
          icon="heroicons:pencil-square-solid"
          tabindex="-1"
        />
        <UButton
          size="xl"
          class="h-10 hover:bg-gray-900"
          @click.stop
          @click="deleteFavorite(favorite)"
          color="neutral"
          variant="ghost"
          icon="heroicons:x-circle-solid"
          tabindex="-1"
        />
      </UButtonGroup>
    </div>
  </FavoriteContextMenu>
</template>
