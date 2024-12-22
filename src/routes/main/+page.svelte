<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  onMount(() => {
    goto("/main/home");
  });
</script>
