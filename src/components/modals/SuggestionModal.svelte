<script lang="ts">
  import Icon from "@iconify/svelte";
  import { Dialog, Button, Label } from "@/lib/components";
  import { FavoriteDB } from "@/repositories";
  import {
    copyText,
    refreshFavorites,
    refreshLibrary,
    refreshRawFavorites,
  } from "@/functions";
  import { cn } from "@/lib/utils";
  import type { Favorite, Suggestion } from "@/types";
  import { Image, Select } from "@/components";
  import { rawFavorites } from "@/store";
  import { limitStr } from "@/utils";
  import { openUrl } from "@tauri-apps/plugin-opener";

  interface Props {
    open: boolean;
    openReadModal: boolean;
    suggestion: Suggestion;
    openFavorite: Favorite;
  }

  let {
    suggestion,
    open = $bindable(false),
    openReadModal = $bindable(false),
    openFavorite = $bindable(null!),
  }: Props = $props();

  let source = $state(suggestion.sources[0].source);
  let sources = $derived(suggestion.sources.map((s) => s.source));
  let currentSource = $derived(
    suggestion.sources.find((s) => s.source === source),
  );
  let suggestionToAdd: Favorite = $derived({
    id: -1,
    name: suggestion.name,
    folder_name: suggestion.folderName,
    cover: suggestion.cover,
    author: suggestion.author,
    description: suggestion.description,
    source: source,
    source_id: currentSource?.sourceId ?? "",
    link: currentSource?.link ?? "",
  });

  function isFavorite(favorite: Favorite) {
    return $rawFavorites.find(
      (f) => f.source_id === favorite.source_id && f.source === favorite.source,
    );
  }

  async function saveSuggestion(result: Favorite) {
    if (isFavorite(result)) {
      const favorite = await FavoriteDB.getFavoriteBySource(
        result.source_id,
        result.source,
      );
      await FavoriteDB.deleteFavorite(favorite);
    } else {
      await FavoriteDB.createFavorite(result);
    }
    refreshRawFavorites();
    refreshLibrary();
    refreshFavorites();
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="w-[78vw] h-[80vh] max-w-[41rem] max-h-[40rem]">
    <Dialog.Header>
      <Label
        class="group text-3xl !bg-transparent w-full flex justify-center items-center dark:text-white select-none hover:cursor-text"
        onclick={() => {
          copyText(suggestion.name, "title");
        }}
      >
        <Icon
          class="!size-0 mr-2 group-hover:!size-5 transition-all duration-300"
          icon="ic:baseline-content-copy"
        />
        {limitStr(suggestion.name, 60)}
      </Label>
    </Dialog.Header>
    <div class="flex gap-2">
      <div class="w-3/5 flex items-center justify-center">
        <Image
          class="w-full h-[50vh] max-h-[30rem] rounded-md object-contain"
          src={suggestion.cover}
        />
      </div>
      <div class="w-2/5 flex flex-col gap-1 justify-between">
        <Label>
          <span class="text-gray-400"> author - </span>
          {suggestion.author}
        </Label>
        <p
          class="text-primary text-[13px] line-clamp-[10] ssmh:line-clamp-[7] md:line-clamp-[15]"
        >
          {suggestion.description}
        </p>
        <div class="hidden md:inline-flex items-center">
          <Button
            class="rounded-r-none"
            variant="outline"
            onclick={() => {
              if (currentSource) openUrl(currentSource.link);
            }}
          >
            <Icon
              class="!size-4 -mr-1"
              icon="lucide:square-arrow-out-up-right"
            />
          </Button>
          <Select
            class="rounded-none max-w-32"
            bind:selected={source}
            items={sources}
            closeButton={false}
            disabled={sources.length < 2}
          />
          <Button
            class="rounded-none"
            variant="outline"
            onclick={() => {
              const toOpen = isFavorite(suggestionToAdd);
              openFavorite = toOpen ? toOpen : suggestionToAdd;
              openReadModal = true;
            }}
          >
            <Icon class="!size-4 -mx-1" icon="lucide:book-open-text" />
          </Button>
          <Button
            class="rounded-l-none px-3"
            variant="outline"
            onclick={() => saveSuggestion(suggestionToAdd)}
          >
            <Icon
              class="!size-4"
              icon={isFavorite(suggestionToAdd)
                ? "tabler:bookmark-filled"
                : "tabler:bookmark"}
            />
          </Button>
        </div>
        <div class="md:hidden flex flex-col items-center gap-0.5">
          <Select
            class="max-w-32"
            bind:selected={source}
            items={sources}
            closeButton={false}
            disabled={sources.length < 2}
          />
          <div class="flex">
            <Button
              class="rounded-r-none"
              variant="outline"
              onclick={() => {
                if (currentSource) openUrl(currentSource.link);
              }}
            >
              <Icon
                class="!size-4 -mr-1"
                icon="lucide:square-arrow-out-up-right"
              />
            </Button>
            <Button
              class="rounded-none"
              variant="outline"
              onclick={() => {
                const toOpen = isFavorite(suggestionToAdd);
                openFavorite = toOpen ? toOpen : suggestionToAdd;
                openReadModal = true;
              }}
            >
              <Icon class="!size-4 -mx-1" icon="lucide:book-open-text" />
            </Button>
            <Button
              class="rounded-l-none"
              variant="outline"
              onclick={() => saveSuggestion(suggestionToAdd)}
            >
              <Icon
                class="!size-4 -ml-1"
                icon={isFavorite(suggestionToAdd)
                  ? "tabler:bookmark-filled"
                  : "tabler:bookmark"}
              />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>
