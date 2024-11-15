<script setup lang="ts">
const route = useRoute();
</script>

<template>
    <UVerticalNavigation
        class="md:w-[110px] w-[40px] mt-[30px] mr-5 -z-0 fixed select-none"
        :links="[
            [
                {
                    label: 'Profile',
                    avatar: {
                        src: 'https://avatars.githubusercontent.com/u/103978193?v=4',
                    },
                },
                {
                    label: 'Home',
                    icon:
                        route.path === '/'
                            ? 'heroicons:home-solid'
                            : 'heroicons:home',
                    to: '/',
                },
                {
                    label: 'Favorites',
                    icon:
                        route.path === '/favorites'
                            ? 'heroicons:star-solid'
                            : 'heroicons:star',
                    to: '/favorites',
                },
                {
                    label: 'Settings',
                    icon:
                        route.path === '/settings'
                            ? 'heroicons:cog-6-tooth-solid'
                            : 'heroicons:cog-6-tooth',
                    to: '/settings',
                },
            ],
            [
                { label: 'Example', icon: 'heroicons:light-bulb' },
                { label: 'Help', icon: 'heroicons:question-mark-circle' },
            ],
        ]"
    />
</template>
