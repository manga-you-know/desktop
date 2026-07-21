<script lang="ts">
  import { open as openFile } from "@tauri-apps/plugin-dialog";
  import { Dialog, Button, Input, Textarea, Label } from "@/lib/components";
  import { FavoriteDB } from "@/repositories";
  import { downloadManager } from "@/store";
  import {
    refreshLibrary,
    refreshFavorites,
    setDiscordActivity,
    stopDiscordPresence,
    loadFavoriteChapters,
  } from "@/functions";
  import type { Favorite } from "@/types";
  import Icon from "@iconify/svelte";
  import { getBool } from "@/utils";
  import { cn } from "@/lib/utils";

  interface Props {
    favorite: Favorite;
    open: boolean;
  }

  let { favorite, open = $bindable(false) }: Props = $props();
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
      // cover = file;
    }
  }
  const loadUltraFavorite = async () => {
    // isUltraFavorite = await FavoriteDB.isUltraFavorite(favorite.id);
  };
  async function refreshInfo() {}

  async function save() {}

  $effect(() => {
    loadUltraFavorite();
    if (open) {
      setDiscordActivity(`Editing ${favorite.type}:`, favorite.name);
    } else {
      stopDiscordPresence();
    }
  });
</script>

<Dialog.Root
  bind:open
  onOpenChange={(open) => {
    if (!open) {
      // if (isUltraFavorite) loadFavoriteChapters(favorite);
      refreshFavorites();
      refreshLibrary();
    }
  }}
>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Edit Favorite</Dialog.Title>
      <Dialog.Description>
        Change your favorites attributes and save it.
      </Dialog.Description>
      <div class="flex gap-4">
        <Input
          id="name-{favorite.id}"
          divClass="w-full!"
          class="w-64"
          placeholder="Name"
          floatingLabel
          required
          variant="secondary"
          onenter={save}
          value={favorite.name}
        />
        <div class="inline-flex w-full">
          <Input
            id="image-{favorite.id}"
            class="w-full rounded-r-none"
            divClass="w-full!"
            placeholder="Cover"
            floatingLabel
            required
            variant="secondary"
            onenter={save}
            value={favorite.cover}
          />
          <Button
            class="w-10 rounded-l-none"
            variant="outline"
            onclick={pickImage}
          >
            <Icon icon="lucide:paperclip" />
          </Button>
        </div>
      </div>
    </Dialog.Header>
    <div class="flex w-full justify-between gap-2">
      <Textarea
        id="description-{favorite.id}"
        class="scrollbar h-24 resize-none"
        placeholder="Description"
        floatingLabel
        variant="secondary"
        value={favorite.description}
      />
      <div class="flex flex-col gap-4">
        <Input
          id="folderName-{favorite.id}"
          placeholder="Folder path"
          floatingLabel
          required
          variant="secondary"
          onenter={save}
          value={favorite.folderName}
        />
        <Input
          id="link-{favorite.id}"
          placeholder="Link"
          floatingLabel
          required
          variant="secondary"
          onenter={save}
          value={favorite.link}
        />
      </div>
      <div class="flex flex-col gap-4">
        <Input
          id="malId-{favorite.id}"
          class="w-20"
          placeholder="MAL id"
          floatingLabel
          variant="secondary"
          onenter={save}
          value={favorite.malId}
        />
        <Input
          id="anilistId-{favorite.id}"
          class="w-20"
          placeholder="Anilist id"
          floatingLabel
          variant="secondary"
          onenter={save}
          value={favorite.anilistId}
        />
      </div>
    </div>
    <div class="flex justify-between gap-2">
      <Input
        id="author-{favorite.id}"
        class="w-[10.65rem]"
        placeholder="Author"
        floatingLabel
        variant="secondary"
        onenter={save}
        value={favorite.author}
      />
      <Button
        class="relative ml-[0.6rem] flex h-10 w-28 justify-between"
        variant="outline"
        onclick={async () => {
          // isUltraFavorite = !isUltraFavorite;
          // favorite.isUltraFavorite = isUltraFavorite;
          await FavoriteDB.toggleUltraFavorite(favorite, false);
        }}
      >
        {favorite.isUltraFavorite ? "Remove" : "Favorite"}
        favorite.<Icon
          class={cn(
            "absolute right-3 size-5! transition-all duration-500",
            favorite.isUltraFavorite && "scale-0 rotate-180 opacity-0",
          )}
          icon="heroicons:star"
        />
        <Icon
          class={cn(
            "absolute right-3 size-5! transition-all duration-500",
            !favorite.isUltraFavorite && "scale-0 -rotate-180 opacity-0",
          )}
          icon="heroicons:star-solid"
        />
      </Button>

      <div class="flex gap-2">
        <Button
          effect="ringHover"
          disabled={isRefreshing}
          onclick={refreshInfo}
        >
          <Icon
            icon={isRefreshing
              ? "eos-icons:bubble-loading"
              : "lucide:refresh-ccw"}
          />
        </Button>
        <Button effect="ringHover" onclick={save}>
          <Icon icon="lucide:check" />Confirm
        </Button>
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>
