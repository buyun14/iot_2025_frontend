<script setup lang="ts">
import { Home_t, Device } from '@/utils/Model'
import Floor from '@/components/models/EFloor.vue'
import { Vector3 } from 'three'
import type { PropType } from 'vue'
import { watch } from 'vue'

const props = defineProps({
    home: {
        type: Object as PropType<Home_t>,
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

const getDevicesByFloor = (floorId: string) => {
    const floorDevices = props.devices.filter(device => device.location.floor === floorId)
    console.log(`楼层 ${floorId} 的设备:`, floorDevices)
    return floorDevices
}

// 监听设备数据变化
watch(() => props.devices, (newDevices) => {
    console.log('EHome 接收到的设备数据:', newDevices)
}, { deep: true })
</script>

<template>
  <TresGroup>
    <Floor
        v-for="floor in home.floors"
        :key="floor.id"
        :floor="floor"
        :cameraPosition="cameraPosition"
        :devices="getDevicesByFloor(floor.id)"
        @deviceClick="(device) => emit('deviceClick', device)"
    />
  </TresGroup>
</template>

<style scoped>

</style>
