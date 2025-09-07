<script lang="ts">
  import Icon from "@iconify/svelte";
  import { AlertDialog, Button } from "@/lib/components";
  import { FavoriteDB } from "@/repositories";
  import {
    refreshLibrary,
    refreshFavorites,
    loadFavoriteChapters,
  } from "@/functions";
  import { toast } from "svelte-sonner";
  import { IS_MOBILE } from "@/constants";
  import { cn } from "@/lib/utils";
  import type { Favorite } from "@/types";
  import { removeCard } from "@/components/animations";
  import { undoTasks } from "@/store";

  interface Props {
    favorite: Favorite;
    open: boolean;
  }

  let { favorite, open = $bindable(false) }: Props = $props();
</script>

<AlertDialog.Root bind:open>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
      <AlertDialog.Description>
        This will permanently delete
        <span class="font-bold"> {favorite.name} </span> and its reading history
        within it.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer
      class={cn("flex-row", IS_MOBILE ? "w-full !justify-center" : "")}
    >
      <Button
        class={IS_MOBILE ? "w-full" : ""}
        variant="destructive"
        effect="gooeyLeft"
        onclick={async () => {
          open = false;
          removeCard(favorite.id.toString(), async () => {
            const undo = await FavoriteDB.deleteFavorite(favorite);
            toast.success(`${favorite.name} deleted with success.`);
            $undoTasks.push({
              do: async () => {
                await FavoriteDB.undoDeleteFavorite(undo);
                await Promise.all([refreshLibrary(), refreshFavorites()]);
                if (favorite.is_ultra_favorite) loadFavoriteChapters(favorite);
              },
              message: "Undo delete of " + favorite.name,
            });
            await Promise.all([refreshLibrary(), refreshFavorites()]);
          });
        }}
      >
        Delete
      </Button>
      <AlertDialog.Cancel class={IS_MOBILE ? "w-full" : ""}>
        Cancel
      </AlertDialog.Cancel>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
