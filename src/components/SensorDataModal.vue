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
        <el-option label="最近12小时" value="12h" />
        <el-option label="最近24小时" value="24h" />
        <el-option label="最近3天" value="3d" />
        <el-option label="最近7天" value="7d" />
        <el-option label="最近30天" value="30d" />
        <el-option label="自定义" value="custom" />
      </el-select>
      <el-date-picker
        v-if="timeRange === 'custom'"
        v-model="customTimeRange"
        type="datetimerange"
        range-separator="至"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        :shortcuts="dateShortcuts"
        @change="handleCustomTimeRangeChange"
        class="ml-2"
      />
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
import { ref, onMounted, watch, onBeforeUnmount, computed } from 'vue';
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

interface SensorHistoryItem {
  timestamp: string;
  value: number;
  status: string;
}

interface TimeRangeParams {
  timeRange?: string;
  startTime?: string;
  endTime?: string;
}

const props = defineProps<{
  device: {
    device_id: string;
  };
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'close'): void;
}>();

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const chartCanvas = ref<HTMLCanvasElement | null>(null);
const chartData = ref<SensorData[]>([]);
const tableData = ref<SensorData[]>([]);
const timeRange = ref('1h');
const customTimeRange = ref<[Date, Date] | null>(null);
let chartInstance: Chart | null = null;
let timer: ReturnType<typeof setInterval> | null = null;

const dateShortcuts = [
  {
    text: '最近1小时',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000);
      return [start, end];
    },
  },
  {
    text: '最近6小时',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 6);
      return [start, end];
    },
  },
  {
    text: '最近24小时',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24);
      return [start, end];
    },
  },
  {
    text: '最近7天',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
];

const fetchSensorData = async () => {
  try {
    let params: TimeRangeParams = { timeRange: timeRange.value };
    if (timeRange.value === 'custom' && customTimeRange.value) {
      params = {
        startTime: customTimeRange.value[0].toISOString(),
        endTime: customTimeRange.value[1].toISOString()
      };
    }
    const response = await getSensorHistory(props.device.device_id, params);
    const data = response.data.map((item: SensorHistoryItem) => ({
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

const startTimer = () => {
  // 清除可能存在的旧定时器
  if (timer) {
    clearInterval(timer);
  }
  // 设置新的定时器，每秒获取一次数据
  timer = setInterval(fetchSensorData, 1000);
};

const stopTimer = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

const getStatusType = (status: string) => {
  return status === 'on' ? 'success' : 'danger';
};

const renderChart = () => {
  if (!chartCanvas.value || chartData.value.length === 0) return;

  if (!chartInstance) {
    // 只在第一次创建图表实例
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
  } else {
    // 更新现有图表的数据
    chartInstance.data.datasets[0].data = chartData.value;
    chartInstance.update('none'); // 使用 'none' 模式进行静默更新
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

const handleCustomTimeRangeChange = () => {
  if (customTimeRange.value) {
    fetchSensorData();
  }
};

const close = () => {
  stopTimer();
  emit('update:modelValue', false);
  emit('close');
};

watch(() => props.device, () => {
  fetchSensorData();
  startTimer();
});

onMounted(() => {
  fetchSensorData();
  startTimer();
});

onBeforeUnmount(() => {
  stopTimer();
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