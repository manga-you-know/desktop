<script lang="ts">
  import { open as openFile } from "@tauri-apps/plugin-dialog";
  import { convertFileSrc } from "@tauri-apps/api/core";
  import { Dialog, Button, Input } from "@/lib/components";
  import { FavoriteRepository } from "@/repositories";
  import { favorites } from "@/store";
  import type { Favorite } from "@/models";
  import Icon from "@iconify/svelte";

  interface Props {
    favorite: Favorite;
    open: boolean;
  }

  let { favorite, open = $bindable(false) }: Props = $props();
  let name = $state(favorite.name);
  let image = $state(favorite.cover);
  async function pickImage() {
    const file = await openFile({
      title: "Select a cover",
      multiple: false,
      directory: false,
      filters: [
        {
          name: "New cover",
          extensions: ["png", "jpg", "jpeg", "svg", "gif", "webp", "avif"],
        },
      ],
    });
    if (file) {
      image = convertFileSrc(file);
    }
  }

  async function save() {
    favorite.name = name;
    favorite.cover = image;
    await FavoriteRepository.updateFavorite(favorite);
    const newFavorites = await FavoriteRepository.getFavorites();
    favorites.set(newFavorites);
    open = false;
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content interactOutsideBehavior="close">
    <Dialog.Header>
      <Dialog.Title>Edit Favorite</Dialog.Title>
      <Dialog.Description
        >Change your favorites attributes and save it.</Dialog.Description
      >
      <Input bind:value={name} />
      <div class="flex gap-2">
        <Input bind:value={image} />
        <Button
          class="w-9 h-9"
          variant="outline"
          effect="shineHover"
          onclick={pickImage}
        >
          <Icon icon="lucide:paperclip" />
        </Button>
      </div>
    </Dialog.Header>
    <Dialog.Footer>
      <Button effect="ringHover" onclick={save}>
        <Icon icon="lucide:check" />Confirm
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
