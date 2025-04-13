<!-- src/views/DeviceList.vue -->
<template>
    <div>
      <h1>设备管理</h1>
      <table>
        <thead>
          <tr>
            <th>设备ID</th>
            <th>状态</th>
            <th>阈值下限</th>
            <th>阈值上限</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="device in devices" :key="device._id">
            <td>{{ device.device_id }}</td>
            <td>{{ device.status || '无' }}</td>
            <td>{{ device.thresholds?.lower || '无' }}</td>
            <td>{{ device.thresholds?.upper || '无' }}</td>
            <td>
              <button @click="openUpdateModal(device)">修改</button>
              <button @click="deleteDevice(device.device_id)">删除</button>
              <button @click="openLogModal(device)">日志详情</button>
              <button @click="openSensorModal(device)">传感器数据</button>
            </td>
          </tr>
        </tbody>
      </table>
  
      <!-- 修改设备参数弹窗 -->
      <UpdateDeviceModal v-if="selectedDevice" :device="selectedDevice" @close="closeUpdateModal" />
  
      <!-- 日志详情弹窗 -->
      <DeviceLogsModal v-if="selectedDeviceForLogs" :device="selectedDeviceForLogs" @close="closeLogModal" />

      <!-- DeviceList.vue 的模态框部分 -->
      <SensorDataModal 
        v-if="selectedDeviceForSensors" 
        :device="selectedDeviceForSensors" 
        @close="closeSensorModal" 
      />
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { getDevices, deleteDevice as apiDeleteDevice } from '@/services/apiService';
  import UpdateDeviceModal from '@/components/UpdateDeviceModal.vue';
  import DeviceLogsModal from '@/components/DeviceLogsModal.vue';
  import SensorDataModal from '@/components/SensorDataModal.vue';
  
  const devices = ref([]);
  const selectedDevice = ref(null);
  const selectedDeviceForLogs = ref(null);
  const selectedDeviceForSensors = ref(null);
  
  const fetchDevices = async () => {
    try {
      const response = await getDevices();
      devices.value = response.data;
    } catch (error) {
      console.error('获取设备列表失败', error);
    }
  };
  
  const openUpdateModal = (device) => {
    selectedDevice.value = device;
  };
  
  const closeUpdateModal = () => {
    selectedDevice.value = null;
  };
  
  const openLogModal = (device) => {
    selectedDeviceForLogs.value = device;
  };
  
  const closeLogModal = () => {
    selectedDeviceForLogs.value = null;
  };
  
  const openSensorModal = (device) => {
    selectedDeviceForSensors.value = device;
  };

  const closeSensorModal = () => {
    selectedDeviceForSensors.value = null;
  };
  const deleteDevice = async (deviceId) => {
    try {
      await apiDeleteDevice(deviceId);
      fetchDevices(); // 刷新设备列表
    } catch (error) {
      console.error('删除设备失败', error);
    }
  };
  
  onMounted(() => {
    fetchDevices();
  });
  </script>