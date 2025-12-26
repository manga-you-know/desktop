<script lang="ts">
  import { ContextMenu, Label } from "@/lib/components";
  import { FavoriteDB, MarkFavoriteDB } from "@/repositories";
  import { refreshFavorites, copyText } from "@/functions";
  import type { Favorite, MarkFavorites } from "@/types";
  import type { Snippet } from "svelte";
  import Icon from "@iconify/svelte";
  import { getBool, titleCase } from "@/utils";
  import { openUrl } from "@tauri-apps/plugin-opener";

  type Props = {
    favorite: Favorite;
    isUltraFavorite: boolean;
    markeds: MarkFavorites[];
    open: boolean;
    onmouseleave: VoidFunction;
    openRead: boolean;
    openTags: boolean;
    openEdit: boolean;
    openDelete: boolean;
    children: Snippet;
  };

  let {
    favorite,
    isUltraFavorite = $bindable(getBool(favorite.is_ultra_favorite)),
    markeds = $bindable([]),
    open = $bindable(false),
    onmouseleave,
    openRead = $bindable(false),
    openTags = $bindable(false),
    openEdit = $bindable(false),
    openDelete = $bindable(false),
    children,
  }: Props = $props();
</script>

<ContextMenu.Root
  bind:open
  onOpenChange={async () => {
    isUltraFavorite = await FavoriteDB.isUltraFavorite(favorite.id);
  }}
>
  <ContextMenu.Trigger {onmouseleave}>
    {@render children?.()}
  </ContextMenu.Trigger>
  <ContextMenu.Content>
    <ContextMenu.Item
      class="flex justify-between"
      onclick={async (e: Event) => {
        e.stopPropagation();
        favorite.is_ultra_favorite = !isUltraFavorite;
        isUltraFavorite = favorite.is_ultra_favorite;
        await FavoriteDB.toggleUltraFavorite(favorite);
        await refreshFavorites();
      }}
    >
      <Label>{isUltraFavorite ? "Remove" : "Favorite"}</Label>
      <Icon
        class="-mr-[2px] size-5!"
        icon={isUltraFavorite ? "heroicons:star-solid" : "heroicons:star"}
      />
    </ContextMenu.Item>
    <ContextMenu.Item
      class="flex justify-between"
      onclick={(e: Event) => {
        e.stopPropagation();
        openRead = true;
      }}
    >
      <Label>Open</Label>
      <Icon
        class="h-5! w-4!"
        icon={favorite.type === "anime"
          ? "lucide:tv-minimal-play"
          : "lucide:book-open-text"}
      />
    </ContextMenu.Item>
    <ContextMenu.Item
      class="flex justify-between"
      onclick={async (e: Event) => {
        e.stopPropagation();
        markeds = await MarkFavoriteDB.getMarkFavorites(favorite);
        openTags = true;
      }}
    >
      <Label>Tags</Label>
      <Icon class="-mr-[2px] size-5!" icon="lucide:bookmark" />
    </ContextMenu.Item>
    <ContextMenu.Item
      class="flex justify-between"
      onclick={(e: Event) => {
        e.stopPropagation();
        openEdit = true;
      }}
    >
      <Label>Edit</Label>
      <Icon class="h-5! w-4!" icon="lucide:square-pen" />
    </ContextMenu.Item>
    <ContextMenu.Item
      class="flex justify-between"
      onclick={(e: Event) => {
        e.stopPropagation();
        openUrl(favorite.link);
      }}
    >
      <Label>Browser</Label>
      <Icon class="h-5! w-4!" icon="lucide:square-arrow-out-up-right" />
    </ContextMenu.Item>
    <ContextMenu.Sub>
      <ContextMenu.SubTrigger class="flex justify-between">
        <Label>Copy</Label>
      </ContextMenu.SubTrigger>
      <ContextMenu.SubContent>
        <ContextMenu.Item
          class="hover:bg-accent flex justify-between"
          onmousedown={() => {
            copyText(favorite.name, "title");
          }}
          onclick={() => {
            copyText(favorite.name, "title");
          }}
        >
          <Label>Title</Label>
          <Icon class="size-4!" icon="tabler:text-size" />
        </ContextMenu.Item>
        <ContextMenu.Item
          class="hover:bg-accent flex justify-between"
          disabled={favorite.author === "" || favorite.author === null}
          onmousedown={() => {
            copyText(favorite.author ?? "", "author");
          }}
          onclick={() => {
            copyText(favorite.author ?? "", "author");
          }}
        >
          <Label>Author</Label>
          <Icon
            class="-m-0.5 size-5!"
            icon="material-symbols:person-2-outline"
          />
        </ContextMenu.Item>
        <ContextMenu.Item
          class="hover:bg-accent flex justify-between"
          disabled={favorite.description === "" ||
            favorite.description === null}
          onmousedown={() => {
            copyText(favorite.description ?? "", "description");
          }}
          onclick={() => {
            copyText(favorite.description ?? "", "description");
          }}
        >
          <Label>Description</Label>
          <Icon class="size-4!" icon="solar:document-text-outline" />
        </ContextMenu.Item>
        <ContextMenu.Item
          class="hover:bg-accent flex justify-between"
          onmousedown={() => {
            copyText(favorite.source, "Source name");
          }}
          onclick={() => {
            copyText(favorite.source, "Source name");
          }}
        >
          <Label>Source name</Label>
          <Icon class="size-4!" icon="fluent:text-case-title-16-filled" />
        </ContextMenu.Item>
        <ContextMenu.Item
          class="hover:bg-accent flex justify-between"
          onmousedown={() => {
            copyText(favorite.source_id, "Source ID");
          }}
          onclick={() => {
            copyText(favorite.source_id, "Source ID");
          }}
        >
          <Label>Source ID</Label>
          <Icon class="size-4!" icon="lucide:key-round" />
        </ContextMenu.Item>
        <ContextMenu.Item
          class="hover:bg-accent flex justify-between"
          onmousedown={() => {
            copyText(favorite.cover, "cover");
          }}
          onclick={() => {
            copyText(favorite.cover, "cover");
          }}
        >
          <Label>
            Cover {favorite.cover.startsWith("http") ? "URL" : "path"}
          </Label>
          <Icon class="size-4!" icon="tabler:photo" />
        </ContextMenu.Item>
        <ContextMenu.Item
          class="hover:bg-accent flex justify-between"
          onmousedown={() => {
            copyText(favorite.link, "URL");
          }}
          onclick={() => {
            copyText(favorite.link, "URL");
          }}
        >
          <Label>{titleCase(favorite.type)} URL</Label>
          <Icon class="size-4!" icon="lucide:link" />
        </ContextMenu.Item>
      </ContextMenu.SubContent>
    </ContextMenu.Sub>
    <ContextMenu.Separator />
    <ContextMenu.Item
      class="hover:bg-destructive! relative z-0 flex justify-between overflow-hidden from-white/40 transition-all duration-500 after:absolute after:inset-0 after:-z-10 after:translate-x-[-150%] after:translate-y-[150%] after:scale-[2.5] after:rounded-[100%] after:bg-linear-to-l after:transition-transform after:duration-1000  hover:after:translate-x-[0%] hover:after:translate-y-[0%]"
      onclick={(e: Event) => {
        e.stopPropagation();
        openDelete = true;
      }}
    >
      <Label>Delete</Label>
      <Icon class="size-4! h-5!" icon="lucide:trash" />
    </ContextMenu.Item>
  </ContextMenu.Content>
</ContextMenu.Root>
