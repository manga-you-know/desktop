<script lang="ts">
  import { goto } from "$app/navigation";
  import { lastPage } from "@/store";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { onMount } from "svelte";

  const window = getCurrentWindow();
  onMount(() => {
    console.log("is this stupid ass code running?");
    goto("browse");
    /* if (window.label === "main") {
    } else {
      goto("/notificator");
    } */
  });
</script>
