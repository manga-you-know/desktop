<script>
  import "../app.css";
  import { ModeWatcher } from "mode-watcher";
  let { children } = $props();
</script>

<ModeWatcher defaultMode="dark" />
{@render children?.()}
