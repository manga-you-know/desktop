<script lang="ts">
  import { Tilt } from "svelte-ux";
  import { PanelModal } from "@/components";

  let { src, path, shouldCopy = $bindable(false) } = $props();
  let open = $state(false);
</script>

<PanelModal bind:open bind:shouldCopy {src} {path} />

<Tilt
  class="hover:scale-[1.546] hover:z-10 no-blurry transition duration-500 [perspective:200px]"
>
  <button
    onclick={() => (open = true)}
    onmouseenter={() => (shouldCopy = true)}
    onmouseleave={() => (shouldCopy = false)}
  >
    <img
      class="!max-w-[16rem] h-[11rem] object-contain"
      {src}
      alt="favorite panel"
    />
  </button>
</Tilt>
