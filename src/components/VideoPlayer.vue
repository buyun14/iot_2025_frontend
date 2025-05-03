<template>
  <div class="video-player">
    <div class="player-wrapper">
      <div class="player-container" ref="playerContainer" :style="{ transform: `scale(${scale / 100})` }">
        <iframe
          v-if="playerUrl"
          :src="playerUrl"
          frameborder="0"
          allowfullscreen
          class="player-frame"
        ></iframe>
        <div v-else-if="loading" class="loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载中...</span>
        </div>
        <div v-else-if="error" class="error">
          <el-icon><Warning /></el-icon>
          <span>{{ error }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { getCameraStreamUrls } from '../services/apiService';
import { Loading, Warning } from '@element-plus/icons-vue';

const props = defineProps({
  cameraId: {
    type: String,
    required: true
  },
  streamType: {
    type: String,
    default: 'flv'
  },
  playerTool: {
    type: String,
    default: 'simple'
  },
  scale: {
    type: Number,
    default: 100
  }
});

const loading = ref(false);
const error = ref(null);
const playerContainer = ref(null);

// 计算播放器URL
const playerUrl = computed(() => {
  if (props.playerTool === 'simple') {
    return getPlayerUrl(props.cameraId, props.streamType);
  } else {
    return getXGPlayerUrl(props.cameraId, props.streamType);
  }
});

const getPlayerUrl = (cameraId, type) => {
  const baseUrl = 'http://10.60.90.192:2022';
  const stream = 'livestream'; // 使用固定的流名称，或从摄像头配置中获取

  switch (type) {
    case 'flv':
      return `${baseUrl}/tools/player.html?url=${baseUrl}/live/${stream}.flv`;
    case 'hls':
      return `${baseUrl}/tools/player.html?url=${baseUrl}/live/${stream}.m3u8`;
    case 'webrtc':
      return `${baseUrl}/players/whep.html?schema=http&port=2022&api=2022&autostart=true&stream=${stream}`;
    default:
      return '';
  }
};

const getXGPlayerUrl = (cameraId, type) => {
  const baseUrl = 'http://10.60.90.192:2022';
  const stream = 'livestream'; // 使用固定的流名称，或从摄像头配置中获取

  switch (type) {
    case 'flv':
      return `${baseUrl}/tools/xgplayer.html?url=${baseUrl}/live/${stream}.flv`;
    case 'hls':
      return `${baseUrl}/tools/xgplayer.html?url=${baseUrl}/live/${stream}.m3u8`;
    default:
      return '';
  }
};

const updateStreamUrl = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await getCameraStreamUrls(props.cameraId);
  } catch (err) {
    error.value = '加载流URL失败';
    console.error('加载流URL错误:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  updateStreamUrl();
});

watch(() => props.cameraId, () => {
  updateStreamUrl();
});

watch(() => [props.streamType, props.playerTool], () => {
  updateStreamUrl();
});
</script>

<style scoped>
.video-player {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.player-wrapper {
  flex: 1;
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.player-container {
  position: relative;
  width: 100%;
  height: 100%;
  transform-origin: center center;
  transition: transform 0.3s ease;
}

.player-frame {
  width: 100%;
  height: 100%;
  border: none;
}

.loading, .error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
}

.loading .el-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.error .el-icon {
  font-size: 24px;
  margin-bottom: 8px;
  color: #f56c6c;
}
</style> 