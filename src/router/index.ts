import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import DeviceList from '../views/DeviceList.vue';
import Scene3DView from '../views/Scene3DView.vue'; // 导入新页面

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
      path: '/devices', // 设备管理页面
      name: 'devices',
      component: DeviceList,
    },
    {
      path: '/3d-scene', // 新增路径
      name: '3d-scene',
      component: Scene3DView, // 3D 可视化页面
    },
  ],
});

export default router;