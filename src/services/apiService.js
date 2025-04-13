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
export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// 获取设备列表
export const getDevices = () => apiClient.get('/devices');

// 更新设备配置
export const updateDeviceConfig = (deviceId, config) =>
  apiClient.post(`/devices/${deviceId}/config`, config);

// 删除设备
export const deleteDevice = (deviceId) => apiClient.delete(`/devices/${deviceId}`);

// 获取设备日志
export const getLogs = (deviceId) => apiClient.get(`/logs?device_id=${deviceId}`);

// 获取采集数据
// 增加 params 参数支持查询条件
export const getSensorHistory = (deviceId, params = {}) => {
  return apiClient.get(
    `/devices/${deviceId}/history`,
    { params } // 自动将对象转换为查询参数
  );
};