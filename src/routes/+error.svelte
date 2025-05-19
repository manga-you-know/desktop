<script lang="ts">
  import { goto } from "$app/navigation";
  import { lastPage } from "@/store";
  import { onMount } from "svelte";

  onMount(() => {
    console.log("debug super fucking especifico");
    goto($lastPage);
  });
</script>
