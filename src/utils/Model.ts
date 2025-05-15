import type { Vector3 } from 'three'

class Wall_t {
    constructor(
        public id: string,
        public parentId: string,
        public startPoint: Vector3,
        public endPoint: Vector3
    ) {}
}

class Room_t {
    constructor(
        public id: string,
        public parentId: string,
        public name: string,
        public position: Vector3,
        public vertices: Vector3[]
    ) {}
}

class Floor_t {
    constructor(
        public id: string,
        public parentId: string,
        public name: string,
        public rooms: Room_t[]
    ) {}
}

class Home_t {
    constructor(
        public id: string,
        public name: string,
        public floors: Floor_t[]
    ) {}
}

class Device {
    constructor(
        public _id: string,
        public device_id: string,
        public status: string,
        public type: string,
        public location: {
            floor: string;
            room: string;
            coordinates: [number, number, number];
        },
        public thresholds?: {
            lower?: number;
            upper?: number;
        }
    ) {}
}

export { Wall_t, Room_t, Floor_t, Home_t, Device }
