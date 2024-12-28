<script lang="ts">
  import Icon from "@iconify/svelte";
  import { FavoriteRepository } from "@/repositories";
  import { libraryFavorites, searchTerm } from "@/store";
  import { Button, Input } from "@/lib/components";

  interface Props {
    showInput?: boolean;
  }
  let { showInput = $bindable($searchTerm !== "") }: Props = $props();

  let isHovered = false;

  function handleSearch(e: Event) {
    e.stopPropagation();
    const inputElement = document.getElementById("favorite-search");
    if (inputElement && document.activeElement === inputElement) {
      return;
    }
    if ($searchTerm.length > 0) {
      showInput = false;
      searchTerm.set("");
      FavoriteRepository.getFavorites().then((favorites) => {
        libraryFavorites.set(favorites);
      });
      return;
    }
    showInput = !showInput;
    setTimeout(() => {
      inputElement?.focus();
    }, 10);
  }
  function handleOut(e: Event) {
    e.stopPropagation();
    if (isHovered) return;
    if ($searchTerm.length === 0) showInput = false;
  }
  function updateFavorites() {
    FavoriteRepository.getFavorites().then((favorites) => {
      libraryFavorites.set(favorites);
    });
  }
</script>

<Button
  class="rounded-md h-10 transition duration-200"
  size="sm"
  id="button-search"
  variant="outline"
  onclick={handleSearch}
  onmouseenter={() => (isHovered = true)}
  onmouseleave={() => (isHovered = false)}
>
  <Icon class="w-3 h-3 mr-[-9px]" icon="lucide:search" />
  <div
    class={`relative transition-all duration-500 ease-in-out ${showInput ? "max-w-xs opacity-100 focus:ring-0" : "max-w-[0px] opacity-0 overflow-hidden"}`}
  >
    <Input
      class="!border-none focus-visible:ring-0 rounded-none !outline-none ring-0 !bg-transparent !text-white"
      id="favorite-search"
      bind:value={$searchTerm}
      oninput={updateFavorites}
      onfocusout={handleOut}
      placeholder="Search"
    />
  </div>
</Button>
