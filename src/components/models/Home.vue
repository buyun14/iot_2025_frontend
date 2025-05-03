<script setup lang="ts">
import { Home_t } from '@/Model'
import Floor from '@/components/models/Floor.vue'

const props = defineProps({
    home: {
        type: Object as PropType<Home_t>,
        required: true
    },
    cameraPosition: {
        type: Array as PropType<number[]>,
        required: true
    }
})
</script>

<template>
    <Floor
        v-for="floor in home.floors"
        :key="floor.id"
        :floor="floor"
        :cameraPosition="cameraPosition"
    />
</template>

<style scoped>

</style>