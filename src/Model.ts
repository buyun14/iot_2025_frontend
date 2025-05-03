class Vector3D {
    x: number
    y: number
    z: number
    constructor(x: number, y: number, z: number) {
        this.x = x
        this.y = y
        this.z = z
    }

    static add(vec1: Vector3D, vec2: Vector3D) {
        return new Vector3D(vec1.x + vec2.x, vec1.y + vec2.y, vec1.z + vec2.z)
    }
}

class Wall_t {
    id: string
    parentId: string
    startPoint: Vector3D
    endPoint: Vector3D
    constructor(id: string, parentId: string, startPoint: Vector3D, endPoint: Vector3D) {
        this.id = id
        this.parentId = parentId
        this.startPoint = startPoint
        this.endPoint = endPoint
    }
}

class Room_t {
    id: string
    parentId: string
    name: string
    position: number[]
    walls: Wall_t[]
    constructor(id: string, parentId: string, name: string, position: number[], walls: Wall_t[]) {
        this.id = id
        this.parentId = parentId
        this.name = name
        this.position = position
        this.walls = walls
    }
}

class Floor_t {
    id: string
    parentId: string
    name: string
    rooms: Room_t[]
    constructor(id: string, parentId: string, name: string, rooms: Room_t[]) {
        this.id = id
        this.parentId = parentId
        this.name = name
        this.rooms = rooms
    }
}

class Home_t {
    id: string
    name: string
    floors: Floor_t[]
    constructor(id: string, name: string, floors: Floor_t[]) {
        this.id = id
        this.name = name
        this.floors = floors
    }
}

export { Vector3D, Wall_t, Room_t, Floor_t, Home_t }
