<script lang="ts">
  import { PanelModal } from "@/components";

  let { src } = $props();
  let open = $state(false);
</script>

<PanelModal bind:open {src} />

<button
  class="p-2 hover:scale-[1.12] transition-* duration-200 ease-in-out"
  onclick={() => (open = true)}
>
  <img class="!max-w-36 h-36 object-contain" {src} alt="favorite panel" />
</button>
