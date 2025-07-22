<script lang="ts">
  import { FavoritePanel, Select } from "@/components";
  import { onMount } from "svelte";
  import { panels } from "@/store";
  import { copyImageFromPath, refreshPanels } from "@/functions";
  import { Pagination, Badge, Input } from "@/lib/components";
  import Icon from "@iconify/svelte";
  import { cn } from "@/lib/utils";
  import { delay } from "@/utils";
  import type { Favorite, Panel } from "@/types";
  import { FavoriteDB } from "@/repositories";
  import { ScrollingValue } from "svelte-ux";

  let page = $state(1);
  let perPage = 22;
  let panelDiv: HTMLDivElement = $state(null!);
  let rawFavorites: Favorite[] = $state([]);
  let panelsWithQuery: Panel[] = $state([]);
  let count = $derived(panelsWithQuery.length);
  let displayedPanels: Panel[] = $derived(
    panelsWithQuery.slice((page - 1) * perPage, page * perPage),
  );
  let searchTerm = $state("");
  let selectedTitle = $state("");
  let selectedChapter = $state("");
  let panelsTitle: string[] = $derived(
    Array.from(new Set($panels.map((pn) => pn.name))),
  );

  let panelsTitleLabel: Record<string, string> = $derived(
    Object.fromEntries(
      Array.from(new Set($panels.map((pn) => [pn.id, pn.name])))
        .filter((pn) => rawFavorites.find((f) => f.id === pn[0]))
        .map((pn) => [
          pn[1],
          rawFavorites.find((f) => f.id === pn[0])?.name ?? "",
        ]),
    ),
  );

  let panelsChapter: string[] = $derived(
    Array.from(
      new Set(
        $panels
          .filter((pn) =>
            pn.name.toLowerCase().includes(selectedTitle.toLowerCase()),
          )
          .map((pn) => pn.chapter),
      ),
    ),
  );
  const siblingCount = 1;

  async function refreshRaw() {
    rawFavorites = await FavoriteDB.getRawFavorites();
  }

  onMount(async () => {
    await refreshPanels();
    panelsWithQuery = $panels;
    refreshRaw();
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
    refreshRaw();
    if (
      searchTerm.length === 0 &&
      selectedTitle === "" &&
      selectedChapter === ""
    ) {
      panelsWithQuery = $panels;
      page = 1;
      return;
    }
    panelsWithQuery = $panels.filter((pn) => {
      return (
        (pn.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pn.chapter?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        pn.name?.toLowerCase().includes(selectedTitle.toLowerCase()) &&
        (selectedChapter === ""
          ? true
          : pn.chapter?.toLowerCase() === selectedChapter.toLowerCase())
      );
    });
    page = 1;
  }

  panels.subscribe(() => {
    page = 1;
    selectedTitle = "";
    selectedChapter = "";
    search();
  });
</script>

<svelte:window onkeydown={handleKeydown} />

<div
  class="scrollbar w-[99.2%] h-full flex flex-wrap justify-center items-start place-content-center gap-5 scroll-smooth overflow-y-scroll overflow-x-hidden p-5"
  bind:this={panelDiv}
>
  <div
    class="bg-secondary/60 backdrop-blur-sm flex !max-w-[80svw] rounded-3xl p-2 gap-2 justify-center items-center absolute z-20"
  >
    <Badge class="h-10 w-12 flex justify-center items-center" variant="outline">
      <ScrollingValue axis="y" value={count} />
    </Badge>
    <div class="inline-flex relative items-center">
      <Icon
        class={cn(
          "!size-5 ml-3 !text-primary absolute z-10",
          searchTerm !== "" && "cursor-pointer",
        )}
        icon={searchTerm === "" ? "uil:search" : "lucide:x"}
        onclick={() => {
          searchTerm = "";
          search();
        }}
      />
      <Input
        bind:value={searchTerm}
        class="w-52 pl-9"
        labelClass="ml-6"
        variant="outline"
        placeholder="Search name | chapter..."
        floatingLabel
        autocomplete="off"
        tabindex={-1}
        oninput={search}
      />
    </div>
    <Select
      class="max-w-52"
      classPopup="w-[11rem]"
      bind:selected={selectedTitle}
      items={panelsTitle}
      label="Title"
      itemsLabel={panelsTitleLabel}
      wheelControls
      onselect={async () => {
        selectedChapter = "";
        search();
        await delay(5);
        if (panelsChapter.length === 1) selectedChapter = panelsChapter[0];
      }}
    />
    <Select
      class="w-28"
      classPopup="w-24"
      bind:selected={selectedChapter}
      items={panelsChapter}
      label="Chapter"
      wheelControls
      closeButton={panelsChapter.length > 1}
      onselect={search}
    />
  </div>
  <div class="w-full h-32"></div>
  {#each displayedPanels as panel}
    <FavoritePanel
      path={panel.path}
      title={rawFavorites.find((f) => f.id === panel.id)?.name ?? panel.name}
      chapter={panel.chapter}
      bind:shouldCopy={panel.shouldCopy}
    />
  {/each}
  {#if displayedPanels.length === 0}
    <Badge class="h-10">
      No panel found, try adding it with Ctrl + S while in a chapter
    </Badge>
  {/if}
  {#if panelsWithQuery.length > perPage}
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
                    variant={currentPage === page.value ? "secondary" : "ghost"}
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
