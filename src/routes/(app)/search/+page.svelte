<script lang="ts">
  import { Tooltip } from "@/components";
  import { Badge, Button, Input } from "@/lib/components";
  import { titleCase } from "@/lib/utils";
  import {
    openExtensions,
    searchInput,
    sourceGroupMode,
    searchType,
    suwayomi,
  } from "@/states";
  import Icon from "@iconify/svelte";
  import { animate } from "animejs";
  import { ScrollingValue } from "svelte-ux";

  let debounceTimer: ReturnType<typeof setTimeout>;
  let resultFilter = $state("");

  function handleInput() {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      // search(inputElement.value);
      resultFilter = "";
    }, 300);
  }
</script>

<div class="justify-around-stretch flex w-full flex-col gap-3">
  <div class="flex items-center justify-center gap-2">
    <Input
      class="w-70"
      divClass="w-70"
      variant="secondary"
      placeholder="Query in source{sourceGroupMode.value !== 'single'
        ? 's'
        : ''}..."
      bind:value={searchInput.value}
      oninput={handleInput}
    />
    <Tooltip text="Source mode">
      <Button
        class="w-27 justify-start font-bold"
        onclick={(e) => {
          if (sourceGroupMode.value === "single") {
            sourceGroupMode.value = "group";
          } else if (sourceGroupMode.value === "group") {
            sourceGroupMode.value = "global";
          } else {
            sourceGroupMode.value = "single";
          }
          animate(e.currentTarget, {
            filter: ["blur(1px)", "blur(2px)", "blur(0px)"],
            duration: 500,
            easing: "easeOutQuad",
          });
        }}
      >
        <Icon
          icon={sourceGroupMode.value === "single"
            ? "lucide:square-divide"
            : sourceGroupMode.value === "group"
              ? "lucide:layers"
              : "lucide:globe"}
        />
        {titleCase(sourceGroupMode.value)}
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
      <Icon icon="lucide:text-search" />Search
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
  <div class="bg-secondary h-1 w-full rounded-2xl"></div>
  <div class="flex items-center justify-center gap-2">
    <Badge class="h-10 w-14 text-sm font-bold" variant="outline">
      <ScrollingValue value={0} />
      /
      <ScrollingValue value={0} />
    </Badge>
    <Input
      class="hover:bg-secondary/20 w-70"
      divClass="w-70"
      variant="outline"
      placeholder="Filter results..."
      bind:value={resultFilter}
    />
    <Button></Button>
  </div>
</div>
