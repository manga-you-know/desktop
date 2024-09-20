<script setup lang="ts">
    import { getCurrentWindow } from '@tauri-apps/api/window';
    const images = useState<string[]>('images')
    const selectedImage = ref<string>(images.value[0])
    const isDivMainHidden = useState<Boolean>('isDivMainHidden', () => true)
    defineShortcuts({
        f4: {
            usingInput: true,
            handler: () => {
                isDivMainHidden.value = false
                getCurrentWindow().setFullscreen(false)
            }
        },
        arrowleft: {
            usingInput: true,
            handler: () => {
                const index = images.value.indexOf(selectedImage.value)
                if (index != 0) {
                    selectedImage.value = images.value[index - 1]
                }
                // if (selectedImage.value != images.value[0]) {
                //     selectedImage.value = images.value[0]
                // }
            }
        },
        arrowright: {
            usingInput: true,
            handler: () => {
                const index = images.value.indexOf(selectedImage.value)
                if (index != images.value.length - 1) {
                    selectedImage.value = images.value[index + 1]
                }
            }
        },
    })
</script>

<template>
    <div>
        <!-- <UCarousel v-slot="{ item }" :items="images" arrows> -->
            <NuxtImg :src=selectedImage placeholder class="object-contain w-screen h-screen max-w-screen  max-h-screen" /> 
            <div v-for="image in images" class="hidden">
                <img :src="image" rel="preload" draggable="false">
            </div>
        <!-- </UCarousel> -->
    </div>
    <!-- <div class="flex w-screen h-screen justify-center items-center" >
        <UCarousel v-slot="{ image }" :items="images" :ui="{ item: 'basis-full' }" class="rounded-lg ">
            <img :src="image" class="w-full" draggable="false">
             <NuxtImg :src=image placeholder class="object-contain w-screen h-screen max-w-screen  max-h-screen" /> -->
        <!-- </UCarousel> -->

    <!-- </div> --> 
</template>