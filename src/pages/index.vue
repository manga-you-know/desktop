<script setup lang="ts">
  import { load } from "@tauri-apps/plugin-store";
  import { FavoriteRepository } from "~/repositories";
  import { MANGASOURCES } from "~/constants";
  import type { Favorite, Chapter } from "~/models";

  const toast = useToast();
  const store = await load("config.json");
  const rerender = useState<number>("rerenderIndex", () => 0);
  const isSearchOpen = useState<boolean>("isSearchOpen", () => false);
  const isAddOpen = useState<boolean>("isAddOpen", () => false);
  const ultraFavorites = useState<Favorite[]>("ultraFavorites", () => []);
  const sourceSearch = useState<string>("sourceSearch", () => MANGASOURCES[0]);
  const isModalOpen = ref(false);
  const sourceResult = await store.get<string>("source_search");
  sourceSearch.value = MANGASOURCES.includes(sourceResult ?? "")
    ? sourceResult ?? ""
    : MANGASOURCES[0];
  const ultraChapters = useState<{
    [key: string]: {
      chapters: Chapter[];
      allChapters: Chapter[];
      self: Favorite;
    };
  }>("ultraChapters", () => ({}));
  definePageMeta({
    name: "Home",
  });
  defineShortcuts({
    meta_r: {
      usingInput: true,
      handler: () => {
        rerender.value++;
      },
    },
  });
  async function readUltraFavorites() {
    if (Object.keys(ultraChapters.value).length > 0) {
      await navigateTo("/read-ultrafavorites");
    } else {
      toast.add({
        title: "Nothing to read",
        description: "no new chapters in your ultra favorites",
        color: "warning",
        icon: "i-lucide-warning",
        duration: 5000,
      });
      await navigateTo("/");
      return;
    }
  }
  onMounted(async () => {
    ultraFavorites.value = await FavoriteRepository.getUltraFavorites();
  });
</script>

<template>
  <UltraFavoriteModal v-model:open="isModalOpen" />
  <div :key="rerender" class="h-full w-full flex flex-col">
    <div class="w-full h-16 flex justify-between">
      <div class="m-5">
        <UButton
          size="xl"
          color="neutral"
          variant="ghost"
          icon="i-lucide-play"
          @click="readUltraFavorites"
        />
        <UChip
          class="select-none"
          size="xl"
          color="neutral"
          :show="Object.keys(ultraChapters).length > 0"
          :text="`+${Object.keys(ultraChapters).length}`"
        >
          <UButton
            size="xl"
            color="neutral"
            variant="ghost"
            icon="i-lucide-book-text"
            @click="isModalOpen = true"
          />
        </UChip>
      </div>
      <div class="m-5 gap-1 flex">
        <div>
          <UTooltip text="Add manga" :kbds="['Ctrl', 'O']">
            <UButton
              size="xl"
              color="neutral"
              variant="ghost"
              icon="i-lucide-plus"
              @click="isAddOpen = true"
            />
          </UTooltip>
          <UTooltip text="Search" :kbds="['Ctrl', 'K']">
            <UButton
              size="xl"
              color="neutral"
              variant="ghost"
              icon="i-lucide-search"
              @click="isSearchOpen = true"
            />
          </UTooltip>
          <UTooltip text="Refresh" :shortcuts="['Ctrl', 'R']">
            <UButton
              size="xl"
              color="neutral"
              variant="ghost"
              icon="heroicons:arrow-path-solid"
              @click="rerender++"
            />
          </UTooltip>
        </div>
        <div>
          <USelectMenu
            searchable
            class="w-[150px] select-none"
            clear-search-on-close
            v-model="sourceSearch"
            v-on:update:model-value="
              async () => await store.set('source_search', sourceSearch)
            "
            :items="MANGASOURCES"
            color="neutral"
          />
        </div>
      </div>
    </div>
    <div
      class="h-[calc(100vh-4rem)] w-full pb-5 flex flex-row flex-wrap gap-2 overflow-y-auto overflow-x-hidden"
    >
      <div v-for="favorite in ultraFavorites" :key="favorite.name">
        <UltraFavoriteCard :favorite="favorite" />
      </div>
    </div>
  </div>
</template>
