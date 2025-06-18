<script lang="ts">
  import { Carousel, SuggestionCard } from "@/components";
  import { Button, Label } from "@/lib/components";
  import { Item } from "@/lib/components/ui/carousel";
  import { SHOUNENS, SEINEN } from "@/constants";
  import type { Favorite } from "@/types";
  import { FavoriteDB } from "@/repositories";
  import { openSearch } from "@/store";
</script>

<link href="https://fonts.cdnfonts.com/css/minecraftia" rel="stylesheet" />

<div
  class="scrollbar w-[99.2%] h-full flex flex-col items-center overflow-x-hidden overflow-y-auto"
>
  <div
    class="w-full h-full flex justify-center flex-col-reverse sm:flex-row items-center pt-[30px] gap-10 md:mr-20"
  >
    <div
      class="h-full sm:mt-12 flex flex-col justify-center items-center gap-2"
    >
      <span class="font-[minecraftia] text-xl text-[#88105a]">
        Welcome to MangaYouKnow!
      </span>
      <p class="flex flex-wrap mt-2 font-[Minecraft] text-sm dark:text-white">
        MangaYouKnow is a manga reader <br />that allows you to read mangas
        <br />
        on your computer through your<br /> favorite sites.
      </p>
    </div>
    <img
      src="/icon.png"
      alt="MangaYouKnow logo"
      class="w-40 h-40 rounded-[2rem] mt-10 logo-shadow"
    />
  </div>
  <div class="w-full h-full mt-12">
    <Label class="text-bold text-2xl pl-4">Shounen</Label>
    <Carousel speed={1.2}>
      {#each Array(20).fill(SHOUNENS.flat()).flat() as suggestion}
        <Item class="max-w-44 w-44">
          <SuggestionCard {suggestion} />
        </Item>
      {/each}
    </Carousel>
    <Label class="text-bold text-2xl pl-4">Seinen</Label>
    <Carousel reversed={true} speed={1.2}>
      {#each Array(20).fill(SEINEN.flat()).flat() as suggestion}
        <Item class="max-w-44 w-44">
          <SuggestionCard {suggestion} />
        </Item>
      {/each}
    </Carousel>
  </div>
</div>
