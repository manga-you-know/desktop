<script lang="ts">
  import { Button, Dialog, Input } from "@/lib/components";
  import { suwaManager } from "@/lib/helpers";
  import { suwayomi } from "@/states";
  import { delay } from "@/utils";
  import Icon from "@iconify/svelte";
  import { readText } from "@tauri-apps/plugin-clipboard-manager";

  let { open = $bindable(false) } = $props();

  let input = $state("");
  let status: "idle" | "loading" | "success" | "error" = $state("idle");

  const statusIcon: Record<string, string> = {
    idle: "lucide:plus",
    loading: "line-md:loading-alt-loop",
    success: "lucide:check",
    error: "lucide:plus",
  };

  const setRepo = async () => {
    if (suwayomi.extensionRepos.includes(input.trim())) {
      return;
    }
    suwayomi.extensionRepos.push(input.trim());
    status = "loading";
    const added = await suwaManager.setRepos();
    if (added) {
      status = "success";
      delay(300).then(() => {
        open = false;
        status = "idle";
        input = "";
      });
    } else {
      suwayomi.extensionRepos = suwayomi.extensionRepos.filter(
        (repo) => repo != input,
      );
      status = "error";
    }
  };
</script>

<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Add extension repository</Dialog.Title>
      <Dialog.Description>
        Having problems finding a repo? Just search "Mihon extensions" :)
      </Dialog.Description>
    </Dialog.Header>
    <div class="flex gap-1">
      <Input
        class="w-full rounded-r-none"
        divClass="w-full"
        variant={status === "error" ||
        suwayomi.extensionRepos.includes(input.trim())
          ? "destructive"
          : "outline"}
        placeholder="https://github.com/USER/REPO"
        disabled={status === "loading" || status === "success"}
        oninput={() => (status = "idle")}
        bind:value={input}
      />
      <Button
        class="h-10 rounded-none"
        variant="secondary"
        onclick={async () => {
          const text = await readText();
          if (text) {
            input = text;
            setRepo();
          }
        }}
      >
        <Icon icon="lucide:clipboard-paste" />
      </Button>
      <Button
        class="h-10 rounded-l-none rounded-r-xl"
        effect="ringHover"
        disabled={input.trim() === "" ||
          suwayomi.extensionRepos.includes(input.trim())}
        onclick={setRepo}
      >
        <Icon icon={statusIcon[status]} />
      </Button>
    </div>
  </Dialog.Content>
</Dialog.Root>
