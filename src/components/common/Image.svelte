<script lang="ts">
  import type { HTMLImgAttributes } from "svelte/elements";
  import { convertFileSrc } from "@tauri-apps/api/core";
  import { loadBlobUrl } from "$lib/imageCache";

  const LOADING = "/loading.gif";
  const ERROR = "/icon.png";

  const { src, ...props }: HTMLImgAttributes = $props();

  let resolved = $state(LOADING);

  $effect(() => {
    const url = src ?? "";

    if (!url) {
      resolved = ERROR;
      return;
    }
    // console.log(url);
    if (url.startsWith("data:image") || url.startsWith("blob:")) {
      resolved = url;
      return;
    }
    if (!url.startsWith("http")) {
      resolved = convertFileSrc(url);
      return;
    }

    let cancelled = false;
    resolved = LOADING;
    loadBlobUrl(url)
      .then((u) => !cancelled && (resolved = u))
      .catch(() => !cancelled && (resolved = ERROR));

    return () => {
      cancelled = true;
    };
  });
</script>

<img
  class="select-none"
  {...props}
  src={resolved}
  onerror={() => {
    if (resolved !== ERROR) resolved = ERROR;
  }}
/>
