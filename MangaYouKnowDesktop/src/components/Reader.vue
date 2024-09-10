<script setup lang="ts">
    const isDivMainHidden = useState<Boolean>('isDivMainHidden', () => false)
    defineShortcuts({
        f4: {
            usingInput: true,
            handler: () => {
                isDivMainHidden.value = false
            }
        }
    })
</script>

<template>
    <div class="flex w-screen h-screenjustify-center items-center" >
        <NuxtImg src="https://scans-hot.leanbox.us/manga/Undead-Unluck/0221-001.png" placeholder class="object-contain w-screen h-screen max-w-screen  max-h-screen" />
    </div>
</template>