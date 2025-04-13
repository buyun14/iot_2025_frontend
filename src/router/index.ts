// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import DeviceList from '../views/DeviceList.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'), // 懒加载
    },
    {
      path: '/devices', // 新增路径
      name: 'devices',
      component: DeviceList, // 设备管理页面
    },
  ],
});

export default router;