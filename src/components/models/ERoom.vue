<script setup lang="ts">
import Wall from '@/components/models/EWall.vue'
import Device from '@/components/models/EDevice.vue'
import { Room_t, Device as Device_t } from '@/utils/Model'
import { computed, ref, onMounted } from 'vue'
import { Euler, Shape, Vector3 } from 'three'
import { Text3D } from '@tresjs/cientos'
import type { PropType } from 'vue'
import { useTexture } from '@tresjs/core'
import type { Texture } from 'three'

const props = defineProps({
    room: {
        type: Object as PropType<Room_t>,
        required: true
    },
    cameraPosition: {
        type: Object as PropType<Vector3>,
        required: true
    },
    devices: {
        type: Array as PropType<Device_t[]>,
        required: true
    }
})

const emit = defineEmits<{
    (e: 'deviceClick', device: Device_t): void
}>()

const shape = new Shape()
props.room.vertices.forEach((v, index) => {
    if (index === 0) {
        shape.moveTo(v.x, v.z)
    } else {
        shape.lineTo(v.x, v.z)
    }
})
shape.closePath()

console.log('Room vertices:', props.room.vertices)
console.log('Shape created:', shape)
console.log('Room position:', props.room.position)

const vertices = props.room.vertices.map(v => new Vector3(v.x, v.y, v.z).add(props.room.position))

const walls = computed(() => {
    const walls = []
    for (let i = 0; i < vertices.length; i++) {
        const startPoint = vertices[i]
        const endPoint = vertices[(i + 1) % vertices.length]
        walls.push({
            id: i.toString(),
            parentId: props.room.id,
            startPoint: startPoint,
            endPoint: endPoint
        })
    }
    return walls
})

const processedDevices = computed(() => {
    const processedDevices: Device_t[] = []
    props.devices.forEach(device => {
        const [x, y, z] = device.location.coordinates
        processedDevices.push({
            ...device,
            location: {
                ...device.location,
                coordinates: [x + props.room.position.x, y + props.room.position.y, z + props.room.position.z]
            }
        })
    })
    return processedDevices
})

const color = '#ffffff'

const textPosition = new Vector3(props.room.position.x, 3.5, props.room.position.z)
const textRotation = computed(() => {
    const [cameraX, cameraY, cameraZ] = props.cameraPosition

    const [dx, dy, dz] = [cameraX - textPosition.x, cameraY - textPosition.y, cameraZ - textPosition.z]

    const rotateX = -Math.atan2(dy, Math.sqrt(dx * dx + dz * dz))

    const rotateY = Math.atan2(dx, dz)
    return new Euler(rotateX, rotateY, 0, 'YXZ')
})

const isLoaded = ref(false)
const floorTexture = ref({ map: null as Texture | null })

onMounted(async () => {
    try {
        floorTexture.value = await useTexture({
            map: '/textures/floor/floor_texture.jpg'
        })

        // 设置纹理重复
        if (floorTexture.value.map) {
            floorTexture.value.map.wrapS = floorTexture.value.map.wrapT = 1000
            floorTexture.value.map.repeat.set(5, 5)
            // 启用纹理边缘平滑
            floorTexture.value.map.minFilter = 1006
            floorTexture.value.map.magFilter = 1006
            // 设置纹理边缘处理
            floorTexture.value.map.generateMipmaps = true
        }

        console.log('纹理加载状态:', floorTexture.value)
        isLoaded.value = true
    } catch (error) {
        console.error('纹理加载失败:', error)
    }
})

</script>

<template>
    <TresGroup v-if="isLoaded">
        <TresMesh
            cast-shadow
            receive-shadow
            :position="[room.position.x, 0, room.position.z]"
            :rotation="[-Math.PI / 2, 0, 0]"
        >
            <TresShapeGeometry :args="[shape]" />
            <TresMeshPhysicalMaterial
                :color="color"
                :side="2"
                :metalness="0.5"
                :roughness="0.5"
                :map="floorTexture?.map" />
        </TresMesh>
        <Wall
            v-for="wall in walls"
            :key="wall.id"
            :wall="wall"
        />
        <Device
            v-for="device in processedDevices"
            :key="device.device_id"
            :device="device"
            @deviceClick="(device) => emit('deviceClick', device)"
        />
        <Suspense>
            <Text3D
                :rotation="textRotation"
                :text="room.name"
                font="/font.json"
                :position="textPosition"
                color="#ffffff"
                need-updates
                center
                :height="0.5"
            />
        </Suspense>
    </TresGroup>
</template>

<style scoped>

</style>
