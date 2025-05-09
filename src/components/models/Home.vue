<script setup lang="ts">
import { Home_t } from '@/utils/Model'
import Floor from '@/components/models/Floor.vue'
import { Vector3 } from 'three'
import type { PropType } from 'vue'

const props = defineProps({
    home: {
        type: Object as PropType<Home_t>,
        required: true
    },
    cameraPosition: {
        type: Object as PropType<Vector3>,
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