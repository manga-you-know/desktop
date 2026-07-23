<script lang="ts">
  import { goto, onNavigate } from "$app/navigation";
  import { page } from "$app/state";
  import { Button, Label } from "@/lib/components";
  import { suwaManager } from "@/lib/helpers";
  import { lastPage, openedMangas } from "@/states";
  import Icon from "@iconify/svelte";

  // let { key }: { key: string } = $props();

  // $inspect(page.url);
  // let count = 0;
  let key = $state("");
  $effect(() => {
    if (page.params.key !== "[key]") {
      key = page.params.key ?? "";
    }
  });

  let fetched = false;

  $effect(() => {
    if ("s" in manga && !fetched) {
      suwaManager.getMangaScreen(manga.s.id).then((m) => {
        openedMangas.value[key] = { s: m };
        if (!m.initialized) {
          suwaManager.fetchManga(m.id).then((mf) => {
            openedMangas.value[key] = { s: mf };
          });
        }
      });

      fetched = true;
    }
  });

  let manga = $derived(openedMangas.value[key]);
  $inspect(page.params, key, manga);
</script>

<div class="bg-secondary/50 flex h-full w-full justify-center rounded-lg p-4">
  {#if manga}
    <div class="flex w-full">
      <Button
        onclick={() => {
          const lastRoute = page.url.searchParams.get("previous") ?? "/browse";
          goto(lastRoute);
        }}
      >
        <Icon icon="lucide:arrow-left" />
        {"db" in manga ? manga.db.name : manga.s.title}
      </Button>
    </div>
  {:else}
    <div class="flex h-full w-full flex-col items-center justify-center gap-2">
      <Label class="text-5xl font-bold">(×﹏×)</Label>
      <Label class="text-xl">Unable to load manga</Label>
      <div class="flew-wrap flex items-center justify-center gap-1"></div>
      <div class="flex justify-center gap-2">
        <Button
          class="w-30"
          onclick={() => {
            const lastRoute =
              page.url.searchParams.get("previous") ?? "/browse";
            goto(lastRoute);
          }}
        >
          <Icon icon="lucide:arrow-big-left" />
          Go back
        </Button>
      </div>
    </div>
  {/if}
</div>
