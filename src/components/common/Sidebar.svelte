<script>
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import Icon from "@iconify/svelte";
</script>

<ul class="w-28 space-y-1 fixed m-1">
  <li class="pt-10">
    <button
      on:click={() => goto("/home")}
      class="w-full flex items-center gap-2 rounded-lg px-4 py-1.5 text-gray-400 hover:bg-gray-900 hover:text-gray-200 duration-200 transition-[color, background-color] cursor-default"
      class:!bg-gray-800={page.url.pathname === "/home"}
      class:!text-gray-200={page.url.pathname === "/home"}
    >
      <Icon
        class="w-4 h-4"
        icon={page.url.pathname === "/home"
          ? "mingcute:search-3-fill"
          : "mingcute:search-3-line"}
      />
      <span class="text-sm font-bold"> Home </span>
    </button>
  </li>
  <li>
    <button
      on:click={() => goto("/favorites")}
      class="w-full flex items-center gap-2 rounded-lg px-4 py-1.5 text-gray-400 hover:bg-gray-900 hover:text-gray-200 duration-200 transition-[color, background-color] cursor-default"
      class:!bg-gray-800={page.url.pathname === "/favorites"}
      class:!text-gray-200={page.url.pathname === "/favorites"}
    >
      <div class="flex items-center gap-2">
        <Icon
          class="w-4 h-4"
          icon={page.url.pathname === "/favorites"
            ? "heroicons:star-solid"
            : "heroicons:star"}
        />
        <span class="text-sm font-bold"> Favorites </span>
      </div>
    </button>
  </li>
  <li>
    <button
      on:click={() => goto("/library")}
      class="w-full flex items-center gap-2 rounded-lg px-4 py-1.5 text-gray-400 hover:bg-gray-900 hover:text-gray-200 duration-200 transition-[color, background-color] cursor-default"
      class:!bg-gray-800={page.url.pathname === "/library"}
      class:!text-gray-200={page.url.pathname === "/library"}
    >
      <div class="flex items-center gap-2">
        <Icon
          class="w-4 h-4"
          icon={page.url.pathname === "/library"
            ? "solar:book-2-bold"
            : "solar:book-2-outline"}
        />
        <span class="text-sm font-bold"> Library </span>
      </div>
    </button>
  </li>

  <li>
    <button
      on:click={() => goto("/settings")}
      class="w-full flex items-center gap-2 rounded-lg px-4 py-1.5 text-gray-400 hover:bg-gray-900 hover:text-gray-200 duration-200 transition-[color, background-color] cursor-default"
      class:!bg-gray-800={page.url.pathname === "/settings"}
      class:!text-gray-200={page.url.pathname === "/settings"}
    >
      <Icon
        class="w-4 h-4"
        icon={page.url.pathname === "/settings"
          ? "heroicons:cog-6-tooth-solid"
          : "heroicons:cog-6-tooth"}
      />
      <span class="text-sm font-bold"> Settings </span>
    </button>
  </li>
</ul>
