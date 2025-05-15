<script setup lang="ts">
import { Wall_t } from '@/utils/Model'
import { computed, PropType, ref, onMounted } from 'vue'
import { useTexture } from '@tresjs/core'
import type { Texture } from 'three'

/**
 * Props
 * depth: number 墙的厚度
 * height: number 墙的高度
 * startPoint: Point 墙的起点
 * endPoint: Point 墙的终点
 * color: string 墙的颜色
 * 墙从startPoint连接到endPoint，
 * 墙的宽度为width，高度为height，
 * 墙的颜色为color
 */
const props = defineProps({
    depth: {
        type: Number,
        default: 0.2
    },
    height: {
        type: Number,
        default: 3
    },
    wall: {
        type: Object as PropType<Wall_t>,
        required: true
    },
    color: {
        type: String,
        default: '#f0f0f0'
    }
})

const isLoaded = ref(false)
const wallTexture = ref({ map: null as Texture | null })

onMounted(async () => {
    try {
        wallTexture.value = await useTexture({
            map: '/textures/wall/wall_texture.jpg'
        })

        // 设置纹理重复
        if (wallTexture.value.map) {
            wallTexture.value.map.wrapS = wallTexture.value.map.wrapT = 1000
            wallTexture.value.map.repeat.set(2, 2)
            // 启用纹理边缘平滑
            wallTexture.value.map.minFilter = 1006
            wallTexture.value.map.magFilter = 1006
            // 设置纹理边缘处理
            wallTexture.value.map.generateMipmaps = true
        }

        console.log('墙壁纹理加载状态:', wallTexture.value)
        isLoaded.value = true
    } catch (error) {
        console.error('墙壁纹理加载失败:', error)
    }
})

// 计算墙的长度（起点到终点的距离）
const length = computed(() => {
    const dx = props.wall.endPoint.x - props.wall.startPoint.x
    const dz = props.wall.endPoint.z - props.wall.startPoint.z
    return Math.sqrt(dx * dx + dz * dz) + props.depth
})

// 计算墙的位置（起点和终点的中点）
const position = computed<[number, number, number]>(() => {
    return [
        (props.wall.startPoint.x + props.wall.endPoint.x) / 2,
        props.wall.startPoint.y + props.height / 2,
        (props.wall.startPoint.z + props.wall.endPoint.z) / 2
    ]
})

// 计算墙的旋转角度（只在 XZ 平面上旋转）
const rotation = computed<[number, number, number]>(() => {
    const dx = props.wall.endPoint.x - props.wall.startPoint.x
    const dz = props.wall.endPoint.z - props.wall.startPoint.z
    return [0, -Math.atan2(dz, dx), 0]
})
</script>

<template>
    <TresGroup v-if="isLoaded">
        <TresMesh
            cast-shadow
            receive-shadow
            :position="position"
            :rotation="rotation"
        >
            <TresBoxGeometry :args="[length, height, depth]" />
            <TresMeshPhysicalMaterial
                :color="color"
                :side="2"
                :metalness="0.5"
                :roughness="0.5"
                :map="wallTexture?.map" />
        </TresMesh>
    </TresGroup>
</template>

<style scoped>

</style>