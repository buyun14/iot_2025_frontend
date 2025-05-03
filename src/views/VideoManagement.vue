<template>
  <div class="video-management">
    <div class="header">
      <h1>视频设备管理</h1>
      <div class="header-buttons">
        <el-button type="success" @click="addExampleCamera">
          <el-icon><VideoCamera /></el-icon>添加示例摄像头
        </el-button>
        <el-button type="primary" @click="showAddCameraDialog = true">
          <el-icon><Plus /></el-icon>添加摄像头
        </el-button>
      </div>
    </div>

    <!-- 设备列表 -->
    <div class="device-grid">
      <el-card v-for="camera in cameras" :key="camera._id" class="camera-card">
        <template #header>
          <div class="card-header">
            <span>{{ camera.name }}</span>
            <div class="card-actions">
              <el-button type="primary" link @click="showVideoStream(camera)">
                <el-icon><VideoCamera /></el-icon>
              </el-button>
              <el-button type="primary" link @click="editCamera(camera)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button type="danger" link @click="deleteCamera(camera._id)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </template>
        <div class="card-content">
          <div class="info-item">
            <el-icon><Location /></el-icon>
            <span>{{ camera.location || '未设置位置' }}</span>
          </div>
          <div class="info-item">
            <el-icon><InfoFilled /></el-icon>
            <span>{{ camera.description || '暂无描述' }}</span>
          </div>
          <div class="info-item">
            <el-tag :type="camera.status === 'online' ? 'success' : 'danger'">
              {{ camera.status === 'online' ? '在线' : '离线' }}
            </el-tag>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 添加/编辑摄像头弹窗 -->
    <el-dialog
      v-model="showAddCameraDialog"
      :title="editingCamera ? '编辑摄像头' : '添加摄像头'"
      width="500px"
    >
      <el-form :model="cameraForm" label-width="100px">
        <el-form-item label="设备名称" required>
          <el-input v-model="cameraForm.name" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="位置">
          <el-input v-model="cameraForm.location" placeholder="请输入设备位置" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="cameraForm.description"
            type="textarea"
            placeholder="请输入设备描述"
          />
        </el-form-item>
        <el-form-item label="RTMP地址">
          <el-input v-model="cameraForm.rtmpUrl" placeholder="请输入RTMP推流地址" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddCameraDialog = false">取消</el-button>
          <el-button type="primary" @click="saveCamera">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 视频播放弹窗 -->
    <el-dialog
      v-model="showVideoDialog"
      title="视频监控"
      :width="dialogWidth"
      :fullscreen="isFullscreen"
      destroy-on-close
      class="video-dialog"
      @resize="handleResize"
    >
      <template #header>
        <div class="dialog-header">
          <span>视频监控</span>
          <div class="dialog-actions">
            <el-button-group>
              <el-button size="small" @click="toggleFullscreen">
                <el-icon><FullScreen /></el-icon>
              </el-button>
              <el-button size="small" @click="closeVideoDialog">
                <el-icon><Close /></el-icon>
              </el-button>
            </el-button-group>
          </div>
        </div>
      </template>
      <div class="video-layout">
        <div class="video-main">
          <div class="video-container" :style="{ width: playerWidth + 'px', height: playerHeight + 'px' }">
            <VideoPlayer 
              :camera-id="currentCamera?._id"
              v-model:stream-type="streamType"
              v-model:player-tool="playerTool"
              :scale="videoScale"
            />
          </div>
        </div>
        <div class="video-sidebar" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
          <div class="sidebar-header">
            <span>控制面板</span>
            <el-button 
              size="small" 
              @click="toggleSidebar"
              :icon="isSidebarCollapsed ? 'ArrowRight' : 'ArrowLeft'"
            />
          </div>
          <el-collapse v-model="activeCollapse" v-show="!isSidebarCollapsed">
            <el-collapse-item title="播放器设置" name="player">
              <div class="control-group">
                <div class="control-item">
                  <span>宽度</span>
                  <el-input-number
                    v-model="playerWidth"
                    :min="400"
                    :max="1920"
                    :step="10"
                    @change="updatePlayerSize"
                  />
                </div>
                <div class="control-item">
                  <span>高度</span>
                  <el-input-number
                    v-model="playerHeight"
                    :min="300"
                    :max="1080"
                    :step="10"
                    @change="updatePlayerSize"
                  />
                </div>
                <div class="control-item">
                  <span>缩放</span>
                  <el-slider
                    v-model="videoScale"
                    :min="50"
                    :max="200"
                    :step="10"
                    :format-tooltip="(val) => `${val}%`"
                  />
                </div>
              </div>
            </el-collapse-item>
            <el-collapse-item title="流设置" name="stream">
              <div class="control-group">
                <div class="control-item">
                  <span>流类型</span>
                  <el-radio-group v-model="streamType" size="small">
                    <el-radio-button label="flv">HTTP-FLV</el-radio-button>
                    <el-radio-button label="hls">HLS</el-radio-button>
                    <el-radio-button label="webrtc">WebRTC</el-radio-button>
                  </el-radio-group>
                </div>
                <div class="control-item">
                  <span>播放器</span>
                  <el-radio-group v-model="playerTool" size="small">
                    <el-radio-button label="simple">简易播放器</el-radio-button>
                    <el-radio-button label="xg">西瓜播放器</el-radio-button>
                  </el-radio-group>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </el-dialog>

    <!-- 添加示例摄像头弹窗 -->
    <el-dialog
      v-model="showExampleDialog"
      title="示例摄像头配置"
      width="600px"
    >
      <div class="example-config">
        <h3>Windows 摄像头推流配置</h3>
        <el-alert
          title="请确保已安装 FFmpeg 并配置到系统环境变量"
          type="info"
          :closable="false"
          class="mb-20"
        />
        <el-form label-width="120px">
          <el-form-item label="摄像头名称">
            <el-input v-model="exampleCamera.name" placeholder="请输入摄像头名称" />
          </el-form-item>
          <el-form-item label="摄像头设备">
            <el-input v-model="exampleCamera.videoDevice" placeholder="USB2.0 HD UVC WebCam" />
          </el-form-item>
          <el-form-item label="音频设备">
            <el-input v-model="exampleCamera.audioDevice" placeholder="Microphone (C-Media(R) Audio)" />
          </el-form-item>
          <el-form-item label="分辨率">
            <el-input v-model="exampleCamera.resolution" placeholder="1280x720" />
          </el-form-item>
          <el-form-item label="帧率">
            <el-input-number v-model="exampleCamera.fps" :min="1" :max="60" />
          </el-form-item>
          <el-form-item label="视频码率">
            <el-input v-model="exampleCamera.videoBitrate" placeholder="1024k" />
          </el-form-item>
          <el-form-item label="音频码率">
            <el-input v-model="exampleCamera.audioBitrate" placeholder="128k" />
          </el-form-item>
        </el-form>
        <div class="ffmpeg-command">
          <h4>FFmpeg 推流命令</h4>
          <el-input
            type="textarea"
            :rows="3"
            v-model="ffmpegCommand"
            readonly
          />
          <el-button type="primary" @click="copyCommand" class="mt-10">
            复制命令
          </el-button>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showExampleDialog = false">关闭</el-button>
          <el-button type="primary" @click="saveExampleCamera">保存配置</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import VideoPlayer from '@/components/VideoPlayer.vue';
import {
  getCameras,
  createCamera,
  updateCamera,
  deleteCamera as deleteCameraApi
} from '@/services/apiService';
import { FullScreen, Close } from '@element-plus/icons-vue';

// 数据
const cameras = ref([]);
const showAddCameraDialog = ref(false);
const showVideoDialog = ref(false);
const currentCamera = ref(null);
const editingCamera = ref(null);

// 表单数据
const cameraForm = ref({
  name: '',
  location: '',
  description: '',
  rtmpUrl: ''
});

// 示例摄像头配置
const showExampleDialog = ref(false);
const exampleCamera = ref({
  name: 'Windows摄像头',
  videoDevice: 'USB2.0 HD UVC WebCam',
  audioDevice: 'Microphone (C-Media(R) Audio)',
  resolution: '1280x720',
  fps: 25,
  videoBitrate: '1024k',
  audioBitrate: '128k'
});

// 计算FFmpeg命令
const ffmpegCommand = computed(() => {
  const { videoDevice, audioDevice, resolution, fps, videoBitrate, audioBitrate } = exampleCamera.value;
  const [width, height] = resolution.split('x');
  return `ffmpeg -f dshow -i video="${videoDevice}" -f dshow -i audio="${audioDevice}" -vcodec libx264 -preset ultrafast -pix_fmt yuv420p -g ${fps} -b:v ${videoBitrate} -s ${resolution} -c:a aac -b:a ${audioBitrate} -f flv "rtmp://10.60.90.192/live/livestream?secret=cc1a776e98314022bc58c9f55cc89d9b"`;
});

// 方法
const loadCameras = async () => {
  try {
    const response = await getCameras();
    cameras.value = response.data;
  } catch (error) {
    ElMessage.error('加载摄像头列表失败');
  }
};

const showVideoStream = (camera) => {
  currentCamera.value = camera;
  showVideoDialog.value = true;
};

const editCamera = (camera) => {
  editingCamera.value = camera;
  cameraForm.value = { ...camera };
  showAddCameraDialog.value = true;
};

const saveCamera = async () => {
  try {
    if (editingCamera.value) {
      await updateCamera(editingCamera.value._id, cameraForm.value);
      ElMessage.success('更新成功');
    } else {
      await createCamera(cameraForm.value);
      ElMessage.success('添加成功');
    }
    showAddCameraDialog.value = false;
    loadCameras();
  } catch (error) {
    ElMessage.error(editingCamera.value ? '更新失败' : '添加失败');
  }
};

const deleteCamera = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个摄像头吗？', '提示', {
      type: 'warning'
    });
    await deleteCameraApi(id);
    ElMessage.success('删除成功');
    loadCameras();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

// 添加示例摄像头
const addExampleCamera = () => {
  showExampleDialog.value = true;
};

// 复制命令到剪贴板
const copyCommand = async () => {
  try {
    await navigator.clipboard.writeText(ffmpegCommand.value);
    ElMessage.success('命令已复制到剪贴板');
  } catch (err) {
    ElMessage.error('复制失败');
  }
};

// 保存示例摄像头配置
const saveExampleCamera = async () => {
  try {
    // 转换码率为数字（去掉k/M单位）
    const convertBitrate = (bitrate) => {
      if (typeof bitrate === 'string') {
        const num = parseFloat(bitrate);
        if (bitrate.toLowerCase().endsWith('k')) {
          return num * 1024;
        } else if (bitrate.toLowerCase().endsWith('m')) {
          return num * 1024 * 1024;
        }
        return num;
      }
      return bitrate;
    };

    const cameraData = {
      name: exampleCamera.value.name,
      location: '本地',
      description: 'Windows摄像头推流示例',
      rtmpUrl: 'rtmp://10.60.90.192/live/livestream',
      streamSecret: 'cc1a776e98314022bc58c9f55cc89d9b',
      configuration: {
        resolution: exampleCamera.value.resolution,
        frameRate: exampleCamera.value.fps,
        bitrate: convertBitrate(exampleCamera.value.videoBitrate),
        codec: 'libx264'
      }
    };
    await createCamera(cameraData);
    ElMessage.success('示例摄像头配置已保存');
    showExampleDialog.value = false;
    loadCameras();
  } catch (error) {
    console.error('保存失败:', error);
    ElMessage.error('保存失败: ' + (error.response?.data?.error || error.message));
  }
};

const dialogWidth = ref('800px');
const isFullscreen = ref(false);
const playerWidth = ref(800);
const playerHeight = ref(450);
const activeCollapse = ref(['player', 'stream']);
const streamType = ref('flv');
const playerTool = ref('simple');
const videoScale = ref(100);
const isSidebarCollapsed = ref(false);

const updatePlayerSize = () => {
  // 保持16:9的宽高比
  const aspectRatio = 16 / 9;
  if (playerWidth.value / playerHeight.value > aspectRatio) {
    playerHeight.value = Math.round(playerWidth.value / aspectRatio);
  } else {
    playerWidth.value = Math.round(playerHeight.value * aspectRatio);
  }
  
  // 更新对话框宽度以适应新的播放器尺寸
  dialogWidth.value = `${playerWidth.value + (isSidebarCollapsed.value ? 50 : 300)}px`;
};

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
  updatePlayerSize();
};

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
  if (isFullscreen.value) {
    playerWidth.value = window.innerWidth - (isSidebarCollapsed.value ? 50 : 360);
    playerHeight.value = Math.round((window.innerWidth - (isSidebarCollapsed.value ? 50 : 360)) / (16/9));
  } else {
    playerWidth.value = 800;
    playerHeight.value = 450;
  }
  updatePlayerSize();
};

const handleResize = (width) => {
  dialogWidth.value = width;
};

const closeVideoDialog = () => {
  showVideoDialog.value = false;
  isFullscreen.value = false;
  playerWidth.value = 800;
  playerHeight.value = 450;
};

onMounted(() => {
  loadCameras();
});
</script>

<style scoped>
.video-management {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.device-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.camera-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-card__header) {
  padding: 12px 20px;
}

:deep(.el-card__body) {
  padding: 20px;
}

.example-config {
  padding: 10px;
}

.mb-20 {
  margin-bottom: 20px;
}

.mt-10 {
  margin-top: 10px;
}

.ffmpeg-command {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.ffmpeg-command h4 {
  margin-bottom: 10px;
}

.video-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
    height: auto;
  }
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 10px;
}

.dialog-actions {
  display: flex;
  gap: 8px;
}

.video-layout {
  display: flex;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.video-main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: #000;
  border-right: 1px solid #e4e7ed;
}

.video-sidebar {
  width: 300px;
  background: #f5f7fa;
  border-left: 1px solid #e4e7ed;
  overflow-y: auto;
  transition: width 0.3s ease;
}

.sidebar-collapsed {
  width: 50px;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #e4e7ed;
  background: #fff;
}

.sidebar-header span {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.control-group {
  padding: 15px;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.control-item span {
  color: #606266;
  font-size: 14px;
}

.video-container {
  background: #000;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #e4e7ed;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

:deep(.el-dialog) {
  display: flex;
  flex-direction: column;
  margin: 0 !important;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-height: 90vh;
  max-width: calc(100% - 30px);
  min-width: 400px;
  resize: none;
  overflow: hidden;
}

:deep(.el-dialog.is-fullscreen) {
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  max-width: 100% !important;
  max-height: 100% !important;
  min-width: unset;
}

:deep(.el-dialog__body) {
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: calc(100% - 55px);
}

:deep(.el-collapse-item__header) {
  font-size: 14px;
  font-weight: 500;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-radio-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

:deep(.el-radio-button__inner) {
  padding: 8px 15px;
}

:deep(.el-slider) {
  margin: 0 10px;
}
</style> 