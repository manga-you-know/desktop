<script lang="ts">
  import Icon from "@iconify/svelte";
  import { open as openPath } from "@tauri-apps/plugin-shell";
  import { AlertDialog, Button, Input, ScrollArea } from "@/lib/components";
  import { openCollection, collections } from "@/store";
  import { refreshCollections } from "@/functions";
  import { MarkDB } from "@/repositories";
  import type { Mark } from "@/types";
  import { toast } from "svelte-sonner";

  openCollection.subscribe(() => {
    refreshCollections();
  });

  function focusInput(id: number) {
    const input = document.querySelector(
      `input[id="${id}"]`
    ) as HTMLInputElement;
    input?.focus();
  }

  async function addCollection() {
    if (
      newCollection === "" ||
      $collections
        .map((cl) => cl.name.toLowerCase())
        .includes(newCollection.toLowerCase().trim())
    )
      return;

    await MarkDB.addMark(newCollection.trim());
    await refreshCollections();
    toast.success(`Collection ${newCollection.trim()} added`);
    newCollection = "";
  }

  async function updateCollection(collection: Mark) {
    editing = null;
    if (
      collection.name !== "" &&
      !$collections
        .filter((cl) => cl.id !== collection.id)
        .map((cl) => cl.name.toLowerCase())
        .includes(collection.name.toLowerCase().trim())
    ) {
      await MarkDB.updateMark(collection);
    }
    await refreshCollections();
  }

  let editing: number | null = $state(null);
  let newCollection: string = $state("");
  let openDelete = $state(false);
</script>

<AlertDialog.Root bind:open={$openCollection}>
  <AlertDialog.Content class="w-[28rem]">
    <div class="flex flex-col items-center gap-2">
      <div class="inline-flex gap-2">
        <Input
          class="w-80"
          variant="secondary"
          placeholder="Create collection..."
          floatingLabel
          disabled={editing !== null}
          bind:value={newCollection}
          onenter={addCollection}
        />
        <Button
          class="w-10"
          variant="secondary"
          disabled={editing !== null}
          onclick={addCollection}
        >
          <Icon class="!w-5 !h-5" icon="lucide:plus" />
        </Button>
      </div>
      <ScrollArea class="h-80">
        <div class="flex flex-col gap-1 justify-center px-5">
          {#each $collections.reverse() as collection}
            <div class="inline-flex">
              <Input
                id={collection.id.toString()}
                class="rounded-r-none w-[17rem]"
                variant="secondary"
                bind:value={collection.name}
                readonly={collection.id !== editing}
                autofocus
                disabled={editing !== null && collection.id !== editing}
                onenter={() => updateCollection(collection)}
              />
              <Button
                class="rounded-none"
                onclick={() => {
                  if (editing === null) {
                    editing = collection.id;
                    focusInput(collection.id);
                  } else {
                    updateCollection(collection);
                  }
                }}
                disabled={editing !== null && collection.id !== editing}
              >
                <Icon
                  icon={editing === collection.id
                    ? "ion:checkmark-round"
                    : "ion:edit"}
                />
              </Button>
              <Button
                class="rounded-l-none"
                variant="destructive"
                onclick={() => {
                  editing = collection.id;
                  openDelete = true;
                }}
                disabled={editing !== null && collection.id !== editing}
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
    <AlertDialog.Content class="w-[28rem]">
      <AlertDialog.Header>
        <AlertDialog.Title>Are you sure?</AlertDialog.Title>
        <AlertDialog.Description>
          This will permanently delete the collection
          <span class="font-bold">
            {$collections.find((vl) => vl.id === editing)?.name}
          </span>. You'll have to add everything again.
        </AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Footer>
        <Button
          variant="destructive"
          effect="gooeyLeft"
          onclick={async () => {
            const mark = $collections.find((mk) => mk.id === editing);
            if (mark) {
              await MarkDB.deleteMark(mark);
              await refreshCollections();
              openDelete = false;
              toast.warning(`Deleted collection ${mark.name}.`);
              editing = null;
            }
          }}>Delete</Button
        >
        <AlertDialog.Cancel class="dark:text-white">Cancel</AlertDialog.Cancel>
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Root>
</AlertDialog.Root>
