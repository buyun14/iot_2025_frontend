<script setup lang="ts">
import { Floor_t } from '@/Model'
import Room from '@/components/models/Room.vue'

const props = defineProps({
    floor: {
        type: Object as PropType<Floor_t>,
        required: true
    },
    cameraPosition: {
        type: Array as PropType<number[]>,
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