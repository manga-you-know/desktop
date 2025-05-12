<script lang="ts">
  import { Button, Label } from "@/lib/components";
  import type { Chapter, Favorite } from "@/types";
  import Icon from "@iconify/svelte";
  import {
    addReadedBelow,
    refreshReadeds,
    isReaded,
    openPlayer,
  } from "@/functions";
  import { useMpv } from "@/store";
  import { downloadManager, globalChapters, readeds } from "@/store";
  import { goto } from "$app/navigation";

  interface Event {
    stopPropagation: () => void;
  }

  interface Props {
    favorite: Favorite;
    chapter: Chapter;
    isWatching: boolean;
  }

  let { favorite, chapter, isWatching = $bindable(false) }: Props = $props();

  async function openEpisode() {
    isWatching = true;
    const episode = await $downloadManager.getEpisodeContent(chapter);
    if ($useMpv) {
      await openPlayer(episode, chapter.title);
      await addReadedBelow(
        chapter,
        $globalChapters.map((c) => {
          c.chapter_id = c.chapter_id.split("<token>")[0];
          return c;
        }),
        favorite
      );
      await refreshReadeds(favorite);
      isWatching = false;
    } else {
      goto(`/player/${favorite.id}/${$globalChapters.indexOf(chapter)}`);
    }
  }
</script>

<Button
  class="w-24 h-20 group relative flex justify-between items-center rounded-md group"
  variant="ghost"
  size="sm"
  onclick={openEpisode}
>
  <img
    src={chapter.thumbnail ?? "/myk.png"}
    alt={chapter.title}
    class="w-20 h-14 object-cover"
  />
  <div
    class="absolute top-0 left-0 w-full h-full flex flex-col justify-between items-center"
  >
    <Label
      class="group-hover:underline group-hover:underline-offset-4 truncate w-24 text-start text-xs bg-black"
    >
      {chapter.number}: {chapter.title}
    </Label>
    <Button
      class="h-7 w-7 group-hover:bg-gray-700"
      variant="ghost"
      size="sm"
      tabindex={-1}
      onclick={async (e: Event) => {
        e.stopPropagation();
        const chaptersToAdd = $globalChapters.map((chapter) => {
          const chapterId = chapter.chapter_id.split("<token>")[0];
          chapter.chapter_id = chapterId;
          return chapter;
        });
        await addReadedBelow(chapter, chaptersToAdd.toReversed(), favorite);
        await refreshReadeds(favorite);
      }}
      ><Icon
        icon={isReaded(
          { ...chapter, chapter_id: chapter.chapter_id.split("<token>")[0] },
          $readeds
        ) !== undefined
          ? "lucide:check"
          : "lucide:minus"}
        class="w-5 h-5"
      />
    </Button>
  </div>
</Button>
