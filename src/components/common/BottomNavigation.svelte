<script>
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { Button, Label, Sidebar } from "@/lib/components";
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

<div class="flex">
  {#each items as item}
    <Button
      class="flex-1 h-24 first:rounded-tl-[3rem]"
      variant="secondary"
      onclick={() => goto(item.path)}
    >
      <Icon
        class="!w-8 !h-8"
        icon={page.url.pathname === item.path ? item.iconActive : item.icon}
      />
    </Button>
  {/each}
  <Button
    class="flex-1 h-24"
    variant="secondary"
    onclick={() => ($openSearch = true)}
  >
    <Icon
      class="!w-8 !h-8"
      icon={$openSearch ? "mingcute:search-fill" : "mingcute:search-line"}
    />
  </Button>
  <Button
    class="flex-1 h-24 rounded-tr-[3rem]"
    variant="secondary"
    onclick={() => ($openSettings = true)}
  >
    <Icon
      class="!w-8 !h-8"
      icon={$openSettings
        ? "heroicons:cog-6-tooth-solid"
        : "heroicons:cog-6-tooth"}
    />
  </Button>
</div>
