<template>
  <div class="mqtt-topic-container">
    <el-card class="mqtt-topic-card">
      <template #header>
        <div class="card-header">
          <span>MQTT主题管理</span>
          <el-button type="primary" @click="handleAddTopic">添加主题</el-button>
        </div>
      </template>

      <!-- 主题列表 -->
      <el-table :data="topics" style="width: 100%" v-loading="loading">
        <el-table-column prop="topic" label="主题名称" min-width="200">
          <template #default="{ row }">
            <el-tag>{{ row.topic }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column prop="isActive" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.isActive"
              :active-value="true"
              :inactive-value="false"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button type="danger" @click="handleDelete(row)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑主题对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑主题' : '添加主题'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="topicForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="主题名称" prop="topic">
          <el-input v-model="topicForm.topic" placeholder="请输入主题名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="topicForm.description"
            type="textarea"
            placeholder="请输入主题描述"
          />
        </el-form-item>
        <el-form-item label="状态" prop="isActive">
          <el-switch v-model="topicForm.isActive" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Edit, Delete } from '@element-plus/icons-vue';
import {
  getMqttTopics,
  createMqttTopic,
  updateMqttTopic,
  deleteMqttTopic
} from '@/services/apiService';

interface MqttTopic {
  _id: string;
  topic: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const topics = ref<MqttTopic[]>([]);
const loading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref();

const topicForm = ref({
  topic: '',
  description: '',
  isActive: true
});

const rules = {
  topic: [
    { required: true, message: '请输入主题名称', trigger: 'blur' },
    { min: 3, max: 100, message: '长度在 3 到 100 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入主题描述', trigger: 'blur' }
  ]
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleString();
};

const fetchTopics = async () => {
  loading.value = true;
  try {
    const response = await getMqttTopics();
    topics.value = response.data;
  } catch (error) {
    console.error('获取MQTT主题列表失败', error);
    ElMessage.error('获取MQTT主题列表失败');
  } finally {
    loading.value = false;
  }
};

const handleAddTopic = () => {
  isEdit.value = false;
  topicForm.value = {
    topic: '',
    description: '',
    isActive: true
  };
  dialogVisible.value = true;
};

const handleEdit = (row: MqttTopic) => {
  isEdit.value = true;
  topicForm.value = { ...row };
  dialogVisible.value = true;
};

const handleDelete = async (row: MqttTopic) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该主题吗？此操作不可恢复。',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    await deleteMqttTopic(row._id);
    ElMessage.success('主题删除成功');
    fetchTopics();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除主题失败', error);
      ElMessage.error('删除主题失败');
    }
  }
};

const handleStatusChange = async (row: MqttTopic) => {
  try {
    await updateMqttTopic(row._id, { isActive: row.isActive });
    ElMessage.success(`主题已${row.isActive ? '启用' : '禁用'}`);
  } catch (error) {
    console.error('更新主题状态失败', error);
    ElMessage.error('更新主题状态失败');
    row.isActive = !row.isActive; // 恢复状态
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (isEdit.value) {
          await updateMqttTopic(topicForm.value._id, topicForm.value);
          ElMessage.success('主题更新成功');
        } else {
          await createMqttTopic(topicForm.value);
          ElMessage.success('主题创建成功');
        }
        dialogVisible.value = false;
        fetchTopics();
      } catch (error) {
        console.error(isEdit.value ? '更新主题失败' : '创建主题失败', error);
        ElMessage.error(isEdit.value ? '更新主题失败' : '创建主题失败');
      }
    }
  });
};

onMounted(() => {
  fetchTopics();
});
</script>

<style scoped>
.mqtt-topic-container {
  padding: 20px;
}

.mqtt-topic-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-tag) {
  font-family: monospace;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 