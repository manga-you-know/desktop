<script lang="ts">
  import { goto } from "$app/navigation";
  import { lastPage } from "@/store";
  import { getCurrentWindow, Effect } from "@tauri-apps/api/window";
  import { onMount } from "svelte";

  const window = getCurrentWindow();
  onMount(() => {
    if (window.label === "main") {
      goto($lastPage);
    } else {
      goto("/notificator");
    }
  });
</script>
