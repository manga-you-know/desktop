<script lang="ts">
  import { saveSettings } from "@/functions";
  import { RadioGroup, Label } from "@/lib/components";
  import { theme } from "@/store";
</script>

<RadioGroup.Root
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
</RadioGroup.Root>
