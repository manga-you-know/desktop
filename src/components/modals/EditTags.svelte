<script lang="ts">
  import Icon from "@iconify/svelte";
  import { open as openPath } from "@tauri-apps/plugin-shell";
  import { AlertDialog, Button, Input, ScrollArea } from "@/lib/components";
  import { openTag, tags } from "@/store";
  import { refreshTags } from "@/functions";
  import { MarkDB } from "@/repositories";
  import type { Mark } from "@/types";
  import { toast } from "svelte-sonner";

  openTag.subscribe(() => {
    refreshTags();
  });

  function focusInput(id: number) {
    const input = document.querySelector(
      `input[id="${id}"]`
    ) as HTMLInputElement;
    input?.focus();
  }

  async function addTag() {
    if (
      newTag === "" ||
      $tags
        .map((cl) => cl.name.toLowerCase())
        .includes(newTag.toLowerCase().trim())
    )
      return;

    await MarkDB.addMark(newTag.trim());
    await refreshTags();
    toast.success(`Tag ${newTag.trim()} added`);
    newTag = "";
  }

  async function updateTag(tag: Mark) {
    editing = null;
    if (
      tag.name !== "" &&
      !$tags
        .filter((cl) => cl.id !== tag.id)
        .map((cl) => cl.name.toLowerCase())
        .includes(tag.name.toLowerCase().trim())
    ) {
      await MarkDB.updateMark(tag);
    }
    await refreshTags();
  }

  let editing: number | null = $state(null);
  let newTag: string = $state("");
  let openDelete = $state(false);
</script>

<AlertDialog.Root bind:open={$openTag}>
  <AlertDialog.Content class="w-104 px-2">
    <div class="w-104 flex flex-col items-center gap-2">
      <div class="inline-flex gap-2">
        <Input
          class="w-80 -ml-[12px]"
          variant="secondary"
          placeholder="Create tag..."
          floatingLabel
          disabled={editing !== null}
          bind:value={newTag}
          onenter={addTag}
        />
        <Button
          class="w-10"
          variant="secondary"
          disabled={editing !== null}
          onclick={addTag}
        >
          <Icon class="w-5! h-5!" icon="lucide:plus" />
        </Button>
      </div>
      <ScrollArea class="h-80 p-0 rounded-xl">
        <div class="flex flex-col gap-1 justify-center pr-3">
          {#each $tags.reverse() as tag, i (i)}
            <div class="inline-flex">
              <Input
                id={tag.id.toString()}
                class="rounded-r-none w-68"
                variant="secondary"
                bind:value={tag.name}
                readonly={tag.id !== editing}
                autofocus
                disabled={editing !== null && tag.id !== editing}
                onenter={() => updateTag(tag)}
              />
              <Button
                class="rounded-none"
                onclick={() => {
                  if (editing === null) {
                    editing = tag.id;
                    focusInput(tag.id);
                  } else {
                    updateTag(tag);
                  }
                }}
                disabled={editing !== null && tag.id !== editing}
              >
                <Icon
                  icon={editing === tag.id ? "ion:checkmark-round" : "ion:edit"}
                />
              </Button>
              <Button
                class="rounded-l-none"
                variant="destructive"
                onclick={() => {
                  editing = tag.id;
                  openDelete = true;
                }}
                disabled={editing !== null && tag.id !== editing}
              >
                <Icon icon="lucide:trash" />
              </Button>
            </div>
          {/each}
        </div>
      </ScrollArea>
    </div>
  </AlertDialog.Content>
  <AlertDialog.Root
    bind:open={openDelete}
    onOpenChange={(value) => {
      if (!value) editing = null;
    }}
  >
    <AlertDialog.Content class="w-md" overlayClass="bg-black/30">
      <AlertDialog.Header>
        <AlertDialog.Title>Are you sure?</AlertDialog.Title>
        <AlertDialog.Description>
          This will permanently delete the tag
          <span class="font-bold">
            {$tags.find((vl) => vl.id === editing)?.name}
          </span>. You'll have to add everything again.
        </AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Footer>
        <Button
          variant="destructive"
          effect="gooeyLeft"
          onclick={async () => {
            const mark = $tags.find((mk) => mk.id === editing);
            if (mark) {
              await MarkDB.deleteMark(mark);
              await refreshTags();
              openDelete = false;
              toast.warning(`Deleted tag ${mark.name}.`);
              editing = null;
            }
          }}>Delete</Button
        >
        <AlertDialog.Cancel class="dark:text-white">Cancel</AlertDialog.Cancel>
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Root>
</AlertDialog.Root>
