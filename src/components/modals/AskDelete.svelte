<script lang="ts">
  import Icon from "@iconify/svelte";
  import { AlertDialog, Button } from "@/lib/components";
  import { libraryFavorites } from "@/store";
  import { FavoriteRepository } from "@/repositories";
  import { Favorite } from "@/models";

  interface Props {
    favorite: Favorite;
    open: boolean;
  }

  let { favorite, open = $bindable(false) }: Props = $props();
</script>

<AlertDialog.Root bind:open>
  <AlertDialog.Content interactOutsideBehavior="close">
    <AlertDialog.Header>
      <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
      <AlertDialog.Description>
        This will permanently delete
        <span class="font-bold"> {favorite.name} </span> and all readed chapters
        within it.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <Button
        variant="destructive"
        effect="gooeyLeft"
        onclick={async () => {
          await FavoriteRepository.deleteFavorite(favorite);
          const newFavorites = await FavoriteRepository.getFavorites();
          libraryFavorites.set(newFavorites);
          open = false;
        }}>Delete</Button
      >
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
