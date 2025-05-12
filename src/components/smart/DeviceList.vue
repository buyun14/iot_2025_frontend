<!-- src/components/smart/DeviceList.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElTag } from 'element-plus';

const props = defineProps<{
  devices: any[]
}>();

const emit = defineEmits<{
  (e: 'delete', deviceId: string): void
}>();

const router = useRouter();

// 设备状态标签颜色映射
const statusColorMap = {
  online: 'success',
  offline: 'danger',
  unknown: 'info'
};

// 查看设备详情
const viewDevice = (deviceId: string) => {
  router.push(`/smart-devices/${deviceId}`);
};

// 发送命令
const sendCommand = (deviceId: string) => {
  router.push(`/smart-devices/${deviceId}/command`);
};
</script>

<template>
  <div class="device-list">
    <el-table :data="devices" style="width: 100%">
      <el-table-column prop="name" label="设备名称" min-width="150" />
      <el-table-column prop="type" label="设备类型" min-width="120" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusColorMap[row.status] || 'info'">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="lastSeen" label="最后在线时间" min-width="180" />
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button size="small" @click="viewDevice(row.id)">
              详情
            </el-button>
            <el-button size="small" type="primary" @click="sendCommand(row.id)">
              发送命令
            </el-button>
            <el-button size="small" type="danger" @click="emit('delete', row.id)">
              删除
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.device-list {
  width: 100%;
}
</style> 