
<script setup lang="ts">
  const q = ref('')
</script>

<template class="grid w-full h-full items-center">
  <div class="p-3">
    <div>
      <UInput
        v-model="q"
        name="q"
        placeholder="Search..."
        icon="i-heroicons-magnifying-glass-20-solid"
        autocomplete="off"
        :ui="{ icon: { trailing: { pointer: '' } } }"
      >
        <template #trailing>
          <UButton
            v-show="q !== ''"
            color="gray"
            variant="link"
            icon="i-heroicons-x-mark-20-solid"
            :padded="false"
            @click="q = ''"
          />
        </template>
      </UInput>
    </div>
    <div class="flex w-full items-center">
      <h1>coisas</h1>
    </div>
  </div>
</template>
