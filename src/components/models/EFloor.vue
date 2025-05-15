<script setup lang="ts">
import { Floor_t, Device } from '@/utils/Model'
import Room from '@/components/models/ERoom.vue'
import { Vector3 } from 'three'
import type { PropType } from 'vue'
import { watch } from 'vue'

const props = defineProps({
    floor: {
        type: Object as PropType<Floor_t>,
        required: true
    },
    cameraPosition: {
        type: Object as PropType<Vector3>,
        required: true
    },
    devices: {
        type: Array as PropType<Device[]>,
        required: true
    }
})

const emit = defineEmits<{
    (e: 'deviceClick', device: Device): void
}>()

const getDevicesByRoom = (roomId: string) => {
    const roomDevices = props.devices.filter(device => device.location.room === roomId)
    console.log(`房间 ${roomId} 的设备:`, roomDevices)
    return roomDevices
}

// 监听设备数据变化
watch(() => props.devices, (newDevices) => {
    console.log('EFloor 接收到的设备数据:', newDevices)
}, { deep: true })
</script>

<template>
    <Room
        v-for="room in floor.rooms"
        :key="room.id"
        :room="room"
        :cameraPosition="cameraPosition"
        :devices="getDevicesByRoom(room.id)"
        @deviceClick="(device: Device) => emit('deviceClick', device)"
    />
</template>

<style scoped>

</style>