<script lang="ts">
  import { Button } from "@/lib/components";

  let selectedType = $state("manga");
</script>

<div class="flex items-center">
  <Button
    class="rounded-r-none"
    variant={selectedType === "manga" ? "elevated" : "elevatedHover"}
    onclick={() => (selectedType = "manga")}
  >
    Manga
  </Button>
  <Button
    class="rounded-none -mx-[0.5px]"
    variant={selectedType === "anime" ? "elevated" : "elevatedHover"}
    onclick={() => (selectedType = "anime")}
  >
    Anime
  </Button>
  <Button
    class="rounded-l-none"
    disabled
    variant={selectedType === "novel" ? "elevated" : "elevatedHover"}
    onclick={() => (selectedType = "novel")}
  >
    Novel
  </Button>
</div>
