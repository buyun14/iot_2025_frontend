<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { TresCanvas } from '@tresjs/core'
import TresPerspectiveCamera from '@tresjs/core'
import TresDirectionalLight from '@tresjs/core'
import TresAmbientLight from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { BasicShadowMap, SRGBColorSpace, NoToneMapping } from 'three'
import { Home_t, Vector3D } from '@/Model'
import Home from '@/components/models/Home.vue'

const gl = {
  clearColor: '#82DBC5',
  shadows: true,
  alpha: false,
  shadowMapType: BasicShadowMap,
  outputColorSpace: SRGBColorSpace,
  toneMapping: NoToneMapping,
}

const home = ref<Home_t>()
const isLoaded = ref(false)

const cameraPosition = ref([0, 10, 10])

onMounted(async () => {
  const res = await fetch('/HomePlan.json')
  home.value = await res.json()
  isLoaded.value = true
  console.log(home.value)
})

const handleOrbitChange = (e: any) => {
  cameraPosition.value = [e.object.position.x, e.object.position.y, e.object.position.z]
}

const handleOrbitStart = (e: any) => {
  cameraPosition.value = [e.object.position.x, e.object.position.y, e.object.position.z]
}

const handleOrbitEnd = (e: any) => {
  cameraPosition.value = [e.object.position.x, e.object.position.y, e.object.position.z]
}

</script>

<template>
  <div class="scene-container">
    <h1>3D 家居场景与传感器应用</h1>
    <TresCanvas v-if="isLoaded"  v-bind="gl" window-size>
    <TresPerspectiveCamera :position="cameraPosition" />
    <OrbitControls @change="handleOrbitChange" @start="handleOrbitStart" @end="handleOrbitEnd" />
    <TresAmbientLight :intensity="1" />
    <TresAxesHelper :args="[1000]" />
    <TresMesh
      :position="[10, 20, 10]"
      :rotation="[0, 0, 0]"
    >
      <TresBoxGeometry :args="[1, 1, 1]" />
      <TresMeshToonMaterial :color="0xffffff" />
    </TresMesh>
    <TresDirectionalLight
        cast-shadow
        :position="[10, 20, 15]"
        :intensity="3"
        :shadow-mapSize-width="4096"
        :shadow-mapSize-height="4096"
        :shadow-camera-left="0"
        :shadow-camera-right="0"
        :shadow-camera-top="0"
        :shadow-camera-bottom="0"
        :shadow-camera-near="1"
        :shadow-camera-far="100"
    />
    <Home :home="home" :cameraPosition="cameraPosition" />
  </TresCanvas>
  </div>
</template>

<style scoped>

</style>