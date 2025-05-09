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

//TODO: 更多传感器类型
type SensorType = 'Temperature' | 'Humidity' | 'Light' | 'Sound'

// 传感器数据类型映射
interface SensorDataMap {
    Temperature: number;
    Humidity: number;
    Light: number;
    Sound: number;
}

class Sensor_t {
    constructor(
        public id: string,
        public parentId: string,
        public name: string,
        public position: number[],
        public type: SensorType,
        public data: SensorDataMap[SensorType]
    ) {}
}

export { Wall_t, Room_t, Floor_t, Home_t, Sensor_t }
