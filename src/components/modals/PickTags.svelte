<script lang="ts">
  import { refreshFavorites, refreshLibrary } from "@/functions";
  import type { Favorite } from "@/types";
  import {
    AlertDialog,
    Button,
    Input,
    Label,
    ScrollArea,
  } from "@/lib/components";
  import { MarkFavoriteDB } from "@/repositories";
  import { tags } from "@/store";
  import type { MarkFavorites } from "@/types";
  import { limitStr } from "@/utils";
  import Icon from "@iconify/svelte";

  type Props = {
    open: boolean;
    favorite: Favorite;
    markeds: MarkFavorites[];
  };

  let {
    open = $bindable(false),
    markeds = $bindable(),
    favorite,
  }: Props = $props();
</script>

<AlertDialog.Root
  bind:open
  onOpenChange={(open) => {
    if (!open) {
      refreshFavorites();
      refreshLibrary();
    }
  }}
>
  <AlertDialog.Content class="w-104 flex flex-col justify-center">
    <AlertDialog.Title class="text-center select-none">
      Select tags to
      <spam class="font-extrabold truncate">
        {limitStr(favorite.name, 13)}
      </spam>
    </AlertDialog.Title>
    <ScrollArea class="h-80">
      <div class="flex flex-col gap-1 justify-center px-5">
        {#each $tags.reverse() as tag}
          {@const isMarked = markeds.map((vl) => vl.mark_id).includes(tag.id)}
          <Button
            class="inline-flex justify-between"
            variant={isMarked ? "secondary" : "ghost"}
            onclick={async () => {
              if (isMarked)
                await MarkFavoriteDB.removeMarkFavorite(favorite, tag);
              else await MarkFavoriteDB.addMarkFavorite(favorite, tag);
              markeds = await MarkFavoriteDB.getMarkFavorites(favorite);
            }}
          >
            {limitStr(tag.name, 30)}
            <Icon
              class="w-5! h-5!"
              icon={isMarked
                ? "mdi:checkbox-blank-circle"
                : "mdi:checkbox-blank-circle-outline"}
            />
          </Button>
        {/each}
      </div>
    </ScrollArea>
  </AlertDialog.Content>
</AlertDialog.Root>
