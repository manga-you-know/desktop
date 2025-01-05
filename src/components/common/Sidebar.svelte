<script>
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { Sidebar } from "@/lib/components";
  import { openSearch, openSettings } from "@/store";
  import Icon from "@iconify/svelte";

  const items = [
    {
      name: "Home",
      path: "/home",
      iconActive: "heroicons:home-20-solid",
      icon: "heroicons:home",
    },
    {
      name: "Favorites",
      path: "/favorites",
      iconActive: "heroicons:star-solid",
      icon: "heroicons:star",
    },
    {
      name: "Library",
      path: "/library",
      iconActive: "solar:book-2-bold",
      icon: "solar:book-2-outline",
    },
    // {
    //   name: "Search",
    //   path: "/search",
    //   iconActive: "mingcute:search-fill",
    //   icon: "mingcute:search-line",
    // },
    // {
    //   name: "Settings",
    //   path: "/settings",
    //   iconActive: "heroicons:cog-6-tooth-solid",
    //   icon: "heroicons:cog-6-tooth",
    // },
  ];
</script>

<Sidebar.Root class="!pl-0 hover:bg-sidebar" variant="inset" collapsible="icon">
  <Sidebar.Header></Sidebar.Header>
  <Sidebar.Content>
    <Sidebar.Group>
      <!-- <Sidebar.GroupLabel>pages</Sidebar.GroupLabel> -->
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {#each items as item (item.name)}
            <Sidebar.MenuItem>
              <Sidebar.MenuButton onclick={() => goto(item.path)} tabindex={-1}>
                <Icon
                  icon={page.url.pathname === item.path
                    ? item.iconActive
                    : item.icon}
                  class="!w-4 !h-4 "
                />
                <span class="text-sm"> {item.name} </span>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          {/each}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
    <Sidebar.Group>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton
              onclick={() => ($openSearch = true)}
              tabindex={-1}
            >
              <Icon
                icon={$openSearch
                  ? "mingcute:search-fill"
                  : "mingcute:search-line"}
              />
              <span class="text-sm"> Search </span>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton
              onclick={() => ($openSettings = true)}
              tabindex={-1}
            >
              <Icon
                icon={$openSettings
                  ? "heroicons:cog-6-tooth-solid"
                  : "heroicons:cog-6-tooth"}
              />
              <span class="text-sm"> Settings </span>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  </Sidebar.Content>
  <Sidebar.Footer>
    <Sidebar.Trigger />
  </Sidebar.Footer>
  <Sidebar.Rail />
</Sidebar.Root>

<!-- <ul class="w-28 space-y-1 fixed m-1 pt-10">
  {#each items as item}
    <li>
      <button
        on:click={() => goto(item.path)}
        class="w-full flex items-center gap-2 rounded-lg px-4 py-1.5 text-gray-400 hover:bg-gray-900 hover:text-gray-200 duration-200 transition-[color, background-color] cursor-default"
        class:!bg-gray-800={page.url.pathname === item.path}
        class:!text-gray-200={page.url.pathname === item.path}
      >
        <Icon
          class="w-4 h-4"
          icon={page.url.pathname === item.path ? item.iconActive : item.icon}
        />
        <span class="text-sm font-bold"> {item.name} </span>
      </button>
    </li>
  {/each}
</ul> -->
