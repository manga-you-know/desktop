<script setup lang="ts">
    function searchFavorite(someValue: string) {
        console.log('searchFavorite', someValue)
    }
</script>

<template>
    <UInputMenu onchange="searchFavorite" />
</template>