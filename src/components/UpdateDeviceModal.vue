<!-- src/components/UpdateDeviceModal.vue -->
<template>
  <el-dialog
    v-model="dialogVisible"
    :title="`修改设备参数 - ${device.device_id}`"
    width="500px"
    :close-on-click-modal="false"
    @close="close"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      label-position="right"
    >
      <el-form-item label="阈值下限" prop="temperature_threshold_low">
        <el-input-number
          v-model="formData.temperature_threshold_low"
          :min="0"
          :max="100"
          :step="0.1"
          :precision="1"
          controls-position="right"
        />
      </el-form-item>
      <el-form-item label="阈值上限" prop="temperature_threshold_high">
        <el-input-number
          v-model="formData.temperature_threshold_high"
          :min="0"
          :max="100"
          :step="0.1"
          :precision="1"
          controls-position="right"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { updateDeviceConfig } from '@/services/apiService';
import { ElMessage } from 'element-plus';
import type { FormInstance } from 'element-plus';

const props = defineProps<{
  device: {
    device_id: string;
    thresholds?: {
      lower?: number;
      upper?: number;
    };
  };
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const dialogVisible = ref(true);
const formRef = ref<FormInstance>();

const formData = ref({
  temperature_threshold_low: props.device.thresholds?.lower || 0,
  temperature_threshold_high: props.device.thresholds?.upper || 0,
});

const rules = {
  temperature_threshold_low: [
    { required: true, message: '请输入阈值下限', trigger: 'blur' },
    { type: 'number', message: '阈值必须为数字', trigger: 'blur' },
  ],
  temperature_threshold_high: [
    { required: true, message: '请输入阈值上限', trigger: 'blur' },
    { type: 'number', message: '阈值必须为数字', trigger: 'blur' },
  ],
};

const submitForm = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    await updateDeviceConfig(props.device.device_id, formData.value);
    ElMessage.success('设备参数更新成功');
    close();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新设备参数失败', error);
      ElMessage.error('更新设备参数失败');
    }
  }
};

const close = () => {
  emit('close');
};

// 监听设备变化，更新表单数据
watch(() => props.device, (newDevice) => {
  formData.value = {
    temperature_threshold_low: newDevice.thresholds?.lower || 0,
    temperature_threshold_high: newDevice.thresholds?.upper || 0,
  };
}, { immediate: true });
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-input-number) {
  width: 100%;
}
</style>