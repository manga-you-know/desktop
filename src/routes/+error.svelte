<script lang="ts">
  import { goto } from "$app/navigation";
  import { lastPage } from "@/store";
  import { onMount } from "svelte";

  onMount(() => {
    goto($lastPage);
  });
</script>
