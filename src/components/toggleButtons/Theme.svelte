<script lang="ts">
  import { saveSettings } from "@/functions";
  import { Button, Label } from "@/lib/components";
  import { theme } from "@/store";
</script>

<div class="flex justify-start gap-0.5">
  <Button
    variant="outline"
    class={$theme === "dark" ? "border-2  border-slate-300" : "gooeyRight"}
    onclick={async () => {
      $theme = "dark";
      await saveSettings();
    }}>Dark</Button
  >
  <Button
    variant="outline"
    class={$theme === "light" ? "border-2  border-slate-800" : "gooeyLeft"}
    onclick={async () => {
      $theme = "light";
      await saveSettings();
    }}>Light</Button
  >
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
