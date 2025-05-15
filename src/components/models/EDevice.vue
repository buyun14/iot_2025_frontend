<script setup lang="ts">
import { ref, watch } from 'vue'
import { Device } from '@/utils/Model'
import type { PropType } from 'vue'

const props = defineProps({
  device: {
    type: Object as PropType<Device>,
    required: true,
    validator: (value: Device) => {
      if (!value.device_id || !value.type || !value.status || !value.location) {
        console.warn('设备数据不完整:', value)
        return false
      }
      return true
    }
  }
})

const emit = defineEmits<{
  (e: 'deviceClick', device: Device): void
}>()

const isHovered = ref(false)

const handleClick = () => {
  console.log('设备被点击:', props.device)
  emit('deviceClick', props.device)
}

const handlePointerOver = () => {
  isHovered.value = true
}

const handlePointerOut = () => {
  isHovered.value = false
}

// 根据设备状态返回颜色
const getDeviceColor = () => {
  switch (props.device.status) {
    case 'online':
      return isHovered.value ? '#4CAF50' : '#2E7D32'
    case 'offline':
      return isHovered.value ? '#F44336' : '#C62828'
    default:
      return isHovered.value ? '#FFA726' : '#EF6C00'
  }
}

// 监听设备数据变化
watch(() => props.device, (newDevice) => {
  console.log('EDevice 接收到的设备数据:', newDevice)
}, { deep: true })
</script>

<template>
  <TresMesh
    :position="device.location.coordinates"
    @click="handleClick"
    @pointer-over="handlePointerOver"
    @pointer-out="handlePointerOut"
  >
    <TresBoxGeometry :args="[0.3, 0.3, 0.3]" />
    <TresMeshStandardMaterial
      :color="getDeviceColor()"
      :emissive="getDeviceColor()"
      :emissiveIntensity="isHovered ? 0.5 : 0.2"
      :transparent="true"
      :opacity="0.6"
    />
  </TresMesh>
</template>
