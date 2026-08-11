<script lang="ts">
  import { Button } from "@/lib/components";
  import type { MangaFetch, Source } from "@/types/server";
  import { Image } from "@/components";
  import {
    currentMangaTab,
    dbHelper,
    hideOnLibrary,
    openedManga,
    openedMangas,
  } from "@/states";
  import Icon from "@iconify/svelte";
  import { cn } from "@/lib/utils";
  import { animate } from "animejs";

  type Props = {
    manga: MangaFetch;
    suwaSource: Source;
  };

  let { manga, suwaSource }: Props = $props();

  let isInLibrary = $derived(
    dbHelper.sourcesBySourceIdTitle[suwaSource.id + manga.title] !== undefined,
  );
</script>

<button
  class={cn(
    "border-secondary bg-secondary/50 group/card relative z-0 flex h-95 w-64 cursor-pointer flex-col gap-2 overflow-hidden rounded-xl border p-0.5",
    isInLibrary && "fetch-card",
  )}
  onclick={() => {
    currentMangaTab.value = "read";
    const key = `fetch-${manga.id}${suwaSource.id}`;
    openedMangas.value[key] = { s: manga };
    openedManga.open(key);
  }}
>
  <Image class="h-95 w-64 rounded-lg object-cover" src={manga.thumbnailUrl} />
  <div
    class={cn(
      "bg-secondary text-primary absolute top-0 left-0 flex h-9 items-center justify-center rounded-br-xl p-1 transition-all duration-400",
      isInLibrary ? "translate-x-0" : "-translate-x-10",
    )}
  >
    <Icon class="size-5" icon="lucide:bookmark" />
  </div>
  <Button
    class={cn(
      "absolute top-1 right-1 h-8 gap-1 rounded-lg px-2 backdrop-blur-sm transition-all duration-400 group-hover/card:translate-x-0",
      isInLibrary ? "w-25 translate-x-27" : "w-18 translate-x-19",
    )}
    variant={isInLibrary ? "secondary" : "outline"}
    onclick={async (e) => {
      e.stopPropagation();
      const parent = e.currentTarget?.parentElement ?? "";
      if (isInLibrary) {
        dbHelper.deleteSource(
          dbHelper.sourcesBySourceIdTitle[manga.id + suwaSource.id],
        );
      } else {
        animate(parent, {
          filter: ["blur(2px)", "blur(4px)"],
          duration: 600,
          easing: "easeOutQuad",
        });
        await dbHelper.addSource(manga, suwaSource);
        if (hideOnLibrary.value) {
          await animate(parent, {
            opacity: [1, 0.5, 0],
            translateX: -40,
            duration: 500,
            easing: "easeInQuad",
          });
        }
      }
      animate(parent, {
        filter: isInLibrary
          ? ["blur(2px)", "blur(4px)", "blur(0px)"]
          : ["blur(4px)", "blur(4px)", "blur(0px)"],
        duration: 600,
        easing: "easeOutQuad",
      });
      dbHelper.refresh();
    }}
  >
    <Icon icon={isInLibrary ? "lucide:x" : "lucide:plus"} />
    {isInLibrary ? "Remove" : "Add"}
  </Button>
  <div
    class="pointer-events-none absolute right-0 bottom-0 left-0 h-24 rounded-b-lg bg-linear-to-t from-black/80 to-transparent"
  ></div>
  <div class="absolute right-1 bottom-1 left-1">
    <span
      class="line-clamp-3 text-start text-[13px]/4 font-semibold text-white"
    >
      {manga.title}
    </span>
  </div>
</button>
