<script lang="ts">
  import { AlertDialog, Button } from "@/lib/components";
  import { toast } from "svelte-sonner";

  interface Props {
    open: boolean;
    message: string;
    deleteText?: string;
    overlayClass?: string;
    onokay: () => Promise<void>;
  }

  let {
    open = $bindable(false),
    message,
    overlayClass,
    deleteText = "Delete",
    onokay,
  }: Props = $props();
</script>

<AlertDialog.Root bind:open>
  <AlertDialog.Content {overlayClass}>
    <AlertDialog.Header>
      <AlertDialog.Title>Are you sure?</AlertDialog.Title>
      <AlertDialog.Description>
        {message}
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <Button
        variant="destructive"
        effect="gooeyLeft"
        onclick={async () => {
          await onokay();
          open = false;
          // toast.warning("Deleted with success.");
        }}
      >
        {deleteText}
      </Button>
      <AlertDialog.Cancel class="dark:text-white">Cancel</AlertDialog.Cancel>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
