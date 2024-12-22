<script lang="ts">
	import { Badge, Button, ButtonGroup, Card, Tooltip } from "flowbite-svelte";
	import Icon from "@iconify/svelte";
  import type { Favorite } from "@/models";
	const { favorite }: { favorite: Favorite} = $props();
</script>

<div
	class="relative rounded-xl h-[260px] w-42 max-w-42 flex flex-col p-1  items-center transition-transform duration-300 ease-in-out border border-transparent outline-none bg-gray-900 hover:bg-gray-800 hover:cursor-pointer hover:shadow-lg hover:z-30 transform hover:scale-[1.08] hover:border-white hover:border-1 focus:bg-gray-800 focus:shadow-lg focus:scale-[1.08] focus:border-white focus:border-1"
>
	<img src={favorite.cover} alt={favorite.name} class="w-40 h-60 min-w-40 max-w-40 min-h-60 max-h-60 mt-3 mb-2 object-contain rounded-b-xl bg-gray-500" />
		<div class="w-full h-full fixed flex flex-col justify-between items-center ">

		<Badge class="w-40 rounded-xl" color="dark"> {favorite.name.length > 16 ? favorite.name.substring(0, 16) + "..." : favorite.name}</Badge>
		<div class="w-full h-10 flex justify-center pb-1 ">
			<!-- <ButtonGroup>
				<Button color="dark" size="sm">
					<Icon icon="lucide:book-open-text" class="w-4 h-4" />
				</Button>
				<Button color="dark" size="sm">
					<Icon icon="lucide:square-pen" class="w-4 h-4" />
				</Button>
				<Button color="dark" size="sm">
					<Icon icon="lucide:circle-x" class="w-4 h-4" />
				</Button>
			</ButtonGroup> -->
		</div>
	</div>
</div>