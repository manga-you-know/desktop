<script lang="ts">
  import Icon from "@iconify/svelte";
  import { AlertDialog, Button } from "@/lib/components";
  import { FavoriteDB } from "@/repositories";
  import { refreshLibrary, refreshFavorites } from "@/functions";
  import { toast } from "svelte-sonner";
  import { IS_MOBILE } from "@/constants";
  import { cn } from "@/lib/utils";
  import type { Favorite } from "@/types";

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
        <span class="font-bold"> {favorite.name} </span> and all readed chapters
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
          await FavoriteDB.deleteFavorite(favorite);
          open = false;
          toast.warning(`${favorite.name} deleted with success.`);
          await Promise.all([refreshLibrary(), refreshFavorites()]);
        }}>Delete</Button
      >
      <AlertDialog.Cancel class={IS_MOBILE ? "w-full" : ""}
        >Cancel</AlertDialog.Cancel
      >
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
