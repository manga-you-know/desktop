<script lang="ts">
  import { Button, Command, Popover } from "@/lib/components";
  import { tick } from "svelte";
  import Icon from "@iconify/svelte";

  let open = $state(false);
  let selectedValue = $state("mdi:sort");
  let triggerRef = $state<HTMLButtonElement>(null!);
  let isAsc = $state(true);
  const order = [
    { icon: "mdi:sort", type: "id", label: "Ascending" },
    {
      icon: "mdi:sort-alphabetical-variant",
      type: "name",
      label: "Descending",
    },
  ];
  function closeAndFocusTrigger() {
    open = false;
    tick().then(() => {
      triggerRef.focus();
    });
  }
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
          {#if selectedValue}
            <Icon icon={selectedValue} />
          {:else}
            Select
          {/if}
          <Icon icon="lucide:chevron-down" class="text-gray-500" />
        </Button>
      {/snippet}
    </Popover.Trigger>
    <Popover.Content class="w-[60px] p-0">
      <Command.Root>
        <Command.List>
          <Command.Group>
            {#each order as framework}
              <Command.Item
                value={framework.type}
                onSelect={() => {
                  selectedValue = framework.icon;
                  closeAndFocusTrigger();
                }}
                class="w-full flex justify-center"
              >
                <Icon icon={framework.icon} />
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
    onclick={() => (isAsc = !isAsc)}
  >
    <Icon icon={isAsc ? "typcn:arrow-sorted-up" : "typcn:arrow-sorted-down"} />
  </Button>
</div>
