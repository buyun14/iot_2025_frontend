<script setup lang="ts">
import { Floor_t } from '@/utils/Model'
import Room from '@/components/models/Room.vue'
import { Vector3 } from 'three'
import type { PropType } from 'vue'

const props = defineProps({
    floor: {
        type: Object as PropType<Floor_t>,
        required: true
    },
    cameraPosition: {
        type: Object as PropType<Vector3>,
        required: true
    }
})
</script>

<template>
    <Room
        v-for="room in floor.rooms"
        :key="room.id"
        :room="room"
        :cameraPosition="cameraPosition"
    />
</template>

<style scoped>

</style>