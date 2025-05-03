<!-- src/views/DeviceList.vue -->
<template>
  <div class="device-list-container">
    <el-card class="device-list-card">
      <template #header>
        <div class="card-header">
          <span>设备管理</span>
          <el-button type="primary" @click="handleAddDevice">添加设备</el-button>
        </div>
      </template>

      <!-- 筛选工具栏 -->
      <div class="filter-toolbar">
        <div class="filter-header">
          <span class="filter-title">筛选条件</span>
          <el-button 
            type="text" 
            :disabled="!hasActiveFilters" 
            @click="resetFilters"
          >
            <el-icon><Refresh /></el-icon>
            重置筛选
          </el-button>
        </div>
        <el-form :inline="true" :model="filterForm" class="filter-form">
          <el-form-item label="设备状态">
            <el-select 
              v-model="filterForm.status" 
              placeholder="选择状态" 
              clearable 
              @change="handleFilterChange"
              :popper-class="'filter-select-dropdown'"
            >
              <el-option label="在线" value="on">
                <span class="status-tag status-online">在线</span>
              </el-option>
              <el-option label="离线" value="off">
                <span class="status-tag status-offline">离线</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="设备类型">
            <el-select 
              v-model="filterForm.type" 
              placeholder="选择类型" 
              clearable 
              @change="handleFilterChange"
              :popper-class="'filter-select-dropdown'"
            >
              <el-option label="湿度传感器" value="humidity">
                <span class="type-tag">湿度传感器</span>
              </el-option>
              <el-option label="温度传感器" value="temperature">
                <span class="type-tag">温度传感器</span>
              </el-option>
              <el-option label="其他传感器" value="other">
                <span class="type-tag">其他传感器</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="filterForm.type === 'other'" label="自定义类型">
            <el-input
              v-model="filterForm.customType"
              placeholder="输入传感器类型"
              clearable
              @input="handleFilterChange"
              class="custom-type-input"
            />
          </el-form-item>
        </el-form>
        <div v-if="hasActiveFilters" class="filter-summary">
          <el-tag 
            v-if="filterForm.status" 
            closable 
            @close="clearFilter('status')"
            class="filter-tag"
          >
            状态: {{ filterForm.status === 'on' ? '在线' : '离线' }}
          </el-tag>
          <el-tag 
            v-if="filterForm.type" 
            closable 
            @close="clearFilter('type')"
            class="filter-tag"
          >
            类型: {{ getTypeLabel(filterForm.type) }}
          </el-tag>
          <el-tag 
            v-if="filterForm.customType" 
            closable 
            @close="clearFilter('customType')"
            class="filter-tag"
          >
            自定义类型: {{ filterForm.customType }}
          </el-tag>
        </div>
      </div>

      <!-- 设备列表 -->
      <div class="device-list-summary">
        <span class="total-count">共 {{ filteredDevices.length }} 个设备</span>
        <span v-if="hasActiveFilters" class="filtered-count">
          (已筛选 {{ filteredDevices.length }} 个)
        </span>
      </div>

      <el-row :gutter="20">
        <el-col :span="6" v-for="device in filteredDevices" :key="device._id">
          <el-card class="device-card" :body-style="{ padding: '0px' }">
            <div class="device-status" :class="getStatusClass(device.status)">
              <el-icon><Monitor /></el-icon>
              <span>{{ device.status === 'on' ? '在线' : '离线' }}</span>
            </div>
            <div class="device-info">
              <h3>{{ device.device_id }}</h3>
              <div class="device-thresholds">
                <div class="threshold-item">
                  <span class="label">阈值下限</span>
                  <span class="value">{{ device.thresholds?.lower || '未设置' }}</span>
                </div>
                <div class="threshold-item">
                  <span class="label">阈值上限</span>
                  <span class="value">{{ device.thresholds?.upper || '未设置' }}</span>
                </div>
              </div>
            </div>
            <div class="device-actions">
              <el-button-group>
                <el-button type="primary" @click="openUpdateModal(device)">
                  <el-icon><Edit /></el-icon>
                  修改
                </el-button>
                <el-button type="danger" @click="deleteDevice(device.device_id)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </el-button-group>
              <el-button-group class="mt-2">
                <el-button @click="openLogModal(device)">
                  <el-icon><Document /></el-icon>
                  日志
                </el-button>
                <el-button @click="openSensorModal(device)">
                  <el-icon><DataLine /></el-icon>
                  数据
                </el-button>
              </el-button-group>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <!-- 修改设备参数弹窗 -->
    <UpdateDeviceModal v-if="selectedDevice" :device="selectedDevice" @close="closeUpdateModal" />

    <!-- 日志详情弹窗 -->
    <DeviceLogsModal v-if="selectedDeviceForLogs" :device="selectedDeviceForLogs" @close="closeLogModal" />

    <!-- 传感器数据弹窗 -->
    <SensorDataModal v-if="selectedDeviceForSensors" :device="selectedDeviceForSensors" @close="closeSensorModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getDevices, deleteDevice as apiDeleteDevice } from '@/services/apiService';
import UpdateDeviceModal from '@/components/UpdateDeviceModal.vue';
import DeviceLogsModal from '@/components/DeviceLogsModal.vue';
import SensorDataModal from '@/components/SensorDataModal.vue';
import { Monitor, Edit, Delete, Document, DataLine, Refresh } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

interface Device {
  _id: string;
  device_id: string;
  status: string;
  thresholds?: {
    lower?: number;
    upper?: number;
  };
}

const devices = ref<Device[]>([]);
const selectedDevice = ref<Device | null>(null);
const selectedDeviceForLogs = ref<Device | null>(null);
const selectedDeviceForSensors = ref<Device | null>(null);

const filterForm = ref({
  status: '',
  type: '',
  customType: ''
});

const hasActiveFilters = computed(() => {
  return filterForm.value.status || filterForm.value.type || filterForm.value.customType;
});

const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    'humidity': '湿度传感器',
    'temperature': '温度传感器',
    'other': '其他传感器'
  };
  return typeMap[type] || type;
};

const clearFilter = (field: keyof typeof filterForm.value) => {
  filterForm.value[field] = '';
  handleFilterChange();
};

const resetFilters = () => {
  filterForm.value = {
    status: '',
    type: '',
    customType: ''
  };
  handleFilterChange();
};

const getDeviceType = (deviceId: string) => {
  if (deviceId.includes('humidity')) return '湿度传感器';
  if (deviceId.includes('temperature')) return '温度传感器';
  return filterForm.value.customType || '其他传感器';
};

const filteredDevices = computed(() => {
  return devices.value.filter(device => {
    // 状态筛选
    const matchesStatus = !filterForm.value.status || device.status === filterForm.value.status;
    
    // 类型筛选
    const matchesType = !filterForm.value.type || 
      (filterForm.value.type === 'humidity' && device.device_id.includes('humidity')) ||
      (filterForm.value.type === 'temperature' && device.device_id.includes('temperature')) ||
      (filterForm.value.type === 'other' && 
        (!device.device_id.includes('humidity') && !device.device_id.includes('temperature')) &&
        (!filterForm.value.customType || device.device_id.includes(filterForm.value.customType)));
    
    return matchesStatus && matchesType;
  });
});

const handleFilterChange = () => {
  // 筛选条件变化时自动更新显示
};

const getStatusClass = (status: string) => {
  return {
    'status-online': status === 'on',
    'status-offline': status !== 'on',
    'status-warning': status === 'warning'
  };
};

const fetchDevices = async () => {
  try {
    const response = await getDevices();
    devices.value = response.data;
  } catch (error) {
    console.error('获取设备列表失败', error);
    ElMessage.error('获取设备列表失败');
  }
};

const handleAddDevice = () => {
  ElMessage.info('添加设备功能开发中');
};

const openUpdateModal = (device: Device) => {
  selectedDevice.value = device;
};

const closeUpdateModal = () => {
  selectedDevice.value = null;
};

const openLogModal = (device: Device) => {
  selectedDeviceForLogs.value = device;
};

const closeLogModal = () => {
  selectedDeviceForLogs.value = null;
};

const openSensorModal = (device: Device) => {
  selectedDeviceForSensors.value = device;
};

const closeSensorModal = () => {
  selectedDeviceForSensors.value = null;
};

const deleteDevice = async (deviceId: string) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该设备吗？此操作不可恢复。',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    await apiDeleteDevice(deviceId);
    ElMessage.success('设备删除成功');
    fetchDevices();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除设备失败', error);
      ElMessage.error('删除设备失败');
    }
  }
};

onMounted(() => {
  fetchDevices();
});
</script>

<style scoped>
.device-list-container {
  padding: 20px;
}

.device-list-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-toolbar {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.filter-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
}

.filter-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px dashed #dcdfe6;
}

.filter-tag {
  margin-right: 8px;
}

.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  color: white;
  font-size: 12px;
}

.status-online {
  background-color: #67c23a;
}

.status-offline {
  background-color: #909399;
}

.type-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  background-color: #ecf5ff;
  color: #409eff;
  font-size: 12px;
}

.custom-type-input {
  width: 200px;
}

.device-list-summary {
  margin-bottom: 15px;
  padding: 0 15px;
  color: #606266;
  font-size: 14px;
}

.total-count {
  font-weight: 500;
}

.filtered-count {
  color: #909399;
  margin-left: 8px;
}

:deep(.filter-select-dropdown) {
  .el-select-dropdown__item {
    padding: 8px 20px;
  }
}

:deep(.el-tag) {
  display: inline-flex;
  align-items: center;
}

:deep(.el-tag .el-icon-close) {
  margin-left: 4px;
  cursor: pointer;
}

.device-card {
  margin-bottom: 20px;
  transition: all 0.3s;
}

.device-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.device-status {
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-weight: bold;
}

.device-info {
  padding: 15px;
}

.device-info h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #303133;
}

.device-thresholds {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.threshold-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.threshold-item .label {
  color: #606266;
}

.threshold-item .value {
  font-weight: bold;
  color: #303133;
}

.device-actions {
  padding: 15px;
  border-top: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mt-2 {
  margin-top: 10px;
}

:deep(.el-button-group) {
  display: flex;
  width: 100%;
}

:deep(.el-button-group .el-button) {
  flex: 1;
}
</style>