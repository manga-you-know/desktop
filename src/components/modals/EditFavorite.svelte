<script lang="ts">
  import { open as openFile } from "@tauri-apps/plugin-dialog";
  import { convertFileSrc } from "@tauri-apps/api/core";
  import { Dialog, Button, Input, Textarea, Label } from "@/lib/components";
  import { FavoriteDB } from "@/repositories";
  import { downloadManager } from "@/store";
  import {
    refreshLibrary,
    refreshFavorites,
    setDiscordActivity,
    stopDiscordPresence,
    loadFavoriteChapter,
  } from "@/functions";
  import type { Favorite } from "@/interfaces";
  import Icon from "@iconify/svelte";

  interface Props {
    favorite: Favorite;
    open: boolean;
  }

  let { favorite, open = $bindable(false) }: Props = $props();
  let name = $state(favorite.name);
  let link = $state(favorite.link);
  let cover = $state(favorite.cover);
  let malId = $state(favorite.mal_id);
  let author = $state(favorite.author);
  let anilistId = $state(favorite.anilist_id);
  let folderName = $state(favorite.folder_name);
  let description = $state(favorite.description);
  let isUltraFavorite = $state(favorite.is_ultra_favorite);

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
      cover = convertFileSrc(file);
    }
  }

  async function refreshInfo() {
    isRefreshing = true;
    const favLoad = await $downloadManager.getMangaById(
      favorite.source_id,
      favorite.source
    );
    name = favLoad.name;
    link = favLoad.link;
    cover = favLoad.cover;
    malId = favLoad.mal_id ?? malId;
    author = favLoad.author ?? author;
    folderName = favLoad.folder_name;
    description = favLoad.description ?? description;
    anilistId = favLoad.anilist_id ?? anilistId;
    favorite.name = name;
    favorite.link = link;
    favorite.cover = cover;
    favorite.mal_id = malId;
    favorite.author = author;
    favorite.anilist_id = anilistId;
    favorite.description = description;
    favorite.extra_name = favLoad.extra_name;
    favorite.author = favLoad.author;
    isRefreshing = false;
    isRefreshed = true;
  }

  async function save() {
    favorite.name = name;
    favorite.link = link;
    favorite.cover = cover;
    favorite.mal_id = malId;
    favorite.author = author;
    favorite.anilist_id = anilistId;
    favorite.folder_name = folderName;
    favorite.description = description;
    await FavoriteDB.updateFavorite(favorite);
    await Promise.all([refreshLibrary(), refreshFavorites()]);
    open = false;
  }

  $effect(() => {
    name = favorite.name;
    link = favorite.link;
    cover = favorite.cover;
    malId = favorite.mal_id;
    author = favorite.author;
    anilistId = favorite.anilist_id;
    folderName = favorite.folder_name;
    description = favorite.description;
    isUltraFavorite = favorite.is_ultra_favorite;
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
      loadFavoriteChapter(favorite);
      refreshFavorites();
      refreshLibrary();
    }
  }}
>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Edit Favorite</Dialog.Title>
      <Dialog.Description
        >Change your favorites attributes and save it.</Dialog.Description
      >
      <div class="flex gap-4">
        <Input
          id="name-{favorite.id}"
          divClass="!w-full"
          class="w-64"
          placeholder="Name"
          floatingLabel
          required
          variant="secondary"
          onenter={save}
          bind:value={name}
        />
        <div class="inline-flex w-full">
          <Input
            id="image-{favorite.id}"
            class="w-full rounded-r-none"
            divClass="!w-full"
            placeholder="Cover"
            floatingLabel
            required
            variant="secondary"
            onenter={save}
            bind:value={cover}
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
    <div class="w-full flex justify-between gap-2">
      <Textarea
        id="description-{favorite.id}"
        class="resize-none h-24 scrollbar"
        placeholder="Description"
        floatingLabel
        variant="secondary"
        bind:value={description}
      />
      <div class="flex flex-col gap-4">
        <Input
          id="folderName-{favorite.id}"
          placeholder="Folder name"
          floatingLabel
          required
          variant="secondary"
          onenter={save}
          bind:value={folderName}
        />
        <Input
          id="link-{favorite.id}"
          placeholder="Link"
          floatingLabel
          required
          variant="secondary"
          onenter={save}
          bind:value={link}
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
          bind:value={malId}
        />
        <Input
          id="anilistId-{favorite.id}"
          class="w-20"
          placeholder="Anilist id"
          floatingLabel
          variant="secondary"
          onenter={save}
          bind:value={anilistId}
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
        bind:value={author}
      />
      <Button
        class="w-28 h-10 ml-[0.6rem] flex justify-between"
        variant="outline"
        onclick={async () => {
          isUltraFavorite = !isUltraFavorite;
          favorite.is_ultra_favorite = isUltraFavorite;
          await FavoriteDB.updateFavorite(favorite);
        }}
      >
        {isUltraFavorite ? "Remove" : "Favorite"}
        <Icon
          class="!w-5 !h-5 mx-[-5px]"
          icon={isUltraFavorite
            ? "fluent:star-emphasis-32-filled"
            : "fluent:star-emphasis-32-regular"}
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
        <Button
          effect="ringHover"
          disabled={name.length === 0 ||
            link.length === 0 ||
            cover.length === 0 ||
            folderName.length === 0 ||
            !(
              name !== favorite.name ||
              link !== favorite.link ||
              cover !== favorite.cover ||
              malId !== favorite.mal_id ||
              author !== favorite.author ||
              anilistId !== favorite.anilist_id ||
              folderName !== favorite.folder_name ||
              description !== favorite.description ||
              isUltraFavorite !== favorite.is_ultra_favorite ||
              isRefreshed
            )}
          onclick={save}
        >
          <Icon icon="lucide:check" />Confirm
        </Button>
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>
