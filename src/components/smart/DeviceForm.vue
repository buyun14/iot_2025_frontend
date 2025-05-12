<!-- src/components/smart/DeviceForm.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue';
import type { FormInstance } from 'element-plus';

const props = defineProps<{
  modelValue: boolean
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', data: any): void
}>();

const formRef = ref<FormInstance>();
const formData = ref({
  name: '',
  type: '',
  description: '',
  location: '',
  config: {}
});

const rules = {
  name: [
    { required: true, message: '请输入设备名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择设备类型', trigger: 'change' }
  ]
};

const deviceTypes = [
  { label: '智能灯', value: 'light' },
  { label: '智能插座', value: 'socket' },
  { label: '智能传感器', value: 'sensor' },
  { label: '智能摄像头', value: 'camera' }
];

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate((valid: boolean) => {
    if (valid) {
      emit('submit', formData.value);
    }
  });
};

const handleClose = () => {
  emit('update:modelValue', false);
  formRef.value?.resetFields();
};

watch(() => props.modelValue, (val: boolean) => {
  if (!val) {
    formRef.value?.resetFields();
  }
});
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="(val: boolean) => emit('update:modelValue', val)"
    title="添加设备"
    width="500px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="设备名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入设备名称" />
      </el-form-item>
      
      <el-form-item label="设备类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择设备类型" style="width: 100%">
          <el-option
            v-for="item in deviceTypes"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="设备描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          placeholder="请输入设备描述"
        />
      </el-form-item>
      
      <el-form-item label="安装位置" prop="location">
        <el-input v-model="formData.location" placeholder="请输入安装位置" />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template> 