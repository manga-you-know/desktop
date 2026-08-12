<script lang="ts">
  import { Button, Dialog, Input, Label } from "@/lib/components";
  import { db, mangas } from "@/lib/db";
  import { openedMangaAddSource } from "@/states";
  import { delay } from "@/utils";
  import { sql } from "drizzle-orm";
  import { VList } from "virtua/svelte";

  let query = $state("");

  let titleToAdd = $derived(
    openedMangaAddSource.value
      ? "s" in openedMangaAddSource.value
        ? openedMangaAddSource.value.m.title
        : openedMangaAddSource.value.db.title
      : "",
  );

  let sourceIdToAdd = $derived(
    openedMangaAddSource.value
      ? "s" in openedMangaAddSource.value
        ? openedMangaAddSource.value.s.id
        : openedMangaAddSource.value.db.sourceId
      : "",
  );

  let titleQuery = $derived(query !== "" ? query : titleToAdd);

  let orderedMangas = $derived(
    await db.query.mangas.findMany({
      with: {
        sourceLinks: {
          with: {
            source: true,
          },
        },
      },
      orderBy: sql`
        CASE
          WHEN ${mangas.title} = ${titleQuery} COLLATE NOCASE THEN 0
          WHEN ${mangas.title} LIKE ${titleQuery + "%"} THEN 1
          WHEN ${mangas.title} LIKE ${"%" + titleQuery + "%"} THEN 2
          ELSE 3
        END
      `,
    }),
  );

  $inspect(sourceIdToAdd, titleToAdd);
</script>

<Dialog.Root
  bind:open={openedMangaAddSource.active}
  onOpenChange={(open) => {
    if (!open) {
      delay(500).then(() => {
        openedMangaAddSource.value = undefined;
      });
    }
  }}
>
  <Dialog.Content>
    <div class="flex w-full justify-center">
      <Input
        variant="outline"
        placeholder="Search library..."
        bind:value={query}
      />
    </div>
    <div class="scrollbar-chapters h-70">
      <VList data={orderedMangas}>
        {#snippet children(manga, _)}
          {let isAdded = $derived(
            manga.sourceLinks.find(
              (sl) =>
                sl.source.sourceId === sourceIdToAdd &&
                sl.source.title.toLowerCase() === titleToAdd.toLowerCase(),
            ),
          )}
          <Button class="w-full justify-between rounded-lg" variant="outline">
            {manga.title}
            <Button
              class="h-8 rounded-md"
              onclick={(e) => {
                e.stopPropagation();
                console.log(manga.sourceLinks);
              }}
            >
              {isAdded ? "GAY" : "huh"}
            </Button>
          </Button>
        {/snippet}
      </VList>
    </div>
  </Dialog.Content>
</Dialog.Root>
