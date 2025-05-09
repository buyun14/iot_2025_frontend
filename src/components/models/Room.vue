<script setup lang="ts">
import Wall from '@/components/models/Wall.vue'
import { Room_t } from '@/utils/Model'
import { computed } from 'vue'
import { Euler, Shape, Vector2, Vector3 } from 'three'
import { Text3D } from '@tresjs/cientos'
import type { PropType } from 'vue'

const props = defineProps({
    room: {
        type: Object as PropType<Room_t>,
        required: true
    },
    cameraPosition: {
        type: Object as PropType<Vector3>,
        required: true
    }
})

const shape = new Shape(props.room.vertices.map(v => new Vector2(v.x, v.z)))
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

const color = '#ffffff'

const textPosition = new Vector3(props.room.position.x, 3.5, props.room.position.z)
const textRotation = computed(() => {
    const [cameraX, cameraY, cameraZ] = props.cameraPosition
    
    const [dx, dy, dz] = [cameraX - textPosition.x, cameraY - textPosition.y, cameraZ - textPosition.z]
    
    const rotateX = -Math.atan2(dy, Math.sqrt(dx * dx + dz * dz))

    const rotateY = Math.atan2(dx, dz)
    return new Euler(rotateX, rotateY, 0, 'YXZ')
})
</script>

<template>
    <TresGroup>
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
                :roughness="0.5" />
        </TresMesh>
        <Wall
            v-for="wall in walls"
            :key="wall.id"
            :wall="wall"
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