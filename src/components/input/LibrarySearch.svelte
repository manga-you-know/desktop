<script lang="ts">
  import Icon from "@iconify/svelte";
  import { FavoriteRepository } from "@/repositories";
  import { libraryFavorites, libraryQuery } from "@/store";
  import { Button, Input } from "@/lib/components";

  interface Props {
    showInput?: boolean;
  }
  let { showInput = $bindable($libraryQuery !== "") }: Props = $props();

  let isHovered = false;

  function handleSearch(e: Event) {
    e.stopPropagation();
    const inputElement = document.getElementById("favorite-search");
    if (inputElement && document.activeElement === inputElement) {
      return;
    }
    if ($libraryQuery.length > 0) {
      showInput = false;
      libraryQuery.set("");
      FavoriteRepository.getLibraryFavorites().then((favorites) => {
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
    if ($libraryQuery.length === 0) showInput = false;
  }
  function updateFavorites() {
    FavoriteRepository.getLibraryFavorites().then((favorites) => {
      libraryFavorites.set(favorites);
    });
  }
</script>

<Button
  class="transition duration-200"
  id="button-search"
  variant="secondary"
  onclick={handleSearch}
  onmouseenter={() => (isHovered = true)}
  onmouseleave={() => (isHovered = false)}
  tabindex={-1}
>
  <Icon class="!w-5 !h-5 mr-[-10px] mx-[-4px]" icon="uil:search" />
  <div
    class={`relative transition-all duration-500 ease-in-out ${showInput ? "max-w-xs opacity-100 focus:ring-0" : "max-w-[0px] opacity-0 overflow-hidden"}`}
  >
    <Input
      variant="link"
      id="favorite-search"
      bind:value={$libraryQuery}
      oninput={updateFavorites}
      onfocusout={handleOut}
      floatingLabel
      placeholder="Search..."
      autocomplete="off"
      tabindex={-1}
    />
  </div>
</Button>
