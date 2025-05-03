<template>
  <el-dialog
    v-model="dialogVisible"
    :title="`传感器数据 - ${device.device_id}`"
    width="900px"
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
      <el-select v-model="timeRange" class="ml-2" @change="handleTimeRangeChange">
        <el-option label="最近1小时" value="1h" />
        <el-option label="最近6小时" value="6h" />
        <el-option label="最近24小时" value="24h" />
        <el-option label="最近7天" value="7d" />
      </el-select>
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
      <el-table-column prop="value" label="传感器数值" width="120" />
      <el-table-column prop="status" label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ row.status === 'on' ? '在线' : '离线' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
    <div v-else class="empty-data">
      <el-empty description="暂无传感器数据" />
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
import { getSensorHistory } from '@/services/apiService';
import { Refresh, Download } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

interface SensorData {
  timestamp: number;
  value: number;
  status: string;
}

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
const chartData = ref<SensorData[]>([]);
const tableData = ref<SensorData[]>([]);
const timeRange = ref('1h');
let chartInstance: Chart | null = null;

const fetchSensorData = async () => {
  try {
    const response = await getSensorHistory(props.device.device_id, { timeRange: timeRange.value });
    const data = response.data.map(item => ({
      timestamp: new Date(item.timestamp).getTime(),
      value: item.value,
      status: item.status
    }));
    chartData.value = data;
    tableData.value = data;
    renderChart();
  } catch (error) {
    console.error('获取传感器数据失败', error);
    ElMessage.error('获取传感器数据失败');
  }
};

const getStatusType = (status: string) => {
  return status === 'on' ? 'success' : 'danger';
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
          label: '传感器数值',
          data: chartData.value,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
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
            title: { display: true, text: '数值' },
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

const resetZoom = () => {
  if (chartInstance) {
    chartInstance.resetZoom();
  }
};

const exportData = () => {
  const csv = [
    ['时间', '传感器数值', '状态'],
    ...tableData.value.map(row => [
      formatDate(row.timestamp),
      row.value,
      row.status === 'on' ? '在线' : '离线'
    ])
  ].map(row => row.join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${props.device.device_id}_sensor_${new Date().toISOString()}.csv`;
  link.click();
};

const handleTimeRangeChange = () => {
  fetchSensorData();
};

const close = () => {
  emit('close');
};

watch(() => props.device, () => {
  fetchSensorData();
});

onMounted(() => {
  fetchSensorData();
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
  align-items: center;
  gap: 10px;
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

.ml-2 {
  margin-left: 10px;
}
</style>