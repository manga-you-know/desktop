<script setup lang="ts">
    import { getCurrentWindow } from '@tauri-apps/api/window';
    const images = useState<string[]>('images')
    const currentlyPage = ref(1)
    const totalPage = ref(images.value.length)
    const selectedImage = ref<string>(images.value[0])
    const isDivMainHidden = useState<Boolean>('isDivMainHidden', () => true)
    function toNextPage() {
        if (currentlyPage.value == totalPage.value) {
            return
        }
        currentlyPage.value++
        selectedImage.value = images.value[currentlyPage.value - 1]
    }
    function toPrevPage() {
        if (currentlyPage.value == 1) {
            return
        }
        currentlyPage.value--
        selectedImage.value = images.value[currentlyPage.value - 1]
    }
    // ill make the app preloads all the images in images.value using the link rel="preload" tag
    useHead({
        title: 'MangaYouKnow',
        link: images.value.map(image => {
            return {
                rel: 'preload',
                href: image,
                as: 'image'
            }
        })
        
    })
        
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
            handler: toPrevPage
        },
        arrowright: {
            usingInput: true,
            handler: toNextPage
        },
    },
    { chainDelay: 400 }
    )
</script>

<template>
    <div class="fixed w-screen h-screen flex">
        <button class="w-[50%] cursor-default outline-none border-none" tabindex="-1" @click="toPrevPage"/>
        <button class="w-[50%] cursor-default outline-none border-none" tabindex="-1" @click="toNextPage"/>
    </div>
    <div class="fixed w-screen p-[1%] flex justify-end">
        <UBadge class="m-1" color="white" variant="solid" >
            {{ currentlyPage }} / {{ totalPage }}
        </UBadge>
    </div>
    <div>
        <!-- <UCarousel v-slot="{ item }" :items="images" arrows> -->
        <NuxtImg :src=selectedImage placeholder class="object-contain w-screen h-screen max-w-screen  max-h-screen" /> 
        <!-- <div v-for="image in images" class="hidden">
            <img :src="image" rel="preload" draggable="false">
        </div> -->
        <!-- </UCarousel> -->
    </div>
    <!-- <div class="flex w-screen h-screen justify-center items-center" >
        <UCarousel v-slot="{ image }" :items="images" :ui="{ item: 'basis-full' }" class="rounded-lg ">
            <img :src="image" class="w-full" draggable="false">
             <NuxtImg :src=image placeholder class="object-contain w-screen h-screen max-w-screen  max-h-screen" /> -->
        <!-- </UCarousel> -->

    <!-- </div> --> 
</template>