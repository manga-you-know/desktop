<script setup>
// import { useRoute } from '#vue-router'
// const route = useRoute()
// const path = computed(() => route.path);
// watch(() => route, () => {
//   links[0].forEach(link => {
//     if (link.to === '/') {
//       if (route.path === '/') {
//         link.icon = 'heroicons:home-solid'
//       } else {
//         link.icon = 'heroicons:home'
//       }
//     }
//     else if (link.to === '/favorites') {
//       if (route.path === '/favorites') {
//         link.icon = 'heroicons:star-solid'
//       } else {
//         link.icon = 'heroicons:star'
//       }
//     } else if (link.to === '/configs') {
//       if (route.path === '/configs') {
//         link.icon = 'heroicons:cog-6-tooth-solid'
//       } else {
//         link.icon = 'heroicons:cog-6-tooth'
//       }
//     }
//   })
// }, { deep: true })
const links = [
    [
        {
            label: "Profile",
            avatar: {
                src: "https://avatars.githubusercontent.com/u/103978193?v=4",
            },
        },
        {
            label: "Home",
            icon: "heroicons:home",
            to: "/",
        },
        {
            label: "Favorites",
            icon: "heroicons:star",
            to: "/favorites",
        },
        {
            label: "Configs",
            icon: "heroicons:cog-6-tooth",
            to: "/configs",
        },
    ],
    [
        {
            label: "Example",
            icon: "heroicons:light-bulb",
        },
        {
            label: "Help",
            icon: "heroicons:question-mark-circle",
        },
    ],
];
</script>

<template>
    <UVerticalNavigation
        class="md:w-[110px] w-[40px] mt-[30px] mr-5 -z-0 fixed select-none"
        :links="links"
    />
</template>
