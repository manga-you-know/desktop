<script lang="ts">
  import { FavoritePanel } from "@/components";
  import { onMount } from "svelte";
  import { panels } from "@/store";
  import { copyImageFromPath, refreshPanels } from "@/functions";
  import { Pagination, Badge, Input } from "@/lib/components";
  import Icon from "@iconify/svelte";
  import { cn } from "@/lib/utils";

  let page = $state(1);
  let perPage = 22;
  let panelDiv: HTMLDivElement = $state(null!);
  let panelsWithQuery: { src: string; path: string; shouldCopy?: boolean }[] =
    $state([]);
  let count = $derived(panelsWithQuery.length);
  let displayedPanels: { src: string; path: string; shouldCopy?: boolean }[] =
    $derived(panelsWithQuery.slice((page - 1) * perPage, page * perPage));
  let searchTerm = $state("");
  const siblingCount = 1;
  onMount(async () => {
    await refreshPanels();
    panelsWithQuery = $panels;
  });

  async function handleKeydown(event: KeyboardEvent) {
    if (event.key.toUpperCase() === "C" && (event.metaKey || event.ctrlKey)) {
      for (let panel of $panels) {
        if (panel.shouldCopy) {
          await copyImageFromPath(panel.path);
          break;
        }
      }
    }
  }

  function search() {
    if (searchTerm.length === 0) {
      panelsWithQuery = $panels;
      page = 1;
      return;
    }
    panelsWithQuery = $panels.filter((pn) => {
      const splitted = pn.path.includes("\\")
        ? pn.path?.split("\\").at(-1)?.split("~")
        : pn.path?.split("/").at(-1)?.split("~");
      const name = splitted?.at(1)?.replaceAll("-", " ");
      const chapter = splitted?.at(2);
      return (
        name?.includes(searchTerm.toLowerCase()) ||
        chapter?.includes(searchTerm.toLowerCase())
      );
    });
    page = 1;
  }

  panels.subscribe(search);
</script>

<svelte:window onkeydown={handleKeydown} />

<div
  class="scrollbar w-[99.2%] h-full flex flex-wrap justify-center items-start place-content-center gap-5 scroll-smooth overflow-y-scroll overflow-x-hidden p-2"
  bind:this={panelDiv}
>
  <div
    class="bg-secondary/60 backdrop-blur-sm flex !max-w-[80svw] rounded-3xl p-2 gap-2 justify-center items-center absolute z-20"
  >
    <Badge
      class="h-10 w-12 flex justify-center items-center bg-secondary/70 hover:bg-secondary/50"
      variant="secondary"
    >
      {count}
    </Badge>
    <div class="inline-flex relative items-center">
      <Icon
        class={cn(
          "!size-5 ml-3 !text-primary absolute z-10",
          searchTerm !== "" && "cursor-pointer"
        )}
        icon={searchTerm === "" ? "uil:search" : "lucide:x"}
        onclick={() => {
          searchTerm = "";
          search();
        }}
      />
      <Input
        bind:value={searchTerm}
        class="w-52 pl-9 bg-secondary/70 hover:bg-secondary/50"
        labelClass="ml-6"
        variant="secondary"
        placeholder="Search name | chapter..."
        floatingLabel
        autocomplete="off"
        tabindex={-1}
        oninput={search}
      />
    </div>
  </div>
  <div class="w-full h-0 smh:h-14"></div>
  {#each displayedPanels as panel}
    <FavoritePanel
      src={panel.src}
      path={panel.path}
      bind:shouldCopy={panel.shouldCopy}
    />
  {/each}
  {#if displayedPanels.length === 0}
    <Badge class="h-10">
      No panel found, try adding it with Ctrl + S while in a chapter
    </Badge>
  {/if}
  {#if displayedPanels.length > perPage}
    <div class="w-full h-10"></div>
    <div
      class="bg-secondary/60 backdrop-blur-sm flex rounded-3xl -mt-[15px] z-20 absolute bottom-6 smh:mt-3 p-2 transition-all"
    >
      <Pagination.Root
        {count}
        {perPage}
        {siblingCount}
        bind:page
        onPageChange={() => panelDiv.scrollTo({ top: 0 })}
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
                    variant={currentPage === page.value ? "default" : "ghost"}
                    effect={currentPage === page.value ? "ringHover" : null}
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
