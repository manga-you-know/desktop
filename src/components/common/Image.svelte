<script lang="ts">
  import type { HTMLImgAttributes } from "svelte/elements";
  const { ...props }: HTMLImgAttributes = $props();
</script>

<img
  {...props}
  onloadstart={(e) => {
    const img = e.currentTarget as HTMLImageElement;
    img.src = "/myk.png";
  }}
  onerror={(e) => {
    const img = e.currentTarget as HTMLImageElement;
    img.src = "/myk.png";
  }}
/>
