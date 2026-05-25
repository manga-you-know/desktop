<script lang="ts">
  import { Tooltip } from "@/components";
  import { Badge, Button, Input } from "@/lib/components";
  import { titleCase } from "@/lib/utils";
  import {
    openExtensions,
    searchInput,
    searchMode,
    searchType,
    suwayomi,
  } from "@/states";
  import Icon from "@iconify/svelte";
  import { ScrollingValue } from "svelte-ux";

  let debounceTimer: ReturnType<typeof setTimeout>;

  function handleInput() {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      // search(inputElement.value);
    }, 300);
  }
</script>

<div class="justify-around-stretch flex flex-col gap-3">
  <div class="flex items-center justify-center gap-2">
    <Badge class="h-10 w-14" variant="outline">
      <ScrollingValue value={0} />
    </Badge>
    <Input
      class="w-90"
      divClass="w-90"
      variant="outline"
      placeholder="Filter the results..."
      bind:value={searchInput.value}
      oninput={handleInput}
    />
    <Tooltip text="Search mode">
      <Button
        class="w-27 justify-start"
        onclick={() => {
          if (searchMode.value === "single") {
            searchMode.value = "multiple";
          } else if (searchMode.value === "multiple") {
            searchMode.value = "global";
          } else {
            searchMode.value = "single";
          }
        }}
      >
        <Icon
          icon={searchMode.value === "single"
            ? "lucide:square-divide"
            : searchMode.value === "multiple"
              ? "lucide:layers"
              : "lucide:globe"}
        />
        {titleCase(searchMode.value)}
      </Button>
    </Tooltip>
    <Tooltip text="Manage extensions & sources">
      <Button variant="outline" onclick={openExtensions.open}>
        <Icon icon="lucide:puzzle" />
      </Button>
    </Tooltip>
  </div>
  <div class="flex items-center justify-center gap-1">
    <Button
      class="w-30"
      variant={searchType.value === "filter" ? "secondary" : "outline"}
      onclick={() => {
        searchType.value = "filter";
      }}
    >
      <Icon icon="lucide:text-search" />Filter
    </Button>
    <Button
      class="w-30"
      variant={searchType.value === "popular" ? "secondary" : "outline"}
      onclick={() => {
        searchType.value = "popular";
      }}
    >
      <Icon icon="lucide:heart" />Popular
    </Button>
    <Button
      class="w-30"
      variant={searchType.value === "latest" ? "secondary" : "outline"}
      onclick={() => {
        searchType.value = "latest";
      }}
    >
      <Icon icon="lucide:badge-info" />Latest
    </Button>
  </div>
</div>
