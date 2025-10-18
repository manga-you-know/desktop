<script lang="ts">
  import { Button, Badge, Label } from "@/lib/components";
  import { ReadFavorite, Image, SuggestionModal } from "@/components";
  import type { Favorite, Suggestion } from "@/types";

  interface Props {
    suggestion: Suggestion;
  }

  let { suggestion }: Props = $props();
  let isOpen = $state(false);
  let openReadModal = $state(false);
  let openFavorite: Favorite = $state(null!);
</script>

{#if openFavorite}
  <ReadFavorite favorite={openFavorite} bind:open={openReadModal} />
{/if}

<SuggestionModal
  {suggestion}
  bind:open={isOpen}
  bind:openReadModal
  bind:openFavorite
/>

<button
  class="group relative rounded-2xl h-[244px] max-h-[264px] w-[160px] max-w-[160px] flex flex-col p-1 items-center justify-center transition-transform duration-300 ease-in-out border-transparent outline-none bg-secondary hover:bg-background hover:border-b-2 hover:border-x-2 hover:border-secondary hover:scale-[0.95] hover:cursor-pointer hover:absolute transform hover:border"
  onclick={() => (isOpen = true)}
  tabindex={-1}
>
  <Image
    class="w-[150px] min-w-[150px] max-w-[150px] max-h-[230px] object-contain rounded-xl"
    src={suggestion.cover}
    alt={suggestion.name}
  />
  <div
    class="w-full h-full fixed rounded-t-[80%] flex flex-col justify-between items-center -m-[5.5px]"
  >
    <div
      class="h-[244px] w-[160px] max-w-[168px] -mt-px flex justify-center from-background bg-linear-to-b to-50% to-transparent transition-all duration-500 group-hover:op"
    >
      <Label
        class="max-w-[150px] mt-[7px] text-sm truncate opacity-100 text-primary-foreground transition-all duration-500 group-hover:-translate-y-8"
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
          class="rounded-none -mx-[0.7px]!"
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

    <div
      class="absolute inset-0 bg-background opacity-0 group-hover:opacity-50 rounded-xl transition-opacity duration-300"
    ></div>
    <div
      class="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
    >
      <Label
        class="text-primary cursor-pointer max-w-[150px] text-md truncate opacity-0 group-hover:opacity-100 transition-all  duration-300"
      >
        {suggestion.name}
      </Label>
      <p class="text-primary text-[10px] line-clamp-9">
        {suggestion.description}
      </p>
    </div>
  </div></button
>
