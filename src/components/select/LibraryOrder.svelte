<script lang="ts">
  import { Button, Command, Popover } from "@/lib/components";
  import { libraryFavorites, orderBy, isAscending } from "@/store";
  import { saveSettings } from "@/functions";
  import { FavoriteRepository } from "@/repositories";
  import Icon from "@iconify/svelte";

  let open = $state(false);
  let triggerRef = $state<HTMLButtonElement>(null!);
  const orderIcon: { [key: string]: string } = {
    id: "mdi:sort",
    name: "mdi:sort-alphabetical-variant",
  };
  const orders = ["id", "name"];
  async function refreshFavorites() {
    libraryFavorites.set(await FavoriteRepository.getFavorites());
  }
  orderBy.subscribe((_) => {
    refreshFavorites();
  });
  isAscending.subscribe((_) => {
    refreshFavorites();
  });
</script>

<div class="inline-flex">
  <Popover.Root bind:open>
    <Popover.Trigger bind:ref={triggerRef}>
      {#snippet child({ props })}
        <Button
          variant="outline"
          class="w-[80px] rounded-l-md rounded-r-none justify-between focus:none"
          {...props}
          role="combobox"
          aria-expanded={open}
        >
          <Icon icon={orderIcon[$orderBy]} />
          <Icon icon="lucide:chevron-down" class="text-gray-500" />
        </Button>
      {/snippet}
    </Popover.Trigger>
    <Popover.Content class="w-[80px] p-0">
      <Command.Root class="bg-black">
        <Command.List>
          <Command.Group>
            {#each orders as order}
              <Command.Item
                class={`w-full flex justify-between hover:!bg-slate-800 ${order === $orderBy ? "!bg-gray-900" : "aria-selected:bg-inherit"}`}
                value={order}
                onSelect={async () => {
                  orderBy.set(order);
                  open = false;
                  await refreshFavorites();
                  await saveSettings();
                }}
              >
                <span class="text-sm ml-[-4px]"> {order}</span>
                <Icon icon={orderIcon[order]} />
              </Command.Item>
            {/each}
          </Command.Group>
        </Command.List>
      </Command.Root>
    </Popover.Content>
  </Popover.Root>
  <Button
    class="w-[20px] ml-[-1px] rounded-l-none rounded-r-md"
    variant="outline"
    onclick={async () => {
      isAscending.set(!$isAscending);
      await refreshFavorites();
      await saveSettings();
    }}
  >
    <Icon
      icon={$isAscending ? "typcn:arrow-sorted-up" : "typcn:arrow-sorted-down"}
    />
  </Button>
</div>
