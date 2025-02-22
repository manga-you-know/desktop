<script>
  import { AvatarRoot, AvatarImage, AvatarFallback } from ".";

  let { src, fallbackText } = $props();
</script>

<AvatarRoot>
  <AvatarImage {src} />
  <AvatarFallback>
    {fallbackText}
  </AvatarFallback>
</AvatarRoot>
