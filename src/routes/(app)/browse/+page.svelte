<script lang="ts">
  import { SelectSource } from "@/components";
  import { Badge, Button, Input } from "@/lib/components";
  import { openSearch } from "@/store";
  import Icon from "@iconify/svelte";
  import { ScrollingValue } from "svelte-ux";

  let searchQuery = $state("");
</script>

<div class="flex h-full flex-col overflow-hidden mr-4">
  <div class="flex gap-2 justify-center p-2">
    <Button
      onclick={() => {
        $openSearch = true;
      }}
    ></Button>
    <Badge class="min-w-12 justify-center" variant="outline">
      <ScrollingValue value={0} />
    </Badge>
    <div
      class="rounded-xl flex items-center px-3 border border-secondary bg-background/30 hover:bg-secondary/50 dark:text-slate-200 transition-all duration-300"
    >
      <Icon icon="lucide:search" />
      <Input
        class="w-[20rem]"
        variant="link"
        placeholder="Search..."
        bind:value={searchQuery}
      />
    </div>

    <SelectSource />
  </div>

  <div
    class="scrollbar flex h-full w-full flex-wrap items-start justify-center gap-5 overflow-x-hidden overflow-y-scroll scroll-smooth p-1"
  ></div>
</div>
