<script lang="ts">
  import { onMount } from "svelte";
  import { Pagination, Button, Badge, Input } from "@/lib/components";
  import {
    LibraryCard,
    LibraryOrder,
    LibrarySearch,
    LibrarySource,
    LibraryTag,
  } from "@/components";
  import { FavoriteDB } from "@/repositories";
  import {
    coversLoaded,
    downloadManager,
    favoritesLoaded,
    libraryFavorites,
  } from "@/store";
  import type { Favorite } from "@/types";
  import { cn } from "@/lib/utils";
  import { IS_MOBILE } from "@/constants";
  import { get, has, set } from "tauri-plugin-cache-api";
  let libraryDiv: HTMLDivElement = $state(null!);
  let libdivWidth: number = $state(0);
  let page = $state(1);
  let perPage = $derived(Math.floor(libdivWidth / 169) * 3);
  const count = $derived($libraryFavorites.length);
  let displayedLibrary: Favorite[] = $derived(
    $libraryFavorites.slice((page - 1) * perPage, page * perPage)
  );

  const siblingCount = 1;

  async function loadImage(cover: string, url: string) {
    $coversLoaded[cover] = cover;
    // if (cover.includes("asset.localhost")) return;
    // if (await has(cover)) {
    //   $coversLoaded[cover] = (await get<string>(cover)) ?? cover;
    // } else {
    //   const imageB64 = await $downloadManager.getBase64Image(
    //     cover,
    //     `https://${url.split("/")[2]}/`
    //   );
    //   $coversLoaded[cover] = imageB64;
    //   await set(cover, imageB64);
    // }
  }

  async function loadAllImages() {
    await Promise.all(
      $libraryFavorites.map((fv) => loadImage(fv.cover, fv.link))
    );
  }

  function extraSpaceCards(): number {
    const x = perPage / 3;
    const n = displayedLibrary.length;
    if (n <= x) return x - n;
    if (n <= 2 * x) return 2 * x - n;
    if (n <= 3 * x) return 3 * x - n;
    return 0;
  }

  onMount(async () => {
    const newFavorites = await FavoriteDB.getLibraryFavorites();
    libraryFavorites.set(newFavorites);
    loadAllImages();
  });

  $effect(() => {
    if (displayedLibrary.length === 0 && page > 1) {
      page = Math.ceil($libraryFavorites.length / perPage);
    }
  });
</script>

<div class="h-full overflow-hidden flex flex-col items-center">
  <div
    bind:this={libraryDiv}
    bind:clientWidth={libdivWidth}
    class="scrollbar w-[99.2%] h-full flex flex-wrap content-start justify-center gap-3 scroll-smooth overflow-x-hidden overflow-y-auto pb-5"
  >
    <div
      class={cn(
        "bg-sidebar flex-wrap flex rounded-b-3xl p-2 gap-2 justify-center items-center absolute top-[-8px] z-20",
        IS_MOBILE ? "h-28" : "h-14"
      )}
    >
      <Badge class="h-10 w-12 flex justify-center" variant="secondary">
        {count}
      </Badge>
      <LibrarySearch bind:page bind:favdiv={libraryDiv} />
      <LibraryOrder />
      <LibraryTag />
      <LibrarySource />
    </div>
    <div class="w-full h-12"></div>
    <!-- {#key displayedLibrary} -->
    {#each displayedLibrary as favorite, i (i)}
      <LibraryCard {favorite} />
    {/each}
    <!-- {/key} -->
    {#each Array.from({ length: extraSpaceCards() }, (_, i) => i) as n}
      <div class="w-[158px] h-[271px] p-1"></div>
    {/each}
    {#if $libraryFavorites.length > perPage}
      <div
        class="bg-sidebar flex rounded-3xl smh:rounded-b-none smh:absolute smh:bottom-[11px] mt-3 smh:mt-0 py-2 smh:pb-1 px-2"
      >
        <Pagination.Root
          {count}
          {perPage}
          {siblingCount}
          bind:page
          onPageChange={() => libraryDiv.scrollTo({ top: 0 })}
        >
          {#snippet children({ pages, currentPage })}
            <Pagination.Content tabindex={-1}>
              <Pagination.Item>
                <Pagination.PrevButton class="dark:text-white" tabindex={-1} />
              </Pagination.Item>
              {#each pages as page (page.key)}
                {#if page.type === "ellipsis"}
                  <Pagination.Item tabindex={-1}>
                    <Pagination.Ellipsis class="dark:text-white" />
                  </Pagination.Item>
                {:else}
                  <Pagination.Item>
                    <Pagination.Link
                      {page}
                      class={currentPage === page.value
                        ? "!bg-white !text-black"
                        : "dark:text-white"}
                      isActive={currentPage === page.value}
                      tabindex={-1}
                    >
                      {page.value}
                    </Pagination.Link>
                  </Pagination.Item>
                {/if}
              {/each}
              <Pagination.Item>
                <Pagination.NextButton class="dark:text-white" tabindex={-1} />
              </Pagination.Item>
            </Pagination.Content>
          {/snippet}
        </Pagination.Root>
      </div>
    {/if}
  </div>
</div>
{#each $libraryFavorites.map((_) => _.cover) as image}
  <img class="hidden" src={image} alt="Prefetched" data-sveltekit-prefetch />
{/each}
