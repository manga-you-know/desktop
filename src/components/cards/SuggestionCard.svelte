<script lang="ts">
  import { Button, Badge, Tooltip, Label } from "@/lib/components";
  import Icon from "@iconify/svelte";
  import { ReadFavorite, EditFavorite, AskDelete } from "@/components";
  import type { Suggestion } from "@/types";
  import { FavoriteDB } from "@/repositories";

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
  class="group relative rounded-2xl h-[244px] max-h-[264] w-[160px] max-w-[160px] flex flex-col p-1 items-center justify-center transition-transform duration-300 ease-in-out border border-transparent outline-none bg-secondary hover:bg-gray-800 hover:scale-[0.95] hover:cursor-pointer hover:shadow-lg hover:absolute transform hover:border-1 focus:bg-gray-800 focus:shadow-lg"
  onclick={() => (isOpen = true)}
  tabindex={-1}
>
  <img
    class="w-[150px] min-w-[150px] max-w-[150px] max-h-[230px] object-contain rounded-xl"
    src={suggestion.cover}
    alt={suggestion.name}
  />
  <div
    class="w-full h-full fixed rounded-t-[80%] flex flex-col justify-between items-center -m-[5.5px]"
  >
    <!-- <Badge
      class=" w-40 max-w-40 flex justify-center rounded-xl bg-"
      {variant}
    > -->
    <div
      class="h-[244px] w-[160px] max-w-[168px] -mt-[1px] flex justify-center from-background bg-gradient-to-b to-50% to-transparent"
    >
      <Label
        class="max-w-[150px] mt-[12px] text-sm truncate opacity-100 text-gray-600 dark:text-white"
      >
        {suggestion.name}
      </Label>
    </div>
    <div class="w-full h-full fixed flex flex-col justify-between items-center">
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
          class="rounded-none !-mx-[0.7px]"
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
      class="absolute inset-0 bg-background opacity-0 group-hover:opacity-50 transition-opacity duration-300"
    ></div>
    <div
      class="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
    >
      <Label
        class="max-w-[150px] mt-[12px] text-xl truncate opacity-100 text-gray-600 dark:text-white"
      >
        {suggestion.name}
      </Label>
      <!-- Content to show on hover -->
    </div>
  </div></button
>
