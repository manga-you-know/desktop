<script lang="ts">
  import type { HTMLImgAttributes } from "svelte/elements";
  import { convertFileSrc } from "@tauri-apps/api/core";
  import { suwayomiUrl } from "@/states";

  const { src, ...props }: HTMLImgAttributes = $props();
</script>

<img
  class="select-none"
  src={src?.startsWith("/api/")
    ? suwayomiUrl.value + src
    : src?.startsWith("http") || src?.startsWith("data:image")
      ? src
      : convertFileSrc(src ?? "")}
  {...props}
  onloadstart={(e) => {
    const img = e.currentTarget as HTMLImageElement;
    img.src = "/myk_error.png";
  }}
  onerror={(e) => {
    const img = e.currentTarget as HTMLImageElement;
    img.src = "/myk_error.png";
  }}
  draggable={false}
/>
