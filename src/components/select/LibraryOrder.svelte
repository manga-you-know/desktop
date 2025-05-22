<script lang="ts">
  import { Button, Command, Label, Popover } from "@/lib/components";
  import { libraryOrder, isAscending } from "@/store";
  import { saveSettings, refreshLibrary } from "@/functions";
  import { titleCase } from "@/utils";
  import Icon from "@iconify/svelte";

  let open = $state(false);
  let triggerRef = $state<HTMLButtonElement>(null!);
  const orderIcon: { [key: string]: string } = {
    id: "mdi:sort",
    name: "mdi:sort-alphabetical-variant",
  };
  const orders = ["id", "name"];
</script>

<div class="inline-flex">
  <Popover.Root bind:open>
    <Popover.Trigger bind:ref={triggerRef}>
      {#snippet child({ props })}
        <Button
          variant="outline"
          class="w-[80px] rounded-r-none justify-between focus:none"
          {...props}
          role="combobox"
          aria-expanded={open}
          tabindex={-1}
          onwheel={(e) => {
            if (e.deltaY < 0) {
              libraryOrder.set(
                orders.at(orders.findIndex((o) => o === $libraryOrder) - 1) ??
                  orders[0]
              );
            } else {
              libraryOrder.set(
                orders.at(orders.findIndex((o) => o === $libraryOrder) + 1) ??
                  orders[0]
              );
            }
            refreshLibrary();
            saveSettings();
          }}
          onmouseup={(e) => {
            if (e.button === 1) {
              libraryOrder.set(
                orders.at(orders.findIndex((o) => o === $libraryOrder) + 1) ??
                  orders[0]
              );
              refreshLibrary();
              saveSettings();
            }
          }}
        >
          <Icon icon={orderIcon[$libraryOrder]} />
          <Icon icon="lucide:chevron-down" class="text-gray-500" />
        </Button>
      {/snippet}
    </Popover.Trigger>
    <Popover.Content class="w-[110px] ml-7 p-0 ">
      <Command.Root class="dark:bg-background">
        <Command.List>
          <Command.Group>
            {#each orders as order}
              <Command.Item
                class="w-full flex justify-between hover:!bg-slate-300 dark:hover:!bg-secondary/50 {order ===
                $libraryOrder
                  ? 'bg-slate-400 dark:!bg-secondary'
                  : ' dark:aria-selected:bg-inherit'}"
                value={order}
                onSelect={async () => {
                  libraryOrder.set(order);
                  open = false;
                  await refreshLibrary();
                  await saveSettings();
                }}
              >
                <Label class="w-full text-sm ">{titleCase(order)}</Label>
                <Icon icon={orderIcon[order]} />
              </Command.Item>
            {/each}
          </Command.Group>
        </Command.List>
      </Command.Root>
    </Popover.Content>
  </Popover.Root>
  <Button
    class="w-[20px] ml-[-1px] rounded-l-none"
    variant="secondary"
    onclick={async () => {
      isAscending.set(!$isAscending);
      await refreshLibrary();
      await saveSettings();
    }}
    tabindex={-1}
    onwheel={(e) => {
      isAscending.set(!$isAscending);
      refreshLibrary();
      saveSettings();
    }}
    onmouseup={(e) => {
      if (e.button === 1) {
        isAscending.set(!$isAscending);
        refreshLibrary();
        saveSettings();
      }
    }}
  >
    <Icon
      icon={$isAscending ? "typcn:arrow-sorted-up" : "typcn:arrow-sorted-down"}
    />
  </Button>
</div>
