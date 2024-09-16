<script setup>

const route = useRoute()
const links = ref([
  [{
    label: 'Profile',
    avatar: {
      src: 'https://avatars.githubusercontent.com/u/103978193?v=4'
    },
  }, {
    label: 'Home',
    icon: 'i-heroicons-home',
    to: '/'
  }, {
    label: 'Favorites',
    icon: 'i-heroicons-star',
    to: 'favorites'
  }, {
    label: 'Configs',
    icon: 'i-heroicons-command-line',
    to: 'configs'
  }], [{
      label: 'Example',
      icon: 'i-heroicons-light-bulb'
    }, {
      label: 'Help',
      icon: 'i-heroicons-question-mark-circle'
  }]
])

</script>

<template>
    <UVerticalNavigation 
      class="fixed md:w-[110px] w-[40px] mt-[30px] mr-5" 
      :links="links" 
    />
</template>