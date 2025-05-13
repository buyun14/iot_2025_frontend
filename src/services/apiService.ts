/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/apiService.js
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// 创建 Axios 实例
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'your-secret-token',
  },
});

// 设置 Token 函数(暂无，目前为固定)
export const setAuthToken = (token: string): void => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// 获取设备列表
export const getDevices = () => apiClient.get('/devices');

// 更新设备配置
export const updateDeviceConfig = (deviceId: string, config: any) =>
  apiClient.post(`/devices/${deviceId}/config`, config);

// 删除设备
export const deleteDevice = (deviceId: string) => apiClient.delete(`/devices/${deviceId}`);

// 获取设备日志
export const getLogs = (deviceId: string) => apiClient.get(`/logs?device_id=${deviceId}`);

// 获取采集数据
// 增加 params 参数支持查询条件
export const getSensorHistory = (deviceId: string, params: Record<string, any> = {}) => {
  return apiClient.get(
    `/devices/${deviceId}/history`,
    { params } // 自动将对象转换为查询参数
  );
};

// 视频流相关API
// 获取所有摄像头
export const getCameras = () => apiClient.get('/video');

// 获取单个摄像头详情
export const getCameraById = (cameraId: string) => apiClient.get(`/video/${cameraId}`);

// 创建摄像头
export const createCamera = (cameraData: any) => apiClient.post('/video', cameraData);

// 更新摄像头
export const updateCamera = (cameraId: string, cameraData: any) =>
  apiClient.put(`/video/${cameraId}`, cameraData);

// 删除摄像头
export const deleteCamera = (cameraId: string) => apiClient.delete(`/video/${cameraId}`);

// 同步摄像头流
export const syncCameraStreams = () => apiClient.post('/video/sync');

// 获取摄像头流URL
export const getCameraStreamUrls = (cameraId: string) => apiClient.get(`/video/${cameraId}/streams`);

// MQTT主题管理API
// 获取所有MQTT主题
export const getMqttTopics = () => apiClient.get('/mqtt-topics');

// 创建MQTT主题
export const createMqttTopic = (topicData: any) => apiClient.post('/mqtt-topics', topicData);

// 更新MQTT主题
export const updateMqttTopic = (topicId: string, topicData: any) =>
  apiClient.put(`/mqtt-topics/${topicId}`, topicData);

// 删除MQTT主题
export const deleteMqttTopic = (topicId: string) => apiClient.delete(`/mqtt-topics/${topicId}`);


// 智能设备相关API
// 获取所有智能设备
export const getSmartDevices = () => apiClient.get('/smart/devices');

// 获取单个智能设备
export const getSmartDevice = (deviceId: any) => apiClient.get(`/smart/devices/${deviceId}`);

// 创建智能设备
export const createSmartDevice = (deviceData: any) => apiClient.post('/smart/devices', deviceData);

// 删除智能设备
export const deleteSmartDevice = (deviceId: any) => apiClient.delete(`/smart/devices/${deviceId}`);

// 发送设备命令
export const sendDeviceCommand = (deviceId: any, command: any) =>
  apiClient.post(`/smart/devices/${deviceId}/command`, command);

// 获取设备状态
export const getDeviceState = (deviceId: any) =>
  apiClient.get(`/smart/devices/${deviceId}/state`);