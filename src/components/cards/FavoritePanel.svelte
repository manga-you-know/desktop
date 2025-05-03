<script lang="ts">
  import { Tilt } from 'svelte-ux';
  import { PanelModal } from "@/components";

  let { src, path } = $props();
  let open = $state(false);
</script>

<PanelModal bind:open {src} {path} />

<Tilt class="hover:scale-[1.2] no-blurry transition duration-500 [perspective:200px]">
  <button
    onclick={() => (open = true)}
  >
    <img class="!max-w-[11rem] h-[11rem] object-contain" {src} alt="favorite panel" />
  </button>
</Tilt>
