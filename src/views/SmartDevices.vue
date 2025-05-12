<!-- src/views/SmartDevices.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getSmartDevices, deleteSmartDevice, createSmartDevice } from '@/services/apiService';
import DeviceList from '@/components/smart/DeviceList.vue';
import DeviceForm from '@/components/smart/DeviceForm.vue';

const devices = ref([]);
const loading = ref(false);
const showCreateDialog = ref(false);

// 获取设备列表
const fetchDevices = async () => {
  loading.value = true;
  try {
    const response = await getSmartDevices();
    devices.value = response.data;
  } catch (error) {
    ElMessage.error('获取设备列表失败');
  } finally {
    loading.value = false;
  }
};

// 删除设备
const handleDelete = async (deviceId: string) => {
  try {
    await ElMessageBox.confirm('确定要删除该设备吗？', '提示', {
      type: 'warning'
    });
    await deleteSmartDevice(deviceId);
    ElMessage.success('删除成功');
    fetchDevices();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

// 创建设备
const handleCreate = async (deviceData: any) => {
  try {
    await createSmartDevice(deviceData);
    ElMessage.success('创建成功');
    showCreateDialog.value = false;
    fetchDevices();
  } catch (error) {
    ElMessage.error('创建失败');
  }
};

onMounted(() => {
  fetchDevices();
});
</script>

<template>
  <div class="smart-devices">
    <div class="page-header">
      <h2>智能设备管理</h2>
      <el-button type="primary" @click="showCreateDialog = true">
        添加设备
      </el-button>
    </div>

    <el-card v-loading="loading">
      <DeviceList
        :devices="devices"
        @delete="handleDelete"
      />
    </el-card>

    <DeviceForm
      v-model="showCreateDialog"
      @submit="handleCreate"
    />
  </div>
</template>

<style scoped>
.smart-devices {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}
</style> 