<template>
    <div class="modal" :style="{ width: modalWidth + 'px', height: modalHeight + 'px' }" ref="modal">
      <div class="resize-handle" @mousedown="startResize"></div>
      <h2>{{ device.device_id }} 传感器数据</h2>
      <canvas ref="chartCanvas"></canvas>
      <button @click="resetZoom">重置缩放</button>
      <button @click="close">关闭</button>
      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="chartData.length === 0 && !error">暂无传感器数据</div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
  import Chart from 'chart.js/auto';
  import zoomPlugin from 'chartjs-plugin-zoom';
  import { getSensorHistory } from '@/services/apiService';
  
  // 注册缩放插件
  Chart.register(zoomPlugin);
  
  const props = defineProps(['device']);
  const emit = defineEmits(['close']);
  const chartCanvas = ref(null);
  const chartData = ref([]);
  const error = ref(null);
  let chartInstance = null;
  
  // 弹窗初始宽高
  const modalWidth = ref(600);
  const modalHeight = ref(400);
  
  // 拖拽调整弹窗大小相关变量
  const isResizing = ref(false);
  const startX = ref(0);
  const startY = ref(0);
  
  // 获取传感器历史数据
  const fetchSensorData = async () => {
    try {
      const response = await getSensorHistory(props.device.device_id);
      chartData.value = response.data.map(item => ({
        timestamp: new Date(item.timestamp).getTime(),
        value: item.value,
      }));
      error.value = null; // 清除错误状态
    } catch (err) {
      console.error('获取传感器数据失败', err);
      error.value = '无法加载传感器数据，请稍后再试。';
    }
  };
  
  // 渲染图表
  const renderChart = () => {
    if (chartInstance) {
      chartInstance.destroy(); // 销毁旧实例
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
          plugins: {
            tooltip: {
              mode: 'index',
              intersect: false,
            },
            zoom: {
              zoom: {
                wheel: {
                  enabled: true, // 启用鼠标滚轮缩放
                },
                pinch: {
                  enabled: true, // 启用手势缩放（移动端）
                },
                mode: 'x', // 仅允许 X 轴缩放
              },
              pan: {
                enabled: true, // 启用平移
                mode: 'x', // 仅允许 X 轴平移
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
  
  // 监听设备变化
  watch(() => props.device, () => {
    fetchSensorData().then(renderChart);
  });
  
  // 生命周期钩子
  onMounted(() => {
    fetchSensorData().then(renderChart);
    window.addEventListener('mousemove', resizeModal);
    window.addEventListener('mouseup', stopResize);
  });
  
  onBeforeUnmount(() => {
    if (chartInstance) {
      chartInstance.destroy(); // 销毁图表实例
    }
    window.removeEventListener('mousemove', resizeModal);
    window.removeEventListener('mouseup', stopResize);
  });
  
  // 关闭模态框
  const close = () => emit('close');
  
  // 重置缩放
  const resetZoom = () => {
    if (chartInstance) {
      chartInstance.resetZoom(); // 重置缩放和平移
    }
  };
  
  // 开始调整大小
  const startResize = (event) => {
    isResizing.value = true;
    startX.value = event.clientX;
    startY.value = event.clientY;
  };
  
  // 调整大小
  const resizeModal = (event) => {
    if (isResizing.value) {
      const deltaX = event.clientX - startX.value;
      const deltaY = event.clientY - startY.value;
      modalWidth.value += deltaX;
      modalHeight.value += deltaY;
      startX.value = event.clientX;
      startY.value = event.clientY;
    }
  };
  
  // 停止调整大小
  const stopResize = () => {
    isResizing.value = false;
  };
  </script>
  
  <style scoped>
  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    resize: both; /* 允许用户手动调整大小 */
    min-width: 400px;
    min-height: 300px;
  }
  
  .resize-handle {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 10px;
    height: 10px;
    background: #ccc;
    cursor: se-resize;
  }
  
  .error {
    color: red;
    margin-top: 10px;
  }
  
  button {
    margin-top: 10px;
    margin-right: 10px;
  }
  </style>