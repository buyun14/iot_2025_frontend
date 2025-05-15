<!-- src/App.vue -->
<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';
import { ref, computed } from 'vue';
import IconWithText from '@/components/IconWithText.vue';

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
    '/mqtt-topics': 'MQTT主题管理',
  };
  return routeMap[route.path] || '';
});

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

const menuItems: Array<{ index: string; icon: string; title: string }> = [
  {
    index: '/',
    icon: 'HomeFilled',
    title: '首页'
  },
  {
    index: '/devices',
    icon: 'Monitor',
    title: '设备管理'
  },
  {
    index: '/mqtt-topics',
    icon: 'Share',
    title: 'MQTT主题管理'
  },
  {
    index: '/smart-devices',
    icon: 'Share',
    title: '智能设备管理'
  },
  {
    index: '/video',
    icon: 'VideoCamera',
    title: '视频监控'
  },
  {
    index: '/3d-scene',
    icon: 'View',
    title: '3D可视化'
  }
]

</script>

<template>
  <el-container class="app-container">
    <el-aside class="sidebar" :class="{ 'sidebar--collapsed': isSidebarCollapsed }">
      <el-container class="sidebar__container">
        <el-header class="sidebar__header">
          <IconWithText icon="LogoIcon" text="IoT 智慧家居" />
        </el-header>
        <el-main class="sidebar__content">
          <el-menu
            :default-active="activeMenu"
            class="sidebar__menu"
            :collapse="isSidebarCollapsed"
            router
          >
            <el-menu-item v-for="item in menuItems" :key="item.index" :index="item.index">
              <IconWithText :icon="item.icon" :text="item.title" />
            </el-menu-item>
          </el-menu>
        </el-main>
        <el-footer class="sidebar__footer">
          <el-button class="sidebar-toggle-button"
            type="text"
            @click="toggleSidebar"
            :icon="isSidebarCollapsed ? 'ArrowRight' : 'ArrowLeft'"
          />
        </el-footer>
      </el-container>
    </el-aside>
    <el-main class="main">
      <el-container>
        <el-header class="main__header">
          <div class="main__header-left">
            <div class="breadcrumb-container">
              <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
                <el-breadcrumb-item>{{ currentRouteName }}</el-breadcrumb-item>
              </el-breadcrumb>
            </div>
          </div>
          <div class="main__header-right">
            <el-dropdown>
              <span class="user-info">
                <el-avatar :size="32" icon="UserFilled" />
                <span class="user-info__name">管理员</span>
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
        </el-header>
        <el-main class="main__content">
          <RouterView />
        </el-main>
      </el-container>
    </el-main>
  </el-container>
</template>

<style scoped>
.app-container {
  height: 100vh;
  width: 100vw;
  padding: 0;
  overflow: hidden;
}

.sidebar {
  height: 100vh;
  width: 200px;
  transition: width 0.3s;
  background-color: #304156;
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
  overflow: hidden;
}

.sidebar--collapsed {
  width: 64px;
}

.sidebar__container {
  height: 100%;
  width: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar__header {
  height: 60px;
  width: 100%;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.sidebar__content {
  padding: 0;
  height: calc(100% - 100px);
  overflow: hidden;
}

.sidebar__menu {
  border-right: none;
  background-color: transparent;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar__menu-item {
  color: #bfcbd9;
}

.sidebar__menu-item.is-active {
  color: #409eff;
  background-color: #263445;
}

.sidebar__menu-item:hover {
  background-color: #263445;
}

/* 添加未激活状态下的图标颜色样式 */
.sidebar__menu :deep(.el-icon) {
  color: #ffffff;
}

.sidebar__menu .is-active :deep(.el-icon) {
  color: #409eff;
}

.sidebar__footer {
  height: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.main {
  padding: 0;
  background-color: #f0f2f5;
}

.main__header {
  height: 60px;
  padding: 0 20px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.main__header-left {
  display: flex;
  align-items: center;
}

.breadcrumb-container {
  padding: 8px 16px;
}

.main__header-right {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.user-info__name {
  margin-left: 8px;
  font-size: 14px;
  color: #606266;
}

.main__content {
  padding: 20px;
  height: calc(100vh - 60px);
  overflow-y: auto;
}
</style>
