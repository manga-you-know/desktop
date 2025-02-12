<script lang="ts">
  import { open as openFile } from "@tauri-apps/plugin-dialog";
  import { convertFileSrc } from "@tauri-apps/api/core";
  import { Dialog, Button, Input } from "@/lib/components";
  import { FavoriteRepository } from "@/repositories";
  import { downloadManager } from "@/store";
  import {
    refreshLibrary,
    refreshFavorites,
    setDiscordActivity,
    setDefaultDiscordActivity,
  } from "@/functions";
  import type { Favorite } from "@/interfaces";
  import Icon from "@iconify/svelte";

  interface Props {
    favorite: Favorite;
    open: boolean;
  }

  let { favorite, open = $bindable(false) }: Props = $props();
  let name = $state(favorite.name);
  let image = $state(favorite.cover);
  let isRefreshing = $state(false);
  let isRefreshed = $state(false);

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

  async function refreshInfo() {
    isRefreshing = true;
    const manga = await $downloadManager.getMangaById(
      favorite.source_id,
      favorite.source
    );
    name = manga.name;
    image = manga.cover;
    favorite.name = name;
    favorite.cover = image;
    favorite.description = manga.description;
    favorite.extra_name = manga.extra_name;
    favorite.author = manga.author;
    favorite.link = manga.link;
    isRefreshing = false;
    isRefreshed = true;
  }

  async function save() {
    favorite.name = name;
    favorite.cover = image;
    await FavoriteRepository.updateFavorite(favorite);
    await Promise.all([refreshLibrary(), refreshFavorites()]);
    open = false;
  }

  $effect(() => {
    name = favorite.name;
    image = favorite.cover;
    if (open) {
      setDiscordActivity(`Editing ${favorite.type}:`, favorite.name);
    } else {
      setDefaultDiscordActivity();
    }
  });
</script>

<Dialog.Root bind:open>
  <Dialog.Content interactOutsideBehavior="close">
    <Dialog.Header>
      <Dialog.Title>Edit Favorite</Dialog.Title>
      <Dialog.Description
        >Change your favorites attributes and save it.</Dialog.Description
      >
      <Input id={`name-${favorite.id}`} bind:value={name} />
      <div class="flex gap-2">
        <Input id={`image-${favorite.id}`} bind:value={image} />
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
      <Button effect="ringHover" disabled={isRefreshing} onclick={refreshInfo}>
        <Icon icon="lucide:refresh-ccw" />
      </Button>
      <Button
        effect="ringHover"
        disabled={!(
          name !== favorite.name ||
          image !== favorite.cover ||
          isRefreshed
        )}
        onclick={save}
      >
        <Icon icon="lucide:check" />Confirm
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
