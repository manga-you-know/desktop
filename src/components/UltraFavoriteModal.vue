<script lang="ts" setup>
  import type { Favorite, Chapter } from "~/models";
  const ultraChapters = useState<{
    [key: string]: {
      chapters: Chapter[];
      allChapters: Chapter[];
      self: Favorite;
    };
  }>("ultraChapters", () => ({}));
</script>

<template>
  <UModal title="Read the next chapters">
    <template #body>
      <div class="flex justify-center">
        <div class="w-[50%] h-82 flex flex-col justify-center">
          <UButton
            class="h-42"
            label="Start"
            icon="i-lucide-play"
            color="neutral"
            variant="outline"
            block
            :disabled="Object.keys(ultraChapters).length === 0"
            @click="navigateTo(`/read-ultrafavorites`)"
          />
        </div>
        <div class="w-[50%] h-82 flex flex-col overflow-y-auto">
          <div
            class="ml-2 mt-1"
            v-for="ultraFavorite in Object.values(ultraChapters)"
            :key="ultraFavorite.self.id"
          >
            <UCollapsible class="flex flex-col gap-2 w-48">
              <UButton
                class="group justify-between"
                :label="ultraFavorite.self.name"
                color="neutral"
                variant="subtle"
                block
              >
                <template #trailing>
                  <div class="flex items-center gap-1">
                    +{{ ultraFavorite.chapters.length }}
                    <UIcon
                      size="xl"
                      name="i-lucide-chevron-down"
                      class="group-data-[state=open]:rotate-180 transition-transform duration-200"
                    />
                  </div>
                </template>
              </UButton>

              <template #content>
                <div class="flex flex-col gap-1">
                  <div v-for="chapter in ultraFavorite.chapters">
                    <ChapterTileUltraButton
                      :favorite="ultraFavorite.self"
                      :chapter="chapter"
                      :chapters="ultraFavorite.allChapters"
                    />
                  </div>
                </div>
              </template>
            </UCollapsible>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
