<script lang="ts">
  import "vidstack/icons";
  import "vidstack/player";
  import "vidstack/player/ui";
  import "vidstack/player/layouts";
  import { fetch } from "@tauri-apps/plugin-http";
  import {
    defineCustomElements,
    // // MediaPlayerElement,
    // MediaTimeElement,
    // MediaCaptionsRadioGroupElement,
  } from "vidstack/elements";
  import { goto, onNavigate, afterNavigate } from "$app/navigation";
  import { onDestroy, onMount } from "svelte";
  import { page } from "$app/state";
  import {
    autoEnterFullscreen,
    downloadManager,
    globalChapters,
    isFullscreen,
    readeds,
  } from "@/store";
  import type { Episode, Favorite } from "@/types";
  import { FavoriteDB, ReadedDB } from "@/repositories";
  import {
    addReadedBelow,
    goDefaultPage,
    loadFavoriteChapters,
    setFullscreen,
    toggleFullscreen,
  } from "@/functions";
  import Icon from "@iconify/svelte";
  import { Button, Label } from "@/lib/components";
  import {
    // isHLSProvider,
    // type MediaProviderAdapter,
    type MediaProviderChangeEvent,
  } from "vidstack";

  let { favoriteId, chapterIndex } = page.params;
  // // let player: MediaPlayerElement;
  // defineCustomElement(MediaTimeElement);
  // defineCustomElement(MediaCaptionsRadioGroupElement);
  let isTheFirstChapter = $state(
    Number(chapterIndex) === $globalChapters.length - 1,
  );
  let isTheLastChapter = $state(Number(chapterIndex) === 0);
  let chapter = $state($globalChapters[Number(chapterIndex)]);
  let favorite: Favorite | null = $state(null);
  let episode: Episode | null = $state(null);
  let currentSrc = $state("");
  let showControls = $state(false);
  let volumeIcon = $state("lucide:volume-2");
  let playIcon = $state("lucide:play");

  afterNavigate(async () => {
    favoriteId = page.params.favoriteId;
    chapterIndex = page.params.chapterIndex;
    isTheFirstChapter = Number(chapterIndex) === $globalChapters.length - 1;
    isTheLastChapter = Number(chapterIndex) === 0;
    chapter = $globalChapters[Number(chapterIndex)];
    favorite = await FavoriteDB.getFavorite(Number(favoriteId));
    const chapterEpisode = await $downloadManager.getEpisodeContent(chapter);
    episode = chapterEpisode;
    currentSrc = episode.url;
    await addReadedBelow(chapter, $globalChapters, favorite, $readeds, true);
    const newReadeds = await ReadedDB.getReadeds(favorite);
    readeds.set(newReadeds);
  });
  function handleGoChapter(way: "next" | "prev") {
    goto(
      `/player/${favoriteId}/${Number(chapterIndex) + (way === "next" ? -1 : 1)}`,
    );
  }
  onMount(async () => {
    // player.enterFullscreen();
    // player.addEventListener("provider-change", (event) => {
    //   const provider = event.detail;
    //   if (provider?.type === "hls") {
    //     // @ts-ignore
    //     provider.config = {
    //       xhrSetup(xhr: XMLHttpRequest) {
    //         xhr.withCredentials = false;
    //         xhr.setRequestHeader(
    //           "User-Agent",
    //           "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36"
    //         );
    //       },
    //     };
    //   }
    // });
    // player.subscribe(({ volume }) => {
    //   volumeIcon =
    //     volume > 0.5
    //       ? "lucide:volume-2"
    //       : volume === 0
    //         ? "lucide:volume-x"
    //         : "lucide:volume-1";
    // });
    // player.subscribe(({ playing }) => {
    //   playIcon = playing ? "lucide:pause" : "lucide:play";
    // });
    if ($autoEnterFullscreen) {
      await setFullscreen(true);
    }
    favorite = await FavoriteDB.getFavorite(Number(favoriteId));
    const chapterEpisode = await $downloadManager.getEpisodeContent(chapter);
    episode = chapterEpisode;
    currentSrc = episode.url;
    await addReadedBelow(chapter, $globalChapters, favorite, $readeds, true);
    const newReadeds = await ReadedDB.getReadeds(favorite);
    readeds.set(newReadeds);
  });
</script>

<div
  class="dark:bg-background w-screen h-screen max-w-screen max-h-screen flex items-center overflow-hidden"
>
  <!-- bind:this={player} -->
  <media-player class="flex flex-col items-center" src={currentSrc} autoplay>
    <media-provider>
      <media-poster
        class="vds-poster"
        src={chapter?.thumbnail ?? "/myk.png"}
        alt={chapter?.title ?? "Default Poster"}
      ></media-poster>
      <media-captions class="vds-captions"></media-captions>
      {#if episode?.subtitles}
        {#each episode.subtitles as subtitle, i}
          <track
            kind="subtitles"
            src={subtitle.file}
            label={subtitle?.label}
            default={i === 0}
          />
        {/each}
      {/if}
      <media-controls class="vds-controls">
        <media-controls-group class="vds-controls-group"></media-controls-group>
        <div class="vds-controls-spacer"></div>
        <!-- <media-controls-group class="vds-controls-group"
          >Center Controls Group</media-controls-group
        > -->
        <div class="vds-controls-spacer"></div>
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <media-controls-group
          class="vds-controls-group w-full flex-col p-4 bg-background bg-opacity-50 flex
          {showControls ? '' : 'opacity-0'}"
          onmouseenter={() => {
            showControls = true;
          }}
          onmouseleave={() => {
            showControls = false;
          }}
        >
          <div class="flex flex-col">
            <div class="flex justify-between">
              <div class="flex gap-10">
                <Label class="text-lg ">
                  <span class="text-gray-400">
                    {chapter?.number} -
                  </span>
                  {chapter?.title ?? ""}
                </Label>
                <div class="flex">
                  <Button
                    class="vds-button"
                    variant="ghost"
                    size="sm"
                    disabled={isTheFirstChapter}
                    onclick={() => handleGoChapter("prev")}
                  >
                    <Icon icon="lucide:arrow-left" class="w-4 h-4" />
                  </Button>
                  <Button
                    class="vds-button"
                    variant="ghost"
                    size="sm"
                    disabled={isTheLastChapter}
                    onclick={() => handleGoChapter("next")}
                  >
                    <Icon icon="lucide:arrow-right" class="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Label class="text-lg text-gray-300 truncate">
                {favorite?.name}
              </Label>
            </div>
            <div class="flex justify-between">
              <div class="flex">
                <media-play-button class="vds-button mx-2">
                  <Icon icon={playIcon} class="w-5 h-5" />
                </media-play-button>
                <div class="vds-time-group">
                  <media-time class="vds-time" type="current"></media-time>
                  <div class="vds-time-divider">/</div>
                  <media-time class="vds-time" type="duration"></media-time>
                </div>
                <Button
                  variant="ghost"
                  class="vds-button w-24 ml-2 p-2 flex justify-center "
                >
                  <Icon icon={volumeIcon} class="w-5 h-5 ml-2" />
                  <media-volume-slider class="vds-slider">
                    <div class="vds-slider-track"></div>
                    <div class="vds-slider-track-fill vds-slider-track"></div>
                    <div class="vds-slider-thumb"></div>
                  </media-volume-slider>
                </Button>
              </div>
              <div class="w-full mx-8 flex justify-center">
                <media-time-slider class="vds-time-slider vds-slider h-10">
                  <div class="vds-slider-track p-3"></div>
                  <div class="vds-slider-track-fill vds-slider-track"></div>
                  <div class="vds-slider-progress vds-slider-track p-3"></div>
                  <div class="vds-slider-thumb py-3 px-1 rounded-sm"></div>
                </media-time-slider>
              </div>
              <div class="flex">
                <media-menu class="vds-menu">
                  <media-menu-button
                    class="vds-menu-button vds-button"
                    aria-label="Settings"
                  >
                    <media-icon
                      type="subtitles"
                      class="vds-rotate-icon vds-icon"
                    ></media-icon>
                  </media-menu-button>
                  <media-menu-items class="vds-menu-items" placement="top">
                    <media-captions-radio-group
                      class="vds-captions-radio-group"
                    >
                      <template>
                        <media-radio class="vds-radio w-20">
                          <span data-part="label"></span>
                        </media-radio>
                      </template>
                    </media-captions-radio-group>
                  </media-menu-items>
                </media-menu>
                <Button
                  class="vds-button"
                  variant="ghost"
                  onclick={() => {
                    if (favorite) loadFavoriteChapters(favorite);
                    goDefaultPage();
                  }}
                >
                  <Icon icon="lucide:home" />
                </Button>
                <Button
                  class="vds-button"
                  variant="ghost"
                  onclick={async () => {
                    await toggleFullscreen();
                  }}
                >
                  <Icon
                    icon={$isFullscreen ? "lucide:minimize" : "lucide:maximize"}
                  />
                </Button>
              </div>
            </div>
          </div>
        </media-controls-group>
      </media-controls>
    </media-provider>
  </media-player>
</div>
