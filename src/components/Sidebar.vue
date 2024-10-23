<script setup>
// import { useRoute } from '#vue-router'
// const route = useRoute()
// const path = computed(() => route.path);
// watch(() => route, () => {
//   links[0].forEach(link => {
//     if (link.to === '/') {
//       if (route.path === '/') {
//         link.icon = 'i-heroicons-home-solid'
//       } else {
//         link.icon = 'i-heroicons-home'
//       }
//     }
//     else if (link.to === '/favorites') {
//       if (route.path === '/favorites') {
//         link.icon = 'i-heroicons-star-solid'
//       } else {
//         link.icon = 'i-heroicons-star'
//       }
//     } else if (link.to === '/configs') {
//       if (route.path === '/configs') {
//         link.icon = 'i-heroicons-cog-6-tooth-solid'
//       } else {
//         link.icon = 'i-heroicons-cog-6-tooth'
//       }
//     }
//   })
// }, { deep: true })
const links = [
  [
    {
      label: 'Profile',
      avatar: {
        src: 'https://avatars.githubusercontent.com/u/103978193?v=4',
      },
    },
    {
      label: 'Home',
      icon: 'i-heroicons-home',
      to: '/',
    },
    {
      label: 'Favorites',
      icon: 'i-heroicons-star',
      to: '/favorites',
    },
    {
      label: 'Configs',
      icon: 'i-heroicons-cog-6-tooth',
      to: '/configs',
    },
  ],
  [
    {
      label: 'Example',
      icon: 'i-heroicons-light-bulb',
    },
    {
      label: 'Help',
      icon: 'i-heroicons-question-mark-circle',
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