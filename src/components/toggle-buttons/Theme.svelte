<script lang="ts">
  import { Switch } from "@/lib/components";
  import { themeMode } from "@/states";
  import Icon from "@iconify/svelte";
</script>

<div class="inline-flex items-center justify-start gap-2">
  <Icon
    class="size-5! cursor-pointer"
    onclick={() => {
      themeMode.value = "light";
    }}
    icon={themeMode.value === "light"
      ? "material-symbols:sunny-rounded"
      : "material-symbols:sunny-outline-rounded"}
  />
  <Switch
    checked={themeMode.value === "dark"}
    onCheckedChange={themeMode.toggle}
  />
  <Icon
    class="size-5! cursor-pointer"
    onclick={() => {
      themeMode.value = "dark";
    }}
    icon={themeMode.value === "dark"
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
