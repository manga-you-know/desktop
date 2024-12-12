<script lang="ts" setup>
  import { load } from "@tauri-apps/plugin-store";
  import { readText } from "@tauri-apps/plugin-clipboard-manager";
  import { FavoriteRepository } from "~/repositories";
  import { isFavorite } from "~/functions";
  import { MANGASOURCES } from "~/constants";
  import type { DownloadManager } from "~/managers";
  import type { Favorite } from "~/models";

  const toast = useToast();
  const store = await load("config.json");
  const url = ref("");
  const isLoading = ref(false);
  const color = ref("info");
  const dlManager = useState<DownloadManager>("dlManager");
  const sourceSearch = useState<string>("sourceSearch", () => MANGASOURCES[0]);
  const sourceResult = await store.get<string>("source_search");
  const isAddOpen = useState<boolean>("isAddOpen", () => false);
  const isFavoriteOpen = useState<boolean>("isFavoriteOpen");
  const favoriteOpen = useState<Favorite>("favorite");
  sourceSearch.value = MANGASOURCES.includes(sourceResult ?? "")
    ? sourceResult ?? ""
    : MANGASOURCES[0];
  async function addManga() {
    isLoading.value = true;
    color.value = "info";
    try {
      if (url.value.length === 0) {
        throw new Error("Void url");
      }
      const manga = await dlManager.value.getManga(
        url.value,
        sourceSearch.value
      );
      if (!(await isFavorite(manga))) {
        await FavoriteRepository.createFavorite(manga);
        color.value = "success";
        toast.add({
          title: "Manga added!",
          description: `${manga.name} was added to your favorites!`,
          color: "success",
          icon: "i-lucide-check",
          duration: 7000,
          click: () => {
            toast.clear();
          },
        });
      } else {
        color.value = "warning";
        toast.add({
          title: "You already have it!!!",
          description: `Is ${manga.name} that good?! `,
          color: "warning",
          icon: "i-lucide-triangle-alert",
          click: async () => {
            const hadFavorite = await FavoriteRepository.getFavoriteBySource(
              manga.source_id,
              manga.source
            );
            isAddOpen.value = false;
            favoriteOpen.value = hadFavorite;
            toast.clear();
            isFavoriteOpen.value = true;
          },
        });
      }
    } catch {
      color.value = "error";
    } finally {
      isLoading.value = false;
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 1500);
      });
      color.value = "info";
    }
  }
</script>

<template>
  <UModal title="Add your manga by URL!">
    <template #body>
      <div class="w-full h-24 flex flex-col items-center gap-2">
        <div>
          <UInput
            class="w-60"
            :disabled="sourceSearch !== 'MangaPill'"
            color="neutral"
            v-model="url"
          />
          <USelectMenu
            tabindex="-1"
            searchable
            class="w-[150px] select-none ml-4"
            placeholder="Url of the manga"
            clear-search-on-close
            v-model="sourceSearch"
            :items="MANGASOURCES"
            :disabled="isLoading"
            color="neutral"
          />
        </div>
        <div class="flex justify-start mr-20 gap-2">
          <UButton
            :color="color"
            variant="subtle"
            icon="i-lucide-plus"
            label="Add manga"
            :loading="isLoading"
            :disabled="isLoading || sourceSearch !== 'MangaPill'"
            @click="addManga"
          />
          <UButton
            icon="i-lucide-clipboard"
            color="neutral"
            variant="subtle"
            size="xl"
            :disabled="sourceSearch !== 'MangaPill'"
            @click="
              async () => {
                url = await readText();
              }
            "
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
