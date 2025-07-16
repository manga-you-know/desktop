<script lang="ts">
	import { ContextMenu, Label } from "@/lib/components";
	import { FavoriteDB, MarkFavoriteDB } from "@/repositories";
	import { refreshFavorites, copyText } from "@/functions";
	import type { Favorite, MarkFavorites } from "@/types";
	import type { Snippet } from "svelte";
	import Icon from "@iconify/svelte";

	type Props = {
		favorite: Favorite;
		isUltraFavorite: boolean;
		markeds: MarkFavorites[];
		open: boolean;
		openRead: boolean;
		openTags: boolean;
		openEdit: boolean;
		openDelete: boolean;
		children: Snippet;
	};

	let {
		favorite,
		isUltraFavorite = $bindable(false),
		markeds = $bindable([]),
		open = $bindable(false),
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
	<ContextMenu.Trigger>
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
			<Label>{favorite.is_ultra_favorite ? "Remove" : "Favorite"}</Label>
			<Icon
				class="!size-5 -mr-[2px]"
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
				class="!size-4 !h-5"
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
			<Icon class="!size-5 -mr-[2px]" icon="lucide:bookmark" />
		</ContextMenu.Item>
		<ContextMenu.Item
			class="flex justify-between"
			onclick={(e: Event) => {
				e.stopPropagation();
				openEdit = true;
			}}
		>
			<Label>Edit</Label>
			<Icon class="!size-4 !h-5" icon="lucide:square-pen" />
		</ContextMenu.Item>
		<ContextMenu.Sub>
			<ContextMenu.SubTrigger class="flex justify-between">
				<Label>Copy</Label>
			</ContextMenu.SubTrigger>
			<ContextMenu.SubContent>
				<ContextMenu.Item
					class="flex justify-between hover:bg-accent"
					onmousedown={() => {
						copyText(favorite.name, "title");
					}}
					onclick={() => {
						copyText(favorite.name, "title");
					}}
				>
					<Label>Title</Label>
					<Icon class="!size-4" icon="tabler:text-size" />
				</ContextMenu.Item>
				<ContextMenu.Item
					class="flex justify-between hover:bg-accent"
					disabled={favorite.author === "" || favorite.author === null}
					onmousedown={() => {
						copyText(favorite.author ?? "", "description");
					}}
					onclick={() => {
						copyText(favorite.author ?? "", "description");
					}}
				>
					<Label>Author</Label>
					<Icon
						class="!size-5 -m-0.5"
						icon="material-symbols:person-2-outline"
					/>
				</ContextMenu.Item>
				<ContextMenu.Item
					class="flex justify-between hover:bg-accent"
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
					<Icon class="!size-4" icon="solar:document-text-outline" />
				</ContextMenu.Item>
				<ContextMenu.Item
					class="flex justify-between hover:bg-accent"
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
					<Icon class="!size-4" icon="tabler:photo" />
				</ContextMenu.Item>
			</ContextMenu.SubContent>
		</ContextMenu.Sub>
		<ContextMenu.Separator />
		<ContextMenu.Item
			class="flex justify-between hover:!bg-destructive transition-colors duration-300"
			onclick={(e: Event) => {
				e.stopPropagation();
				openDelete = true;
			}}
		>
			<Label>Delete</Label>
			<Icon class="!size-4 !h-5" icon="lucide:trash" />
		</ContextMenu.Item>
	</ContextMenu.Content>
</ContextMenu.Root>
