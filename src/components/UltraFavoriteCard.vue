<script setup lang="ts">
  import { load } from "@tauri-apps/plugin-store";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { ReadedRepository } from "~/repositories";
  import { isReaded, notify } from "~/functions";
  import type { DownloadManager } from "~/managers";
  import type { Favorite, Chapter } from "~/models";

  const { favorite } = defineProps<{
    favorite: Favorite;
  }>();
  const toast = useToast();
  const window = await getCurrentWindow();
  const store = await load("ultrafavorites_data.json");
  const dlManager = useState<DownloadManager>("dlManager");
  const isFavoriteOpen = useState<boolean>("isFavoriteOpen");
  const favoriteOpen = useState<Favorite>("favorite");
  const ultraChapters = useState<{
    [key: string]: {
      chapters: Chapter[];
      allChapters: Chapter[];
      self: Favorite;
    };
  }>("ultraChapters", () => ({}));
  const isLoading = ref(false);
  const chaptersToRead = ref();
  const chaptersReaded = ref();
  onMounted(async () => {
    isLoading.value = true;
    const readeds = await ReadedRepository.getReadeds(favorite);
    const chapters = await dlManager.value.getChapters(favorite);
    isLoading.value = false;
    if (!chapters.ok) {
      chaptersToRead.value = "Error";
      chaptersReaded.value = "Error";
      return;
    }
    const chaptersLen = Number(chapters?.chapters?.length) ?? 0;
    let countToRead = 0;
    const listChapters: Chapter[] = [];
    //@ts-ignore
    for (const chapter of chapters.chapters) {
      if (isReaded(chapter, readeds)) {
        break;
      }
      listChapters.push(chapter);
      countToRead++;
    }
    if (listChapters.length > 0) {
      listChapters.reverse();
      ultraChapters.value[favorite.id ?? ""] = {
        chapters: listChapters,
        //@ts-ignore
        allChapters: chapters.chapters,
        self: favorite,
      };
    } else {
      if (ultraChapters.value[favorite.id ?? ""]) {
        delete ultraChapters.value[favorite.id ?? ""];
      }
    }
    //@ts-ignore
    chaptersToRead.value =
      countToRead > 0
        ? //@ts-ignore
          `+${countToRead}`
        : "All readed";
    chaptersReaded.value = `${chaptersLen - countToRead}/${
      //@ts-ignore
      chapters.chapters.length
    }`;
    const valToRead = await store.get<{
      chapters: number;
      chaptersReaded: number;
      chaptersToRead: number;
    }>(favorite.id?.toString() ?? "");
    if (valToRead)
      if (countToRead > valToRead.chaptersToRead) {
        if (await window.isFocused()) {
          toast.add({
            title: favorite.name,
            description: `+${countToRead - valToRead.chaptersToRead} chapters!`,
            color: "info",
            icon: "i-lucide-info",
            click: () => {
              toast.clear();
              openFavorite();
            },
          });
        } else {
          notify(
            favorite.name,
            `+${countToRead - valToRead.chaptersToRead} chapters!`
          );
        }
      }
    await store.set(favorite.id?.toString() ?? "", {
      chapters: chapters.chapters?.length ?? 0,
      chaptersReaded: chaptersLen - countToRead,
      chaptersToRead: countToRead,
    });
  });
  function openFavorite() {
    favoriteOpen.value = favorite;
    isFavoriteOpen.value = true;
  }
</script>

<template>
  <FavoriteContextMenu :favorite="favorite">
    <div>
      <div
        class="relative bg-gray-900 rounded-xl h-[280px] w-40 flex flex-col !p-0 items-center hover:bg-gray-800 hover:cursor-pointer hover:shadow-lg transition-transform duration-300 ease-in-out transform hover:scale-[1.08] hover:z-10 border border-transparent hover:border-white hover:border-2"
        @click="openFavorite"
      >
        <UTooltip
          :prevent="favorite.name.length < 17"
          :text="favorite.name"
          :popper="{ placement: 'bottom', arrow: true }"
        >
          <UBadge
            class="w-36 m-1 flex justify-center cursor-default"
            color="neutral"
            variant="soft"
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
            class="h-52 w-36 object-contain rounded-xl select-none"
          />
        </div>
        <UButtonGroup
          orientation="horizontal"
          class="w-full flex justify-center"
        >
          <UButton
            size="xl"
            @click="openFavorite"
            color="neutral"
            variant="ghost"
            icon="heroicons:book-open-solid"
          />
          <UTooltip
            arrow
            :disabled="isLoading"
            :text="chaptersReaded"
            :delay-duration="300"
            :popper="{ placement: 'top', arrow: true }"
          >
            <UButton
              size="xl"
              class="cursor-default disabled:cursor-default"
              :loading="isLoading"
              color="neutral"
              variant="ghost"
              :label="chaptersToRead"
            />
          </UTooltip>
        </UButtonGroup>
      </div>
    </div>
  </FavoriteContextMenu>
</template>
