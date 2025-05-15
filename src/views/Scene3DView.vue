<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { TresCanvas } from '@tresjs/core'
import TresPerspectiveCamera from '@tresjs/core'
import TresDirectionalLight from '@tresjs/core'
import TresAmbientLight from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { SRGBColorSpace, NoToneMapping, Vector3, Object3D } from 'three'
import { Home_t, Device } from '@/utils/Model'
import Home from '@/components/models/EHome.vue'
import { ElMessage } from 'element-plus'
import { getDevices } from '@/services/apiService'
import SensorDataModal from '@/components/SensorDataModal.vue'

const gl = {
  clearColor: '#82DBC5',
  shadows: false,
  alpha: false,
  outputColorSpace: SRGBColorSpace,
  toneMapping: NoToneMapping,
}

const home = ref<Home_t>({ id: '', name: '', floors: [] })
const devices = ref<Device[]>([])
const isLoaded = ref(false)
const showSensorModal = ref(false)
const selectedDevice = ref<Device | null>(null)

const cameraPosition = ref<Vector3>(new Vector3(0, 10, 10))

const autoRotateTimer = ref<number | null>(null)
const isAutoRotating = ref(true)

// 清理函数
const cleanup = () => {
  // 清理定时器
  if (autoRotateTimer.value) {
    clearTimeout(autoRotateTimer.value)
    autoRotateTimer.value = null
  }

  // 重置状态
  isLoaded.value = false
  showSensorModal.value = false
  selectedDevice.value = null
  isAutoRotating.value = true

  // 清理数据
  home.value = { id: '', name: '', floors: [] }
  devices.value = []
}

onMounted(async () => {
  try {
    const [homeRes, devicesRes] = await Promise.all([
      fetch('/HomePlan.json'),
      getDevices()
    ])
    home.value = await homeRes.json()
    devices.value = devicesRes.data
    isLoaded.value = true
    console.log('Home:', home.value)
    console.log('Devices:', devices.value)

    // 验证设备数据
    if (!Array.isArray(devices.value)) {
      throw new Error('设备数据格式错误：不是数组')
    }

    // 详细检查每个设备的数据
    devices.value.forEach((device, index) => {
      console.log(`设备 ${index} 详细信息:`, {
        device_id: device.device_id,
        type: device.type,
        status: device.status,
        location: device.location,
        coordinates: device.location?.coordinates
      })

      if (!device.device_id || !device.type || !device.status || !device.location) {
        console.warn(`设备数据不完整 [${index}]:`, device)
      }
    })
  } catch (error) {
    ElMessage.error('加载数据失败')
    console.error('加载数据失败:', error)
  }
})

const handleOrbitChange = (e: { object: Object3D }) => {
  cameraPosition.value = e.object.position
}

const handleOrbitStart = (e: { object: Object3D }) => {
  cameraPosition.value = e.object.position
  // 停止自动旋转
  isAutoRotating.value = false
  // 清除之前的定时器
  if (autoRotateTimer.value) {
    clearTimeout(autoRotateTimer.value)
    autoRotateTimer.value = null
  }
}

const handleOrbitEnd = (e: { object: Object3D }) => {
  cameraPosition.value = e.object.position
  // 设置5秒后恢复自动旋转
  autoRotateTimer.value = window.setTimeout(() => {
    isAutoRotating.value = true
  }, 5000)
}

onBeforeUnmount(() => {
  cleanup()
})

const handleDeviceClick = (device: Device) => {
  selectedDevice.value = device
  showSensorModal.value = true
}
</script>

<template>
  <div class="scene-container">
    <TresCanvas v-if="isLoaded" v-bind="gl" preset="realistic">
      <TresPerspectiveCamera :position="cameraPosition" />
      <OrbitControls
        @change="handleOrbitChange"
        @start="handleOrbitStart"
        @end="handleOrbitEnd"
        :minPolarAngle="0"
        :maxPolarAngle="Math.PI / 2"
        :autoRotate="isAutoRotating"
        :autoRotateSpeed="0.5"
        :enableZoom="true"
        :enablePan="true"
        :enableRotate="true"
        :minDistance="5"
        :maxDistance="20"
      />
      <TresAmbientLight :intensity="1" />
      <TresDirectionalLight
        :position="[10, 20, 15]"
        :intensity="2"
      />
      <Home
        :home="home"
        :cameraPosition="cameraPosition"
        :devices="devices"
        @deviceClick="handleDeviceClick"
      />
    </TresCanvas>

    <SensorDataModal
      v-if="selectedDevice"
      v-model="showSensorModal"
      :device="selectedDevice"
      @close="showSensorModal = false"
    />
  </div>
</template>

<style scoped>
.scene-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.scene-container :deep(canvas) {
  width: 100% !important;
  height: 100% !important;
  position: relative !important;
}
</style>
