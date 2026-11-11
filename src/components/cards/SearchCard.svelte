<script lang="ts">
  import { Button } from "@/lib/components";
  import { Image } from "@/components";
  import Icon from "@iconify/svelte";
  import { cn } from "@/lib/utils";
  import { animate } from "animejs";
  import type { Favorite } from "@/types";

  type Props = {
    manga: Favorite;
  };

  let { manga }: Props = $props();

  let isInLibrary = $derived(
    false,
    /* dbHelper.mangasBySourceOrigin[`${suwaSource.id}::${manga.title}`] !==
      undefined, */
  );
</script>

<button
  class={cn(
    "border-secondary bg-secondary/50 group/card relative z-0 flex h-[23.75rem] w-64 cursor-pointer flex-col gap-2 overflow-hidden rounded-xl border p-0.5",
    isInLibrary && "fetch-card",
  )}
  onclick={() => {
    // currentMangaTab.value = "read";
    /* const key = `${suwaSource.id}::${manga.title}`;
    if (isInLibrary) {
      openedMangas.value[key] = { db: dbHelper.mangasBySourceOrigin[key] };
    } else {
      openedMangas.value[key] = { s: suwaSource, m: manga };
    }
    openedManga.open(key); */
  }}
>
  <Image class="h-[23.75rem] w-64 rounded-lg object-cover" src={manga.cover} />
  <div
    class={cn(
      "bg-secondary text-primary absolute top-0 left-0 flex h-9 items-center justify-center rounded-br-xl p-1 transition-all duration-400",
      isInLibrary ? "translate-x-0" : "-translate-x-10",
    )}
  >
    <Icon class="size-5" icon="lucide:bookmark" />
  </div>
  <div
    class={cn(
      "absolute top-1 right-1 flex w-[6.25rem] translate-x-[6.75rem] flex-col items-end gap-0.5 transition-all duration-400 group-hover/card:translate-x-0",
      // isInLibrary ? "w-[6.25rem] translate-x-[6.75rem]" : "w-18 translate-x-19",
    )}
  >
    <Button
      class="h-8 justify-between gap-2 rounded-lg pl-2 backdrop-blur-sm"
      variant="outline"
      onclick={async (e) => {
        e.stopPropagation();
        const parent = e.currentTarget?.parentElement?.parentElement ?? "";
        if (isInLibrary) {
          /* dbHelper.deleteSource(
            dbHelper.sourcesBySourceIdTitle[manga.id + suwaSource.id],
          ); */
        } else {
          animate(parent, {
            filter: ["blur(2px)", "blur(4px)"],
            duration: 600,
            easing: "easeOutQuad",
          });
          // await dbHelper.addSource(manga, suwaSource, { refresh: false });
          /* if (hideOnLibrary.value) {
            await animate(parent, {
              opacity: [1, 0.5, 0],
              translateX: -40,
              duration: 500,
              easing: "easeInQuad",
            });
          } */
        }
        animate(parent, {
          filter: isInLibrary
            ? ["blur(2px)", "blur(4px)", "blur(0px)"]
            : ["blur(4px)", "blur(4px)", "blur(0px)"],
          duration: 600,
          easing: "easeOutQuad",
        });
        // dbHelper.refresh();
      }}
    >
      <Icon icon={isInLibrary ? "lucide:x" : "lucide:plus"} />
      <span class="w-full">
        {isInLibrary ? "Remove" : "Add"}
      </span>
    </Button>
    <!-- <Button
      class="h-8 w-8 justify-start gap-2 rounded-lg px-2 backdrop-blur-sm"
      variant="outline"
      onclick={(e) => {
        e.stopPropagation();
        /* openedMangaAddSource.open({
          s: suwaSource,
          m: manga,
        }); */
      }}
    >
      <Icon icon="lucide:squares-unite" />
    </Button> -->
  </div>
  <div
    class="pointer-events-none absolute right-0 bottom-0 left-0 h-24 rounded-b-lg bg-gradient-to-t from-black/80 to-transparent"
  ></div>
  <div class="absolute right-1 bottom-1 left-1">
    <span
      class="line-clamp-3 text-start text-[13px]/4 font-semibold text-white"
    >
      {manga.name}
    </span>
  </div>
</button>
