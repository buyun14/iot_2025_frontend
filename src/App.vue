<!-- src/App.vue -->
<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router';
import { ref, computed } from 'vue';
import {
  HomeFilled,
  Monitor,
  VideoCamera,
  View,
  UserFilled,
  ArrowLeft,
  ArrowRight,
  Share
} from '@element-plus/icons-vue';

const route = useRoute();
const isSidebarCollapsed = ref(false);

const activeMenu = computed(() => route.path);
const currentRouteName = computed(() => {
  const routeMap: Record<string, string> = {
    '/': '首页',
    '/devices': '设备管理',
    '/smart-devices': '智能设备管理',
    '/video': '视频监控',
    '/3d-scene': '3D可视化',
    '/mqtt-topics': 'MQTT主题管理'
  };
  return routeMap[route.path] || '';
});

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};
</script>

<template>
  <div class="app-container">
    <!-- 侧边栏导航 -->
    <div class="sidebar" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <div class="logo-container">
        <img src="@/assets/logo.svg" alt="Logo" class="logo" />
        <span v-if="!isSidebarCollapsed" class="logo-text">IoT Platform</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        :collapse="isSidebarCollapsed"
        router
      >
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <template #title>首页</template>
        </el-menu-item>
        <el-menu-item index="/devices">
          <el-icon><Monitor /></el-icon>
          <template #title>设备管理</template>
        </el-menu-item>
        <el-menu-item index="/smart-devices">
          <el-icon><Monitor /></el-icon>
          <template #title>智能设备管理</template>
        </el-menu-item>
        <el-menu-item index="/mqtt-topics">
          <el-icon><Share /></el-icon>
          <template #title>MQTT主题管理</template>
        </el-menu-item>
        <el-menu-item index="/video">
          <el-icon><VideoCamera /></el-icon>
          <template #title>视频监控</template>
        </el-menu-item>
        <el-menu-item index="/3d-scene">
          <el-icon><View /></el-icon>
          <template #title>3D可视化</template>
        </el-menu-item>
      </el-menu>
      <div class="sidebar-footer">
        <el-button
          type="text"
          @click="toggleSidebar"
          :icon="isSidebarCollapsed ? 'ArrowRight' : 'ArrowLeft'"
        />
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <div class="header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentRouteName }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32" icon="UserFilled" />
              <span class="username">管理员</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人信息</el-dropdown-item>
                <el-dropdown-item>系统设置</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <div class="content">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.sidebar {
  width: 200px;
  min-width: 64px;
  height: 100vh;
  background-color: #304156;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 1000;
}

.sidebar-collapsed {
  width: 64px;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background-color: #2b2f3a;
  flex-shrink: 0;
  border-bottom: 1px solid #263445;
}

.logo {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.logo-text {
  margin-left: 12px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  background-color: transparent;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 220px;
}

.sidebar-menu .el-menu-item {
  color: #bfcbd9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-menu .el-menu-item.is-active {
  color: #409eff;
  background-color: #263445;
}

.sidebar-menu .el-menu-item:hover {
  background-color: #263445;
}

.sidebar-footer {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid #263445;
  flex-shrink: 0;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  margin-left: 200px;
  transition: margin-left 0.3s;
}

.sidebar-collapsed + .main-content {
  margin-left: 64px;
}

.header {
  height: 60px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  min-width: 0;
}

.header-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin-left: 8px;
  color: #606266;
  white-space: nowrap;
}

.content {
  flex: 1;
  padding: 20px;
  overflow: auto;
  background-color: #f0f2f5;
  min-width: 0;
}

:deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
}

:deep(.el-menu-item .el-icon) {
  margin-right: 16px;
}

:deep(.el-breadcrumb) {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .sidebar {
    width: 64px;
  }
  
  .main-content {
    margin-left: 64px;
  }
  
  .logo-text {
    display: none;
  }
  
  .content {
    padding: 10px;
  }
}
</style>