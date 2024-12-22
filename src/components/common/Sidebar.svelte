<script>
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import Icon from "@iconify/svelte";
</script>

<ul class="w-28 space-y-1 fixed m-1">
  <li class="pt-10">
    <button
      on:click={() => goto("/main/home")}
      class="w-full flex items-center gap-2 rounded-lg px-4 py-1.5 text-gray-400 hover:bg-gray-900 hover:text-gray-200 duration-200 transition-[color, background-color] cursor-default"
      class:!bg-gray-800={page.url.pathname === "/main/home"}
      class:!text-gray-200={page.url.pathname === "/main/home"}
    >
      <Icon
        class="w-4 h-4"
        icon={page.url.pathname === "/main/home"
          ? "mingcute:search-3-fill"
          : "mingcute:search-3-line"}
      />
      <span class="text-sm font-bold"> Home </span>
    </button>
  </li>
  <li>
    <button
      on:click={() => goto("/main/favorites")}
      class="w-full flex items-center gap-2 rounded-lg px-4 py-1.5 text-gray-400 hover:bg-gray-900 hover:text-gray-200 duration-200 transition-[color, background-color] cursor-default"
      class:!bg-gray-800={page.url.pathname === "/main/favorites"}
      class:!text-gray-200={page.url.pathname === "/main/favorites"}
    >
      <div class="flex items-center gap-2">
        <Icon
          class="w-4 h-4"
          icon={page.url.pathname === "/main/favorites"
            ? "heroicons:star-solid"
            : "heroicons:star"}
        />
        <span class="text-sm font-bold"> Favorites </span>
      </div>
    </button>
  </li>
  <li>
    <button
      on:click={() => goto("/main/library")}
      class="w-full flex items-center gap-2 rounded-lg px-4 py-1.5 text-gray-400 hover:bg-gray-900 hover:text-gray-200 duration-200 transition-[color, background-color] cursor-default"
      class:!bg-gray-800={page.url.pathname === "/main/library"}
      class:!text-gray-200={page.url.pathname === "/main/library"}
    >
      <div class="flex items-center gap-2">
        <Icon
          class="w-4 h-4"
          icon={page.url.pathname === "/main/library"
            ? "solar:book-2-bold"
            : "solar:book-2-outline"}
        />
        <span class="text-sm font-bold"> Library </span>
      </div>
    </button>
  </li>

  <li>
    <button
      on:click={() => goto("/main/settings")}
      class="w-full flex items-center gap-2 rounded-lg px-4 py-1.5 text-gray-400 hover:bg-gray-900 hover:text-gray-200 duration-200 transition-[color, background-color] cursor-default"
      class:!bg-gray-800={page.url.pathname === "/main/settings"}
      class:!text-gray-200={page.url.pathname === "/main/settings"}
    >
      <Icon
        class="w-4 h-4"
        icon={page.url.pathname === "/main/settings"
          ? "heroicons:cog-6-tooth-solid"
          : "heroicons:cog-6-tooth"}
      />
      <span class="text-sm font-bold"> Settings </span>
    </button>
  </li>
</ul>
