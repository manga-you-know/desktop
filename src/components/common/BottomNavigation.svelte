<script>
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { Button, Label, Sidebar } from "@/lib/components";
  import { useSidebar } from "@/lib/components/ui/sidebar";
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
      iconActive: "material-symbols:book-ribbon-rounded",
      icon: "material-symbols:book-ribbon-outline-rounded",
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

  const sidebar = useSidebar();
</script>

<div class="flex">
  {#each items as item}
    <Button
      class="flex-1 h-24 rounded-none"
      variant="secondary"
      onclick={(e) => {
        e.currentTarget.blur();
        goto(item.path);
      }}
    >
      <Icon
        class="!size-8"
        icon={page.url.pathname === item.path ? item.iconActive : item.icon}
      />
    </Button>
  {/each}
  <Button
    class="flex-1 h-24 rounded-none"
    variant="secondary"
    onclick={(e) => {
      e.currentTarget.blur();
      $openSearch = true;
    }}
  >
    <Icon
      class="!size-8"
      icon={$openSearch ? "mingcute:search-3-fill" : "mingcute:search-3-line"}
    />
  </Button>
  <Button
    class="flex-1 h-24 rounded-none"
    variant="secondary"
    onclick={(e) => {
      e.currentTarget.blur();
      sidebar.toggle();
    }}
  >
    <Icon class="!size-8" icon="lucide:menu" />
  </Button>
</div>
