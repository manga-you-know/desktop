<!-- <script lang="ts"> -->
<!--   import Icon from "@iconify/svelte"; -->
<!--   import { Dialog, Button } from "@/lib/components"; -->
<!--   import { FavoriteDB } from "@/repositories"; -->
<!--   import { -->
<!--     refreshLibrary, -->
<!--     refreshFavorites, -->
<!--     loadFavoriteChapters, -->
<!--   } from "@/functions"; -->
<!--   import { toast } from "svelte-sonner"; -->
<!--   import { IS_MOBILE } from "@/constants"; -->
<!--   import { cn } from "@/lib/utils"; -->
<!--   import type { Favorite } from "@/types"; -->
<!--   import { removeCard } from "@/components/animations"; -->
<!--   import { undoTasks } from "@/store"; -->
<!---->
<!--   interface Props { -->
<!--     favorite: Favorite; -->
<!--     open: boolean; -->
<!--   } -->
<!---->
<!--   let { favorite, open = $bindable(false) }: Props = $props(); -->
<!-- </script> -->
<!---->
<!-- <Dialog.Root bind:open> -->
<!--   <Dialog.Content> -->
<!--     <Dialog.Header> -->
<!--       <Dialog.Title>Are you absolutely sure?</Dialog.Title> -->
<!--       <Dialog.Description> -->
<!--         This will permanently delete -->
<!--         <span class="font-bold"> {favorite.name} </span> and all readed chapters -->
<!--         within it. -->
<!--       </Dialog.Description> -->
<!--     </Dialog.Header> -->
<!--     <Dialog.Footer -->
<!--       class={cn("flex-row", IS_MOBILE ? "w-full !justify-center" : "")} -->
<!--     > -->
<!--       <Button -->
<!--         class={IS_MOBILE ? "w-full" : ""} -->
<!--         variant="destructive" -->
<!--         effect="gooeyLeft" -->
<!--         onclick={async () => { -->
<!--           open = false; -->
<!--           removeCard(favorite.id.toString(), async () => { -->
<!--             const undo = await FavoriteDB.deleteFavorite(favorite); -->
<!--             toast.success(`${favorite.name} deleted with success.`); -->
<!--             $undoTasks.push({ -->
<!--               do: async () => { -->
<!--                 await FavoriteDB.undoDeleteFavorite(undo); -->
<!--                 await Promise.all([refreshLibrary(), refreshFavorites()]); -->
<!--                 if (favorite.is_ultra_favorite) loadFavoriteChapters(favorite); -->
<!--               }, -->
<!--               message: "Undo delete of " + favorite.name, -->
<!--             }); -->
<!--             await Promise.all([refreshLibrary(), refreshFavorites()]); -->
<!--           }); -->
<!--         }} -->
<!--       > -->
<!--         Delete -->
<!--       </Button> -->
<!--     </Dialog.Footer> -->
<!--   </Dialog.Content> -->
<!-- </Dialog.Root> -->
