<!-- src/components/DeviceLogsModal.vue -->
<template>
  <el-dialog
    v-model="dialogVisible"
    :title="`设备日志 - ${device.device_id}`"
    width="800px"
    :close-on-click-modal="false"
    @close="close"
  >
    <div class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>
    <div class="chart-controls">
      <el-button-group>
        <el-button @click="resetZoom">
          <el-icon><Refresh /></el-icon>
          重置缩放
        </el-button>
        <el-button @click="exportData">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </el-button-group>
    </div>
    <el-table
      v-if="tableData.length > 0"
      :data="tableData"
      style="width: 100%"
      height="300px"
      border
    >
      <el-table-column prop="timestamp" label="时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.timestamp) }}
        </template>
      </el-table-column>
      <el-table-column prop="value" label="阈值下限" width="120" />
      <el-table-column prop="operation" label="操作类型" width="120">
        <template #default="{ row }">
          <el-tag :type="getOperationType(row.operation)">
            {{ row.operation }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="details" label="详细信息" />
    </el-table>
    <div v-else class="empty-data">
      <el-empty description="暂无日志数据" />
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import { getLogs } from '@/services/apiService';
import { Refresh, Download } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const props = defineProps<{
  device: {
    device_id: string;
  };
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const dialogVisible = ref(true);
const chartCanvas = ref<HTMLCanvasElement | null>(null);
const chartData = ref<Array<{ timestamp: number; value: number; operation: string; details: string }>>([]);
const tableData = ref<Array<{ timestamp: number; value: number; operation: string; details: string }>>([]);
let chartInstance: Chart | null = null;

const fetchLogs = async () => {
  try {
    const response = await getLogs(props.device.device_id);
    const logs = response.data.logs.map(log => ({
      timestamp: new Date(log.timestamp).getTime(),
      value: log.details.new_value?.lower || log.details.old_value?.lower || 0,
      operation: log.operation,
      details: JSON.stringify(log.details)
    }));
    chartData.value = logs;
    tableData.value = logs;
  } catch (error) {
    console.error('获取设备日志失败', error);
    ElMessage.error('获取设备日志失败');
  }
};

const renderChart = () => {
  if (chartInstance) {
    chartInstance.destroy();
  }

  if (chartCanvas.value && chartData.value.length > 0) {
    chartInstance = new Chart(chartCanvas.value, {
      type: 'line',
      data: {
        datasets: [{
          label: '阈值下限',
          data: chartData.value,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
          parsing: {
            xAxisKey: 'timestamp',
            yAxisKey: 'value',
          },
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              title: (items) => {
                return formatDate(items[0].parsed.x);
              }
            }
          },
          zoom: {
            zoom: {
              wheel: { enabled: true },
              pinch: { enabled: true },
              mode: 'x',
            },
            pan: {
              enabled: true,
              mode: 'x',
            },
          },
        },
        scales: {
          x: {
            type: 'time',
            time: { unit: 'minute' },
            grid: { display: true },
          },
          y: {
            title: { display: true, text: '阈值' },
            grid: { display: true },
          },
        },
      },
    });
  }
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString();
};

const getOperationType = (operation: string) => {
  const types: Record<string, string> = {
    'update': 'primary',
    'create': 'success',
    'delete': 'danger',
    'warning': 'warning'
  };
  return types[operation] || 'info';
};

const resetZoom = () => {
  if (chartInstance) {
    chartInstance.resetZoom();
  }
};

const exportData = () => {
  const csv = [
    ['时间', '阈值下限', '操作类型', '详细信息'],
    ...tableData.value.map(row => [
      formatDate(row.timestamp),
      row.value,
      row.operation,
      row.details
    ])
  ].map(row => row.join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${props.device.device_id}_logs_${new Date().toISOString()}.csv`;
  link.click();
};

const close = () => {
  emit('close');
};

watch(() => props.device, () => {
  fetchLogs().then(renderChart);
});

onMounted(() => {
  fetchLogs().then(renderChart);
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});
</script>

<style scoped>
.chart-container {
  height: 300px;
  margin-bottom: 20px;
}

.chart-controls {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.empty-data {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

:deep(.el-button-group) {
  margin-right: 10px;
}
</style>