<script setup lang="ts">
    import { getCurrentWindow } from '@tauri-apps/api/window';
    const images = useState<string[]>('images')
    const isDivMainHidden = useState<Boolean>('isDivMainHidden', () => true)
    defineShortcuts({
        f4: {
            usingInput: true,
            handler: () => {
                isDivMainHidden.value = false
                getCurrentWindow().setFullscreen(false)
            }
        }
    })
</script>

<template>
    <div>
        <UCarousel v-slot="{ item }" :items="images" arrows>
            <img :src="item" class="object-contain w-screen h-screen max-w-screen  max-h-screen" draggable="false">
        </UCarousel>
    </div>
    <!-- <div class="flex w-screen h-screen justify-center items-center" >
        <UCarousel v-slot="{ image }" :items="images" :ui="{ item: 'basis-full' }" class="rounded-lg ">
            <img :src="image" class="w-full" draggable="false">
             <NuxtImg :src=image placeholder class="object-contain w-screen h-screen max-w-screen  max-h-screen" /> -->
        <!-- </UCarousel> -->

    <!-- </div> --> 
</template>