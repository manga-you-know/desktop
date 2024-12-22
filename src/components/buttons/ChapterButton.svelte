<script lang="ts">
  import Icon from "@iconify/svelte";
  import { Button } from "@/lib/components";
  import type { Chapter } from "@/models";

  interface Event {
    stopPropagation: () => void;
  }

  interface Props {
    chapter: Chapter;
    isDownloaded: boolean;
    isReaded: boolean;
    onclick?: () => void;
    ondownloadclick?: (e: Event) => void;
    onreadclick?: (e: Event) => void;
  }

  let {
    chapter,
    isDownloaded = $bindable(false),
    isReaded = $bindable(false),
    onclick,
    ondownloadclick,
    onreadclick,
  }: Props = $props();
</script>

<Button
  class="w-full flex justify-between items-center rounded-md group"
  variant="ghost"
  effect="gooeyLeft"
  size="sm"
  bind:onclick
>
  <span class="group-hover:underline group-hover:underline-offset-4"
    >{chapter.number}</span
  >
  <div>
    <Button
      class="h-7 w-7 hover:!bg-accent hover:!text-accent-foreground group-hover:bg-transparent"
      variant="ghost"
      effect="shineHover"
      size="sm"
      bind:onclick={ondownloadclick}
      ><Icon
        icon={isDownloaded
          ? "lucide:square-arrow-out-up-right"
          : "lucide:download"}
        class="w-4 h-4"
      />
    </Button>
    <Button
      class="h-7 w-7 hover:!bg-accent hover:!text-accent-foreground group-hover:bg-transparent"
      variant="ghost"
      effect="shineHover"
      size="sm"
      bind:onclick={onreadclick}
      ><Icon
        icon={isReaded ? "lucide:check" : "lucide:minus"}
        class="w-4 h-4"
      />
    </Button>
  </div>
</Button>
