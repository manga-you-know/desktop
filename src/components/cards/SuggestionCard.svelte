<script lang="ts">
  import { Button, Badge, Tooltip } from "@/lib/components";
  import Icon from "@iconify/svelte";
  import { ReadFavorite, EditFavorite, AskDelete } from "@/components";
  import type { Suggestion } from "@/interfaces";
  import { FavoriteRepository } from "@/repositories";

  interface Props {
    suggestion: Suggestion;
  }

  interface Event {
    stopPropagation: () => void;
  }
  let { suggestion }: Props = $props();
  let isOpen = $state(false);
  let isEdit = $state(false);
  let isDelete = $state(false);
</script>

<!-- <FavoriteModal {favorite} bind:open={isOpen} /> -->
<!-- <EditFavorite {favorite} bind:open={isEdit} /> -->
<!-- <AskDelete {favorite} bind:open={isDelete} /> -->
<button
  class="group relative rounded-xl h-[264px] max-h-[264] w-[168px] max-w-[168px] flex flex-col p-1 items-center transition-transform duration-300 ease-in-out border border-transparent outline-none bg-gray-900 hover:bg-gray-800 hover:scale-[0.90] hover:cursor-pointer hover:shadow-lg hover:z-50 transform hover:border-white hover:border-1 focus:bg-gray-800 focus:shadow-lg focus:border-white focus:border-1 hover:sticky"
  onclick={() => (isOpen = true)}
  tabindex={-1}
>
  <img
    class="w-[155px] h-[235px] min-w-[155px] max-w-[155px] min-h-[235px] max-h-[235px] mt-[17px] object-contain rounded-b-md !bg-gray-600"
    src={suggestion.cover}
    alt={suggestion.name}
  />
  <div class="w-full h-full fixed flex flex-col justify-between items-center">
    <Badge class="w-40 flex justify-center rounded-xl" variant="secondary">
      {suggestion.name.length > 16
        ? suggestion.name.substring(0, 16) + "..."
        : suggestion.name}
    </Badge>
    <div
      class="w-full h-8 flex justify-center mb-2 p-1 transform translate-y-full opacity-0 transition-all duration-300 ease-in-out group-hover:translate-y-0 group-hover:opacity-100"
    >
      <!-- <div class="inline-flex rounded-md shadow-sm" role="group">
        <Button
          class="rounded-r-none"
          variant="secondary"
          size="sm"
          tabindex={-1}
          onclick={(e: Event) => {
            e.stopPropagation();
            isOpen = true;
          }}
        >
          <Icon icon="lucide:book-open-text" class="w-4 h-4" />
        </Button>
        <Button
          class="rounded-none !mx-[-0.7px]"
          variant="secondary"
          size="sm"
          tabindex={-1}
          onclick={(e: Event) => {
            e.stopPropagation();
            isEdit = true;
          }}
        >
          <Icon icon="lucide:square-pen" class="w-4 h-4" />
        </Button>
        <Button
          class="rounded-l-none"
          variant="secondary"
          size="sm"
          tabindex={-1}
          onclick={(e: Event) => {
            e.stopPropagation();
            isDelete = true;
          }}
        >
          <Icon icon="lucide:circle-x" class="w-4 h-4" />
        </Button>
      </div> -->
    </div>
  </div>

  <!-- Hover effect overlay -->
  <div
    class="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity duration-300"
  ></div>
  <div
    class="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
  >
    <span class="text-xl">{suggestion.name}</span>
    <!-- Content to show on hover -->
  </div>
</button>
