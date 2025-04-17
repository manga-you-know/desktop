<script lang="ts">
  import { AlertDialog, Button } from "@/lib/components";
  import { toast } from "svelte-sonner";

  interface Props {
    open: boolean;
    message: string;
    onokay: () => Promise<void>;
  }

  let { open = $bindable(false), message, onokay }: Props = $props();
</script>

<AlertDialog.Root bind:open>
  <AlertDialog.Content>
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
          toast.warning("Deleted with success.");
        }}
      >
        Delete
      </Button>
      <AlertDialog.Cancel class="dark:text-white">Cancel</AlertDialog.Cancel>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
