<!-- src/components/DeviceLogsModal.vue -->
<template>
    <div class="modal">
      <h2>设备日志 - {{ device.device_id }}</h2>
      <canvas ref="chartCanvas"></canvas>
      <button @click="close">关闭</button>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue';
  import Chart from 'chart.js/auto'; // 引入 Chart.js
  import 'chartjs-adapter-date-fns'; // 引入日期适配器
  import { getLogs } from '@/services/apiService';
  
  const props = defineProps(['device']);
  const emit = defineEmits(['close']);
  
  const chartData = ref([]);
  const chartCanvas = ref(null);
  
  // 获取日志数据
  const fetchLogs = async () => {
    try {
      const response = await getLogs(props.device.device_id);
      chartData.value = response.data.logs.map(log => ({
        timestamp: new Date(log.timestamp).getTime(), // 确保时间戳为毫秒数
        value: log.details.new_value?.lower || log.details.old_value?.lower || 0,
      }));
    } catch (error) {
      console.error('获取设备日志失败', error);
    }
  };
  
  // 渲染折线图
  const renderChart = () => {
    if (chartCanvas.value && chartData.value.length > 0) {
      new Chart(chartCanvas.value, {
        type: 'line',
        data: {
          datasets: [{
            label: '阈值下限',
            data: chartData.value,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true,
            parsing: {
              xAxisKey: 'timestamp', // x 轴对应的时间字段
              yAxisKey: 'value',     // y 轴对应的值字段
            },
          }],
        },
        options: {
          scales: {
            x: {
              type: 'time', // 时间轴类型
              time: {
                unit: 'minute', // 时间单位
              },
            },
          },
        },
      });
    }
  };
  
  onMounted(() => {
    fetchLogs().then(() => renderChart());
  });
  
  watch(() => props.device, () => {
    fetchLogs().then(() => renderChart());
  });
  
  const close = () => emit('close');
  </script>