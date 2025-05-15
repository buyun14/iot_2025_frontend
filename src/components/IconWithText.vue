<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  icon: string;
  text: string;
  iconColor?: string;
}>();

const icon = computed(() => props.icon);
const text = computed(() => props.text);
const iconColor = computed(() => props.iconColor || '#000');
</script>

<template>
  <div class="icon-with-text">
    <div class="icon">
      <el-icon :size="24" :color="iconColor">
        <component :is="icon" />
      </el-icon>
    </div>
    <div class="text">{{ text }}</div>
  </div>
</template>

<style scoped>
.icon-with-text {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    overflow: hidden;
    gap: 8px;
}

.icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.text {
    font-size: 14px;
    color: #bfcbd9;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
}
</style>
