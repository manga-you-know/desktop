<script lang="ts">
  import { Carousel } from "@/lib/components";
  import Autoplay from "embla-carousel-auto-scroll";

  interface Props {
    reversed?: boolean;
    loop?: boolean;
    duration?: number;
    centerMode?: boolean;
    speed?: number;
    startDelay?: number;
  }
  let {
    reversed = false,
    loop = true,
    withMargin = true,
    speed = 2,
    startDelay = 0,
    children,
  } = $props();
</script>

<Carousel.Root
  class="w-screen"
  opts={{ loop }}
  plugins={[
    Autoplay({
      speed,
      startDelay,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
      direction: reversed ? "backward" : "forward",
    }),
  ]}
>
  <Carousel.Content>
    {@render children?.()}
  </Carousel.Content>
</Carousel.Root>
