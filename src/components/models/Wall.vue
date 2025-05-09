<script setup lang="ts">
import { Wall_t } from '@/utils/Model'
import { computed, PropType } from 'vue'

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
    <TresMesh
        cast-shadow
        receive-shadow
        :position="position"
        :rotation="rotation"
        :side="2"
    >
        <TresBoxGeometry :args="[length, height, depth]" />
        <TresMeshPhysicalMaterial
            :color="color" 
            :metalness="0.5"
            :roughness="0.5"
            :clearcoat="0.1"
            :clearcoat-roughness="1"
        />
    </TresMesh>
</template>

<style scoped>

</style>