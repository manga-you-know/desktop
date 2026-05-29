<script lang="ts">
  import { Tooltip } from "@/components";
  import { Badge, Button, Input } from "@/lib/components";
  import { cn, titleCase } from "@/lib/utils";
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
      console.log("fire", searchInput.value);
      resultFilter = "";
    }, 600);
  }
</script>

<div class="justify-around-stretch flex w-full flex-col gap-3">
  <div class="flex items-center justify-center gap-2">
    <Badge class="h-10 w-13" variant="outline">
      <ScrollingValue value={0} />
    </Badge>
    <Input
      class="w-70 transition-all"
      divClass="w-70 transition-all"
      variant="outline"
      placeholder="Query in source{sourceGroupMode.value !== 'single'
        ? 's'
        : ''}..."
      disabled={searchType.value !== "filter"}
      oninput={handleInput}
      bind:value={searchInput.value}
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
            filter: ["blur(0px)", "blur(1px)", "blur(2px)", "blur(0px)"],
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
    <div
      class="border-secondary bg-background/30 parent flex gap-1 rounded-2xl border p-2"
    >
      <Button
        class={cn(
          "pointer-events-none absolute w-30 transition-all duration-500",
          searchType.value === "filter" && "translate-x-0",
          searchType.value === "popular" && "translate-x-31",
          searchType.value === "latest" && "translate-x-62",
        )}
        variant="secondary"
        id="most"
      ></Button>
      <Button
        class={cn(
          "hover:bg-secondary/60 z-2 w-30",
          searchType.value === "filter" && "hover:text-primary/70",
        )}
        variant="ghost"
        onclick={() => {
          searchType.value = "filter";
          animate("#most", {
            filter: ["blur(0px)", "blur(4)", "blur(0px)"],
            duration: 500,
            easing: "easeOutQuad",
          });
        }}
      >
        <Icon icon="lucide:text-search" />Search
      </Button>
      <Button
        class={cn(
          "hover:bg-secondary/60 z-2 w-30",
          searchType.value === "popular" && "hover:text-primary/70",
        )}
        variant="ghost"
        onclick={() => {
          searchType.value = "popular";
        }}
      >
        <Icon icon="lucide:heart" />Popular
      </Button>
      <Button
        class={cn(
          "hover:bg-secondary/60 z-2 w-30",
          searchType.value === "latest" && "hover:text-primary/70",
        )}
        variant="ghost"
        onclick={() => {
          searchType.value = "latest";
        }}
      >
        <Icon icon="lucide:badge-info" />Latest
      </Button>
    </div>
  </div>
  <div class="bg-secondary/40 h-1 w-full rounded-2xl"></div>
  <div class="flex items-center justify-center gap-2">
    <Badge class="h-10 w-20 text-sm font-bold" variant="outline">
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
