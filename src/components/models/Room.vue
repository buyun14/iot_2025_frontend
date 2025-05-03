<script setup lang="ts">
import Wall from '@/components/models/Wall.vue'
import { Room_t, Vector3D } from '@/Model'
import { computed } from 'vue'
import { Shape, Vector2 } from 'three'
import { Text3D } from '@tresjs/cientos'

const props = defineProps({
    room: {
        type: Object as PropType<Room_t>,
        required: true
    },
    cameraPosition: {
        type: Array as PropType<number[]>,
        required: true
    }
})

const shape = new Shape(props.room.vertices.map(v => new Vector2(v.x, v.z)))

const walls = computed(() => {
    const walls = []
    for (let i = 0; i < props.room.vertices.length; i++) {
        const startPoint = props.room.vertices[i]
        const endPoint = props.room.vertices[(i + 1) % props.room.vertices.length]
        walls.push({
            id: i,
            startPoint: Vector3D.add(props.room.position, startPoint),
            endPoint: Vector3D.add(props.room.position, endPoint)
        })
    }
    return walls
})

const color = '#ffffff'

const [textX, textY, textZ] = [props.room.position.x, 3.5, props.room.position.z]
const textRotation = computed(() => {
    const [cameraX, cameraY, cameraZ] = props.cameraPosition
    
    const [dx, dy, dz] = [cameraX - textX, cameraY - textY, cameraZ - textZ]
    
    const rotateX = -Math.atan2(dy, Math.sqrt(dx * dx + dz * dz))

    const rotateY = Math.atan2(dx, dz)
    return [rotateX, rotateY, 0, 'YXZ']
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
                :position="[textX, textY, textZ]"
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