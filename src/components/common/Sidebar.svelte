<script>
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { Sidebar, Label, Avatar } from "@/lib/components";
  import { openSearch, openSettings, openAdd } from "@/store";
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

<Sidebar.Root
  class="pl-[2.5px] hover:bg-sidebar "
  variant="inset"
  collapsible="icon"
  onmouseenter={() => {}}
  onmouseleave={() => {}}
>
  <Sidebar.Header></Sidebar.Header>
  <Sidebar.Content class="!overflow-hidden">
    <Sidebar.Group>
      <!-- <Sidebar.GroupLabel>pages</Sidebar.GroupLabel> -->
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {#each items as item (item.name)}
            <Sidebar.MenuItem class="!min-w-16">
              <Sidebar.MenuButton
                onclick={(e) => {
                  e.currentTarget.blur();
                  goto(item.path);
                }}
                tabindex={-1}
              >
                <Icon
                  icon={page.url.pathname === item.path
                    ? item.iconActive
                    : item.icon}
                  class="!w-5 !h-5 ml-[-2px]"
                />
                <Label>{item.name}</Label>
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
              onclick={(e) => {
                e.currentTarget.blur();
                $openSearch = true;
                $openSettings = false;
                $openAdd = false;
              }}
              tabindex={-1}
            >
              <Icon
                icon={$openSearch
                  ? "mingcute:search-fill"
                  : "mingcute:search-line"}
                class="!w-5 !h-5 ml-[-2px]"
              />
              <Label>Search</Label>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton
              onclick={(e) => {
                e.currentTarget.blur();
                $openSettings = true;
              }}
              tabindex={-1}
            >
              <Icon
                icon={$openSettings
                  ? "heroicons:cog-6-tooth-solid"
                  : "heroicons:cog-6-tooth"}
                class="!w-5 !h-5 ml-[-2px]"
              />
              <Label>Settings</Label>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
          <Sidebar.MenuItem class="hidden">
            <Sidebar.MenuButton
              onclick={(e) => {
                e.currentTarget.blur();
                $openAdd = true;
              }}
              tabindex={-1}
            >
              <Icon
                icon={$openAdd ? "typcn:plus" : "typcn:plus-outline"}
                class="!w-5 !h-5 ml-[-2px] "
              />
              <Label>Add</Label>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  </Sidebar.Content>
  <Sidebar.Footer class="flex items-center ">
    <!-- <Avatar  src="/icon.png" fallbackText="MYK" /> -->
    <img class="w-16 min-w-10 ml-[8px]" src="/icon.png" alt="icon" />
  </Sidebar.Footer>
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
