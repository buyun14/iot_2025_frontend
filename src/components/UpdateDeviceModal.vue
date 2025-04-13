<!-- src/components/UpdateDeviceModal.vue -->
<template>
    <div class="modal">
      <h2>修改设备参数 - {{ device.device_id }}</h2>
      <form @submit.prevent="submitForm">
        <label>
          阈值下限:
          <input type="number" v-model="formData.temperature_threshold_low" required />
        </label>
        <label>
          阈值上限:
          <input type="number" v-model="formData.temperature_threshold_high" required />
        </label>
        <button type="submit">保存</button>
        <button @click="close">取消</button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { updateDeviceConfig } from '@/services/apiService';
  
  const props = defineProps(['device']);
  const emit = defineEmits(['close']);
  
  const formData = ref({
    temperature_threshold_low: props.device.thresholds?.lower || '',
    temperature_threshold_high: props.device.thresholds?.upper || '',
  });
  
  const submitForm = async () => {
    try {
      await updateDeviceConfig(props.device.device_id, formData.value);
      emit('close');
    } catch (error) {
      console.error('更新设备参数失败', error);
    }
  };
  
  const close = () => emit('close');
  </script>