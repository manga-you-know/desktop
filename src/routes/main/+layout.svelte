<script>
  import { Sidebar } from "@/components";
</script>

<div class="w-screen h-screen flex select-none overflow-hidden">
  <Sidebar />
  <div class="w-32 min-w-32 h-screen mr-3 -z-10 bg-[#070709]"></div>
  <slot />
</div>
