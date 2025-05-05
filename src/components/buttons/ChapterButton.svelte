<script lang="ts">
  import Icon from "@iconify/svelte";
  import { Tooltip } from "svelte-ux";
  import { Button } from "@/lib/components";
  import type { Chapter } from "@/interfaces";

  interface Event {
    stopPropagation: () => void;
  }

  interface Props {
    chapter: Chapter;
    isDownloaded: boolean;
    isDownloading: { [key: string]: boolean };
    isReaded: boolean;
    onclick?: () => void;
    ondownloadclick?: (e: Event) => void;
    onreadclick?: (e: Event) => void;
  }

  let {
    chapter,
    isDownloaded = $bindable(false),
    isDownloading = $bindable({ chapter_id: false }),
    isReaded = $bindable(false),
    onclick,
    ondownloadclick,
    onreadclick,
  }: Props = $props();
</script>

<Button
  class="chapter-button w-full flex justify-between items-center rounded-md group hover:bg-gray-900"
  variant="secondary"
  size="sm"
  bind:onclick
>
  <div class="flex items-center gap-2">
    <Tooltip
      title={isDownloading[chapter.chapter_id]
        ? "Downloading..."
        : isDownloaded
          ? "Open folder"
          : "Download"}
    >
      <Button
        class="h-7 w-7 "
        variant="ghost"
        size="sm"
        tabindex={-1}
        disabled={isDownloading[chapter.chapter_id] && !isDownloaded}
        bind:onclick={ondownloadclick}
        ><Icon
          icon={isDownloading[chapter.chapter_id] && !isDownloaded
            ? "line-md:loading-twotone-loop"
            : isDownloaded
              ? "lucide:folder-check"
              : "lucide:download"}
          class="w-5 h-5"
        />
      </Button>
    </Tooltip>
    <span
      class="group-hover:underline group-hover:underline-offset-4 truncate w-24 text-start"
    >
      {chapter.number}
    </span>
  </div>
  <Button
    class="h-7 w-7 "
    variant="ghost"
    size="sm"
    tabindex={-1}
    bind:onclick={onreadclick}
  >
    <Icon icon={isReaded ? "lucide:check" : "lucide:minus"} class="w-5 h-5" />
  </Button>
</Button>
