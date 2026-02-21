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
  let name = $state(favorite.name);
  let link = $state(favorite.link);
  let cover = $state(favorite.cover);
  let malId = $state(favorite.malId);
  let author = $state(favorite.author);
  let anilistId = $state(favorite.anilistId);
  let folderName = $state(favorite.folderName);
  let description = $state(favorite.description);
  let isUltraFavorite = $state(getBool(favorite.isUltraFavorite));

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
      cover = file;
    }
  }
  const loadUltraFavorite = async () => {
    isUltraFavorite = await FavoriteDB.isUltraFavorite(favorite.id);
  };
  async function refreshInfo() {
    isRefreshing = true;
    const favLoad = await $downloadManager.getMangaById(
      favorite.sourceId,
      favorite.source,
    );
    name = favLoad.name;
    link = favLoad.link;
    cover = favLoad.cover;
    malId = favLoad.malId ?? malId;
    author = favLoad.author ?? author;
    folderName = favLoad.folderName;
    description = favLoad.description ?? description;
    anilistId = favLoad.anilistId ?? anilistId;
    favorite.name = name;
    favorite.link = link;
    favorite.cover = cover;
    favorite.malId = malId;
    favorite.author = author;
    favorite.anilistId = anilistId;
    favorite.description = description;
    favorite.extraName = favLoad.extraName;
    favorite.author = favLoad.author;
    isRefreshing = false;
    isRefreshed = true;
  }

  async function save() {
    favorite.name = name;
    favorite.link = link;
    favorite.cover = cover;
    favorite.malId = malId;
    favorite.author = author;
    favorite.anilistId = anilistId;
    favorite.folderName = folderName;
    favorite.description = description;
    await FavoriteDB.updateFavorite(favorite);
    await Promise.all([refreshLibrary(), refreshFavorites()]);
    open = false;
  }

  $effect(() => {
    loadUltraFavorite();
    name = favorite.name;
    link = favorite.link;
    cover = favorite.cover;
    malId = favorite.malId;
    author = favorite.author;
    anilistId = favorite.anilistId;
    folderName = favorite.folderName;
    description = favorite.description;
    isUltraFavorite = favorite.isUltraFavorite ?? false;
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
      if (isUltraFavorite) loadFavoriteChapters(favorite);
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
          divClass="w-full!"
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
            divClass="w-full!"
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
    <div class="flex w-full justify-between gap-2">
      <Textarea
        id="description-{favorite.id}"
        class="scrollbar h-24 resize-none"
        placeholder="Description"
        floatingLabel
        variant="secondary"
        bind:value={description}
      />
      <div class="flex flex-col gap-4">
        <Input
          id="folderName-{favorite.id}"
          placeholder="Folder path"
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
        class="relative ml-[0.6rem] flex h-10 w-28 justify-between"
        variant="outline"
        onclick={async () => {
          isUltraFavorite = !isUltraFavorite;
          favorite.isUltraFavorite = isUltraFavorite;
          await FavoriteDB.toggleUltraFavorite(favorite, false);
        }}
      >
        {isUltraFavorite ? "Remove" : "Favorite"}
        <Icon
          class={cn(
            "absolute right-3 size-5! transition-all duration-500",
            isUltraFavorite && "scale-0 rotate-180 opacity-0",
          )}
          icon="heroicons:star"
        />
        <Icon
          class={cn(
            "absolute right-3 size-5! transition-all duration-500",
            !isUltraFavorite && "scale-0 -rotate-180 opacity-0",
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
              malId !== favorite.malId ||
              author !== favorite.author ||
              anilistId !== favorite.anilistId ||
              folderName !== favorite.folderName ||
              description !== favorite.description ||
              isUltraFavorite !== favorite.isUltraFavorite ||
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
