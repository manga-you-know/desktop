<script lang="ts">
  import { saveSettings } from "@/functions";
  import { Button, Label, Switch } from "@/lib/components";
  import { theme } from "@/store";
  import Icon from "@iconify/svelte";
  import { onMount } from "svelte";

  let isDark = $state(true);
  onMount(() => {
    isDark = $theme === "dark";
  });
</script>

<div class="inline-flex items-center justify-start gap-2">
  <Icon
    class="size-5! cursor-pointer"
    onclick={() => {
      isDark = false;
      $theme = "light";
      saveSettings();
    }}
    icon={!isDark
      ? "material-symbols:sunny-rounded"
      : "material-symbols:sunny-outline-rounded"}
  />
  <Switch
    bind:checked={isDark}
    onCheckedChange={async (value) => {
      $theme = value ? "dark" : "light";
      await saveSettings();
    }}
  />
  <Icon
    class="size-5! cursor-pointer"
    onclick={() => {
      isDark = true;
      $theme = "dark";
      saveSettings();
    }}
    icon={isDark
      ? "material-symbols:dark-mode"
      : "material-symbols:dark-mode-outline"}
  />
</div>

<!-- <RadioGroup.Root
  bind:value={$theme}
  class="flex"
  onValueChange={async () => {
    await saveSettings();
  }}
>
  <div class="flex items-center space-x-2">
    <RadioGroup.Item value="dark" id="dark" />
    <Label for="dark">Dark</Label>
  </div>
  <div class="flex items-center space-x-2">
    <RadioGroup.Item value="light" id="light" />
    <Label for="light">Light</Label>
  </div>
</RadioGroup.Root> -->
