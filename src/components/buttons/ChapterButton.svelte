<script lang="ts">
  import Icon from "@iconify/svelte";
  import { Tooltip } from "svelte-ux";
  import { Button } from "@/lib/components";
  import type { Chapter } from "@/types";
  import { cn } from "@/lib/utils";

  interface Event {
    stopPropagation: () => void;
  }

  interface Props {
    chapter: Chapter;
    isDownloaded: boolean;
    isDownloading: boolean;
    isReaded: boolean;
    noDownload?: boolean;
    onclick?: () => void;
    ondownloadclick?: (e: Event) => void;
    onreadclick?: (e: Event) => void;
  }

  let {
    chapter,
    isDownloaded = $bindable(false),
    isReaded = $bindable(false),
    isDownloading = false,
    onclick,
    ondownloadclick,
    onreadclick,
  }: Props = $props();
</script>

<Button
  class={cn(
    "chapter-button w-full flex justify-between items-center rounded-xl group transition-all duration-500 hover:bg-gray-200 hover:opacity-100 dark:hover:bg-background/70",
    isReaded && "opacity-60"
  )}
  variant="secondary"
  size="sm"
  bind:onclick
>
  <div class="flex items-center gap-2">
    <Tooltip
      title={isDownloading
        ? "Downloading..."
        : isDownloaded
          ? "Open folder"
          : "Download"}
    >
      <Button
        class="h-7 w-7"
        variant="ghost"
        size="sm"
        tabindex={-1}
        disabled={isDownloading && !isDownloaded}
        bind:onclick={ondownloadclick}
        ><Icon
          icon={isDownloading && !isDownloaded
            ? "line-md:loading-alt-loop"
            : isDownloaded
              ? "lucide:folder-check"
              : "lucide:download"}
        />
      </Button>
    </Tooltip>
    <div class="flex items-center gap-2">
      <span
        class="group-hover:underline group-hover:underline-offset-4 truncate w-9 text-start"
      >
        {chapter.number}
      </span>
      <Tooltip title={chapter?.title}>
        <span
          class="group-hover:underline group-hover:underline-offset-4 truncate w-20 text-start"
        >
          {chapter?.title}
        </span>
      </Tooltip>
    </div>
  </div>
  <Tooltip title={isReaded ? "Remove readed" : "Mark as read"}>
    <Button
      class="h-7 w-7 "
      variant="ghost"
      size="sm"
      tabindex={-1}
      bind:onclick={onreadclick}
    >
      <Icon icon={isReaded ? "lucide:check" : "lucide:minus"} class="size-5" />
    </Button>
  </Tooltip>
</Button>
